use anyhow::{Context, Result};
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;

#[derive(Debug, Clone)]
struct Config {
    firebase_database_url: Option<String>,
    firebase_auth_token: Option<String>,
    bitcoin_api_base: String,
    bitcoin_addresses: Vec<String>,
    solana_rpc_url: String,
    solana_addresses: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortfolioAsset {
    id: String,
    network: String,
    symbol: String,
    asset: String,
    balance: String,
    decimals: u8,
    wallet_address: String,
    source: String,
    execution: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PortfolioSummary {
    asset_count: usize,
    observed_networks: Vec<String>,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
struct BitcoinAddressStats {
    funded_txo_sum: u64,
    spent_txo_sum: u64,
}

#[derive(Debug, Deserialize)]
struct BitcoinAddressResponse {
    chain_stats: BitcoinAddressStats,
    mempool_stats: BitcoinAddressStats,
}

#[derive(Debug, Deserialize)]
struct SolanaBalanceValue {
    value: u64,
}

#[derive(Debug, Deserialize)]
struct SolanaBalanceResponse {
    result: SolanaBalanceValue,
}

impl Config {
    fn from_env() -> Self {
        Self {
            firebase_database_url: env::var("FIREBASE_DATABASE_URL").ok(),
            firebase_auth_token: env::var("FIREBASE_DATABASE_AUTH_TOKEN").ok(),
            bitcoin_api_base: env::var("BITCOIN_API_BASE")
                .unwrap_or_else(|_| "https://mempool.space/api".to_string()),
            bitcoin_addresses: csv_env("BITCOIN_ADDRESSES"),
            solana_rpc_url: env::var("SOLANA_RPC_URL")
                .unwrap_or_else(|_| "https://api.mainnet-beta.solana.com".to_string()),
            solana_addresses: csv_env("SOLANA_ADDRESSES"),
        }
    }
}

fn csv_env(key: &str) -> Vec<String> {
    env::var(key)
        .unwrap_or_default()
        .split(',')
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .collect()
}

fn now_iso() -> String {
    Utc::now().to_rfc3339()
}

fn observer_id(network: &str, symbol: &str, wallet_address: &str) -> String {
    format!(
        "{}_{}_{}",
        network.to_lowercase(),
        symbol.to_lowercase(),
        wallet_address.to_lowercase()
    )
}

async fn fetch_bitcoin_asset(client: &Client, config: &Config, address: &str) -> Result<PortfolioAsset> {
    let url = format!(
        "{}/address/{}",
        config.bitcoin_api_base.trim_end_matches('/'),
        urlencoding::encode(address)
    );

    let response = client
        .get(url)
        .send()
        .await
        .context("bitcoin observer request failed")?
        .error_for_status()
        .context("bitcoin observer returned a non-success status")?
        .json::<BitcoinAddressResponse>()
        .await
        .context("bitcoin observer response could not be parsed")?;

    let confirmed = response
        .chain_stats
        .funded_txo_sum
        .saturating_sub(response.chain_stats.spent_txo_sum);
    let mempool = response
        .mempool_stats
        .funded_txo_sum
        .saturating_sub(response.mempool_stats.spent_txo_sum);
    let balance_sats = confirmed.saturating_add(mempool);

    Ok(PortfolioAsset {
        id: observer_id("bitcoin", "BTC", address),
        network: "Bitcoin".to_string(),
        symbol: "BTC".to_string(),
        asset: "Bitcoin".to_string(),
        balance: balance_sats.to_string(),
        decimals: 8,
        wallet_address: address.to_string(),
        source: "Observer".to_string(),
        execution: "Read-only".to_string(),
        updated_at: now_iso(),
    })
}

async fn fetch_solana_asset(client: &Client, config: &Config, address: &str) -> Result<PortfolioAsset> {
    let response = client
        .post(&config.solana_rpc_url)
        .json(&json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address]
        }))
        .send()
        .await
        .context("solana observer request failed")?
        .error_for_status()
        .context("solana observer returned a non-success status")?
        .json::<SolanaBalanceResponse>()
        .await
        .context("solana observer response could not be parsed")?;

    Ok(PortfolioAsset {
        id: observer_id("solana", "SOL", address),
        network: "Solana".to_string(),
        symbol: "SOL".to_string(),
        asset: "Solana".to_string(),
        balance: response.result.value.to_string(),
        decimals: 9,
        wallet_address: address.to_string(),
        source: "Observer".to_string(),
        execution: "Read-only".to_string(),
        updated_at: now_iso(),
    })
}

async fn publish_to_rtdb(
    client: &Client,
    config: &Config,
    assets: &[PortfolioAsset],
    summary: &PortfolioSummary,
) -> Result<()> {
    let Some(database_url) = &config.firebase_database_url else {
        println!("{}", serde_json::to_string_pretty(&(assets, summary))?);
        return Ok(());
    };

    for asset in assets {
        let path = format!(
            "{}/portfolio_live/assets/{}.json",
            database_url.trim_end_matches('/'),
            asset.id
        );

        let mut request = client.put(path).json(asset);
        if let Some(token) = &config.firebase_auth_token {
            request = request.query(&[("auth", token)]);
        }

        request
            .send()
            .await
            .context("failed to publish asset snapshot to RTDB")?
            .error_for_status()
            .context("RTDB rejected asset snapshot")?;
    }

    let summary_path = format!(
        "{}/portfolio_live/summary.json",
        database_url.trim_end_matches('/')
    );

    let mut summary_request = client.put(summary_path).json(summary);
    if let Some(token) = &config.firebase_auth_token {
        summary_request = summary_request.query(&[("auth", token)]);
    }

    summary_request
        .send()
        .await
        .context("failed to publish portfolio summary to RTDB")?
        .error_for_status()
        .context("RTDB rejected portfolio summary")?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    let config = Config::from_env();
    let client = Client::builder()
        .user_agent("utg-chain-observer/0.1.0")
        .build()
        .context("failed to build HTTP client")?;

    let mut assets = Vec::new();

    for address in &config.bitcoin_addresses {
        match fetch_bitcoin_asset(&client, &config, address).await {
            Ok(asset) => assets.push(asset),
            Err(error) => eprintln!("bitcoin observer skipped {}: {error}", address),
        }
    }

    for address in &config.solana_addresses {
        match fetch_solana_asset(&client, &config, address).await {
            Ok(asset) => assets.push(asset),
            Err(error) => eprintln!("solana observer skipped {}: {error}", address),
        }
    }

    let mut observed_networks = assets
        .iter()
        .map(|asset| asset.network.clone())
        .collect::<Vec<_>>();
    observed_networks.sort();
    observed_networks.dedup();

    let summary = PortfolioSummary {
        asset_count: assets.len(),
        observed_networks,
        updated_at: now_iso(),
    };

    publish_to_rtdb(&client, &config, &assets, &summary).await?;
    Ok(())
}

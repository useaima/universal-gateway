// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {TreasuryReceiver} from "../src/TreasuryReceiver.sol";
import {PolicyRegistry} from "../src/PolicyRegistry.sol";
import {ExecutionReceiptRegistry} from "../src/ExecutionReceiptRegistry.sol";

contract DeployUTGSuite is Script {
    function run()
        external
        returns (
            TreasuryReceiver treasury,
            PolicyRegistry policyRegistry,
            ExecutionReceiptRegistry receiptRegistry
        )
    {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address settlementToken = vm.envAddress("SETTLEMENT_TOKEN");
        address treasuryOperator = vm.envAddress("TREASURY_OPERATOR");
        address policyAdmin = vm.envAddress("POLICY_ADMIN");

        vm.startBroadcast(deployerKey);

        treasury = new TreasuryReceiver(settlementToken, treasuryOperator);
        policyRegistry = new PolicyRegistry(policyAdmin);
        receiptRegistry = new ExecutionReceiptRegistry(policyAdmin);

        vm.stopBroadcast();
    }
}

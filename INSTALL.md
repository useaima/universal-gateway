# Installation Notes

The canonical setup guide now lives in two places:

- [README.md](README.md) for the fast path
- [utg.useaima.com/docs](https://utg.useaima.com/docs) for the full self-hosting walkthrough

For a truthful production setup, use the docs site and validate the same support tiers the runtime enforces:

- `stable`: Base/Ethereum transfers, HITL, MCP integration, dashboard telemetry
- `beta`: commerce and browser handover with configured providers
- `experimental`: M-Pesa and fiat-adjacent rails

Basic install:

```bash
pip install .
python src/gateway/utils/setup_validator.py
python src/gateway/server.py
```

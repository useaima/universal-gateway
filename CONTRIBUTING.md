# Contributing to UTG GaaS

First off, thank you for considering contributing to the Universal Transaction Gateway! It's people like you that make open-source development so powerful.

As an enterprise-grade protocol, we strive for high-quality, high-consistency (CP) code. Please review these guidelines before submitting a pull request.

## Code of Conduct

By participating, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/universal-gateway.git
   cd universal-gateway
   ```
3. **Set up the development environment**:
   We provide a `Makefile` for convenience (Unix/Mac/WSL) or use `pip`:
   ```bash
   # Using Make
   make venv
   source .venv/bin/activate
   make install

   # OR Using pip directly
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -e .[dev]
   ```
4. **Install Browsers (Playwright)**:
   ```bash
   python -m playwright install
   ```

## Development Workflow

### 1. Branching
Create a branch for your feature or bug fix:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

### 2. Making Changes
- Follow the PEP 8 style guide for Python code.
- Ensure that any modifications to the `execution_wrapper.py` or handling of financial logic strictly adhere to the `X-Idempotency-Key` and Durable Saga patterns described in the [Documentation](DOCUMENTATION.md).
- **Consistency over Availability**: If you are adding a new skill, ensure that on network failure, it fails safely (Rollback) rather than corrupting state.

### 3. Testing
We are actively building our test suite. Before submitting a PR, ensure that relevant automated tests run and any new logic has tests written.
*(Currently, manual verification scripts reside in `scripts/`)*.

### 4. Commit Messages
Write clear, concise commit messages. 
- Bad: `fixed bug`
- Good: `fix(core): Address race condition in idempotency lock check`

### 5. Pull Requests
- Open a Pull Request against the `main` branch.
- Fill out the provided Pull Request template completely.
- Ensure tests and linting pass (if configured).

## Adding New Skills (MCP Tools)
If adding a new MCP tool/skill:
1. Create a new file in `src/gateway/skills/`.
2. Inherit/implement the necessary interfaces.
3. Ensure it registers properly in `src/gateway/server.py`.

Thank you for contributing to the future of Agentic Commerce!

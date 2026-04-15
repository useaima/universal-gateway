.PHONY: install dev-install test lint format clean

# Install the package globally
install:
	pip install .

# Install for development, including testing tools
dev-install:
	pip install -e .[dev]

# Run basic tests (assuming pytest is used)
test:
	pytest tests/

# Format code according to basic standards (requires black)
format:
	black src/ tests/

# Remove temporary python/build artifacts
clean:
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# Start the Onboarding Wizard
onboard:
	utg-onboard

# Start the Gateway Server standalone (for debugging)
run:
	utg-server

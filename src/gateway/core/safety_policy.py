from typing import List, Dict, Optional
import os
import re
import json
from urllib.parse import urlparse
from core.audit_logger import AuditLogger

class SafetyPolicy:
    def __init__(self):
        domains = os.environ.get("ALLOWED_DOMAINS", "")
        self.allowed_domains = [d.strip().lower() for d in domains.split(",") if d.strip()]
        self.max_limit = float(os.environ.get("MAX_TRANSACTION_LIMIT", "50.0"))

    def is_domain_allowed(self, url: str) -> bool:
        """Checks if the target domain is explicitly in the Allowed list and enforces HTTPS."""
        parsed = urlparse(url)
        if parsed.scheme.lower() != 'https':
            return False
            
        netloc = parsed.netloc.lower()
        if not netloc:
            return False
            
        # Handle subdomains like www.amazon.com
        for allowed in self.allowed_domains:
            if netloc == allowed or netloc.endswith(f".{allowed}"):
                return True
        return False

    def validate_price(self, text_price: str) -> float:
        """Parses price robustly using price-parser and throws an Exception if over limit."""
        from price_parser import Price
        price = Price.fromstring(text_price)
        if price.amount is None:
            raise ValueError(f"Could not parse valid price from '{text_price}'")
            
        amount = float(price.amount)
        if amount > self.max_limit:
            raise ValueError(f"Safety Sandwich Violation: Amount ${amount} exceeds limit of ${self.max_limit}")
        return amount

    async def safe_fill(self, page, selector: str, text: str, logger: AuditLogger):
        """
        Intercepts Playwright fill events. 
        Validates the text input before interacting with the browser.
        Logs violations to the DB automatically.
        """
        try:
            # We attempt to treat the incoming text as a financial value if possible
            # If it's pure text gracefully allowed, we can customize validation.
            # In this context, everything passed here is treated as an amount or analyzed strictly.
            amount = self.validate_price(text)
            
            # If safe, forward to native Playwright execution
            await page.fill(selector, text)
            
        except ValueError as e:
            # Hard-block by Safety Sandwich Limit, prevent page.fill()
            logger.log_action(
                tool_name="SAFETY_VIOLATION",
                arguments={"selector": selector, "attempted_value": text, "error": str(e)},
                result="BLOCKED_BY_LIMIT"
            )
            raise e

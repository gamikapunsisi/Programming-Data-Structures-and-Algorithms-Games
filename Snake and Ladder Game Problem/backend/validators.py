# validators.py
import re

def validate_n(n):
    if not isinstance(n, int):
        raise ValueError("N must be a number")
    if n < 6 or n > 12:
        raise ValueError("N must be between 6 and 12")
    return n


def validate_save_result(data):
    # Check required fields
    if "name" not in data or not data["name"].strip():
        raise ValueError("Player name is required")

    if "result" not in data or not data["result"].strip():
        raise ValueError("Result is required")

    name = data["name"].strip()

    # Name must contain only letters (and spaces)
    if not re.match(r'^[A-Za-z ]+$', name):
        raise ValueError("Player name must contain only letters")

    return data

"""Helpers to coerce tool-call arguments that Groq models sometimes stringify.

Some Groq-hosted models (observed on llama-3.3-70b-versatile) emit integer
arguments as strings (e.g. `{"hcp_id": "1"}` instead of `{"hcp_id": 1}`) even
when the schema asks for integers. Groq's server-side validator used to accept
this; now it rejects. So we declare `int | str` in signatures and coerce here.
"""
from __future__ import annotations


def as_int(value: int | str, *, field: str) -> int:
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    if isinstance(value, str):
        try:
            return int(value.strip())
        except ValueError as e:
            raise ValueError(f"{field} must be an integer, got {value!r}") from e
    raise ValueError(f"{field} must be an integer, got {type(value).__name__}")


def as_opt_int(value: int | str | None, *, field: str) -> int | None:
    if value is None or value == "":
        return None
    return as_int(value, field=field)

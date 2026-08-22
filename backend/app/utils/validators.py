"""
File validation utilities.
"""

from app.core.config import settings


def validate_file(filename: str, size_bytes: int) -> None:
    """
    Raises ValueError with a user-friendly message on validation failure.
    """
    if not filename:
        raise ValueError("No filename provided.")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in settings.allowed_extensions:
        raise ValueError(
            f"Unsupported file type '.{ext}'. "
            f"Please upload a PDF, PNG, or JPG file."
        )

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValueError(
            f"File too large ({size_bytes // (1024*1024)} MB). "
            f"Maximum allowed size is {settings.max_file_size_mb} MB."
        )

    if size_bytes == 0:
        raise ValueError("The uploaded file is empty.")

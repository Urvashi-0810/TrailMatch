from __future__ import annotations

import os
import sys
import base64
from pathlib import Path
from loguru import logger

# Configure logging
log_path = Path("logs") / "clinical_trial_engine.log"
log_path.parent.mkdir(parents=True, exist_ok=True)

logger.remove()
logger.add(
    sys.stderr,
    format="<level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    log_path,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="DEBUG",
    rotation="500 MB"
)

# Expose logger for import
__all__ = ["logger"]

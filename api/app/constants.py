from enum import Enum


class TranscriptionState(Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class WhisperModels(Enum):
    TINY = "tiny"
    TINY_EN = "tiny.en"
    BASE = "base"
    BASE_EN = "base.en"
    SMALL = "small"
    SMALL_EN = "small.en"
    MEDIUM = "medium"
    MEDIUM_EN = "medium.en"
    LARGE = "large"


class NeMoConfigs(Enum):
    GENERAL = "GENERAL"
    MEETING = "MEETING"
    TELEPHONIC = "TELEPHONIC"
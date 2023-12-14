import subprocess


def audio_convert(
    input_path: str,
    output_path: str,
    format: str,
    start: int = 0,
    end: int | None = None,
    channels: int | None = None,
    sample_rate: int | None = None,
) -> None:
    subprocess.run([
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-f", format,
        "-ss", str(start),
        *(["-to", str(end)] if end else []),
        *(["-ac", str(channels)] if channels else []),
        *(["-ar", str(sample_rate)] if sample_rate else []),
        output_path
    ], check=True)


def audio_duration_seconds(input_path: str) -> float:
    output = subprocess.check_output([
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        input_path
    ])
    seconds = output.decode().strip()
    return float(seconds)
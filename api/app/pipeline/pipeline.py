import glob
import json
import tempfile
from pathlib import Path
from tempfile import NamedTemporaryFile

import pandas as pd
import whisper
from decouple import config
from nemo.collections.asr.models import ClusteringDiarizer
from omegaconf import OmegaConf

from constants import NeMoConfigs
from db.models import Transcription
from utils import audio_convert

MODELS_STORAGE_PATH = config("MODELS_STORAGE_PATH")


def run_pipeline(transcription: Transcription) -> dict:
    with NamedTemporaryFile(suffix=".wav", delete=True) as temp_file:
        audio_convert(
            input_path=transcription.recording.get_path(),
            output_path=temp_file.name,
            format="wav",
            channels=1,
            sample_rate=16000,
        )

        whisper_model = whisper.load_model(
            name=transcription.whisper_model.value,
            download_root=MODELS_STORAGE_PATH,
        )
        transcript = whisper_model.transcribe(
            audio=temp_file.name,
            word_timestamps=transcription.identify_speakers,
        )
        del whisper_model

        if transcription.identify_speakers:
            segments = identify_speakers(
                audio_filepath=temp_file.name,
                num_speakers=transcription.num_speakers,
            )
            speaker_segments, num_speakers = process_segments(segments, transcript)
            transcript["speaker_segments"] = speaker_segments
            transcript["num_speakers"] = num_speakers
        else:
            transcript["speaker_segments"] = None
            transcript["num_speakers"] = None
        
        return transcript


def process_segments(raw_segments: list, transcript: dict) -> tuple[dict, int]:
    speakers = set()
    merged_segments = [raw_segments[0]]
    for segment in raw_segments[1:]:
        speakers.add(segment["speaker"])
        if merged_segments[-1]["speaker"] == segment["speaker"]:
            merged_segments[-1]["duration"] += segment["duration"]
        else:
            merged_segments.append(segment)

    segments = []
    for segment in merged_segments:
        text = ""
        end = segment["start"] + segment["duration"]
        for transcript_segments in transcript["segments"]:
            for word_segment in transcript_segments["words"]:
                if segment["start"] <= word_segment["end"] <= end:
                    text += word_segment["word"]
        if text := text.strip():
            segments.append({
                "speaker": segment["speaker"].capitalize().replace("_", " "),
                "start": segment["start"],
                "end": end,
                "text": text,
            })

    return segments, len(speakers)


def identify_speakers(
    audio_filepath: str,
    num_speakers: int | None = None,
    nemo_config: NeMoConfigs | None = None,
) -> list:
    with NamedTemporaryFile(mode="w", suffix=".json") as input_manifest:
        json.dump({
            "audio_filepath": audio_filepath,
            "num_speakers": num_speakers,
            "text": "-",
            "label": "infer",
            "offset": 0.0,
            "duration": None,
            "rttm_filepath": None,
            "uem_filepath": None,
        }, input_manifest)
        input_manifest.flush()

        with tempfile.TemporaryDirectory() as out_dir:
            config_dir = Path(__file__).absolute().parent / "config"

            if nemo_config == NeMoConfigs.MEETING:
                config = OmegaConf.load(config_dir / "diar_infer_meeting.yaml")
            elif nemo_config == NeMoConfigs.TELEPHONIC:
                config = OmegaConf.load(config_dir / "diar_infer_telephonic.yaml")
            else:
                config = OmegaConf.load(config_dir / "diar_infer_general.yaml")

            config.diarizer.out_dir = out_dir
            config.diarizer.manifest_filepath = input_manifest.name
            config.diarizer.vad.model_path = \
                f"{MODELS_STORAGE_PATH}/vad_multilingual_marblenet.nemo"
            config.diarizer.speaker_embeddings.model_path = \
                f"{MODELS_STORAGE_PATH}/titanet-l.nemo"
            config.diarizer.msdd_model.model_path = \
                f"{MODELS_STORAGE_PATH}/diar_msdd_telephonic.nemo"
            
            model = ClusteringDiarizer(cfg=config)
            model.diarize()
            del model

            rttm_files = glob.glob(f"{out_dir}/pred_rttms/*.rttm")
            segments = pd.read_csv(
                rttm_files[0],
                delim_whitespace=True,
                keep_default_na=False,
                names=[
                    "NA1",
                    "NA2",
                    "NA3",
                    "start",
                    "duration",
                    "NA4",
                    "NA5",
                    "speaker",
                    "NA6",
                    "NA7",
                ],
                usecols=[
                    "start",
                    "duration",
                    "speaker"
                ],
                dtype={
                    "start": float,
                    "duration": float,
                    "speaker": str,
                },
            )
            return segments.to_dict("records")

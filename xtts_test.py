import torch
from TTS.api import TTS

print("GPU:", torch.cuda.get_device_name(0))

tts = TTS(
    "tts_models/multilingual/multi-dataset/xtts_v2"
).to("cuda")

tts.tts_to_file(
    text="Hello, I am Priya. This is a test of my female character voice.",
    speaker_wav="voices/female/female_converted.wav",
    language="en",
    file_path="output/female_test.wav"
)

print("Female audio generated successfully!")
print("Output: output/female_test.wav")

import json
import os
from TTS.api import TTS

with open("characters/characters.json", "r") as f:
    characters = json.load(f)

print("Loading XTTS-v2...")

tts = TTS(
    "tts_models/multilingual/multi-dataset/xtts_v2"
).to("cuda")

print("XTTS-v2 loaded on GPU")


def generate_voice(character_id, text, output_file):

    if character_id not in characters:
        raise ValueError(f"Character ID {character_id} not found")

    character = characters[character_id]

    name = character["name"]
    voice_id = character["voice_id"]
    reference = character["reference"]

    print(f"Character: {name}")
    print(f"Character ID: {character_id}")
    print(f"Voice ID: {voice_id}")
    print(f"Reference: {reference}")

    if not os.path.exists(reference):
        raise FileNotFoundError(f"Voice reference not found: {reference}")

    print("Generating speech...")

    tts.tts_to_file(
        text=text,
        speaker_wav=reference,
        language="en",
        file_path=output_file
    )

    print(f"Audio generated: {output_file}")


if __name__ == "__main__":

    import sys

    if len(sys.argv) != 4:
        print("Usage:")
        print("python voice_engine/voice_engine.py <CharacterID> <Text> <OutputFile>")
        sys.exit(1)

    character_id = sys.argv[1]
    text = sys.argv[2]
    output_file = sys.argv[3]

    generate_voice(
        character_id,
        text,
        output_file
    )

import json
import os
from TTS.api import TTS

STORY_FILE = "output/story.json"
CHARACTER_DB = "characters/characters.json"
OUTPUT_DIR = "output/audio"


# Load character database
with open(CHARACTER_DB, "r") as f:
    characters = json.load(f)

# Load story
with open(STORY_FILE, "r") as f:
    story = json.load(f)

language = story.get("language", "en")
print(f"Story language: {language}")

print("Loading XTTS-v2...")

tts = TTS(
    "tts_models/multilingual/multi-dataset/xtts_v2"
).to("cuda")

print("XTTS-v2 loaded on GPU")


def generate_audio(character_id, text, output_file):

    if character_id not in characters:
        raise ValueError(
            f"Character ID {character_id} not found"
        )

    character = characters[character_id]

    name = character["name"]
    reference = character["reference"]

    print(f"\nGenerating:")
    print(f"Character: {name}")
    print(f"ID: {character_id}")
    print(f"Text: {text}")

    if not os.path.exists(reference):
        raise FileNotFoundError(
            f"Voice reference not found: {reference}"
        )

    tts.tts_to_file(
        text=text,
        speaker_wav=reference,
        language=language,
        file_path=output_file
    )

    print(f"Saved: {output_file}")


# ============================================================
# MAIN
# ============================================================

with open(STORY_FILE, "r") as f:
    story = json.load(f)


os.makedirs(OUTPUT_DIR, exist_ok=True)


for scene in story["scenes"]:

    scene_id = scene["scene_id"]

    print("\n" + "=" * 60)
    print(f"SCENE {scene_id}")
    print("=" * 60)

    # --------------------------------------------------------
    # NARRATION
    # --------------------------------------------------------

    narration = scene.get("narration", "").strip()

    if narration:

        output_file = os.path.join(
            OUTPUT_DIR,
            f"scene_{scene_id:02d}_narration.wav"
        )

        generate_audio(
            "N001",
            narration,
            output_file
        )

    # --------------------------------------------------------
    # CHARACTER DIALOGUE
    # --------------------------------------------------------

    for index, dialogue in enumerate(
        scene.get("dialogue", []),
        start=1
    ):

        character_id = dialogue["character_id"]
        text = dialogue["text"].strip()

        output_file = os.path.join(
            OUTPUT_DIR,
            f"scene_{scene_id:02d}_{character_id}_{index:02d}.wav"
        )

        generate_audio(
            character_id,
            text,
            output_file
        )


print("\n" + "=" * 60)
print("ALL AUDIO GENERATED SUCCESSFULLY!")
print("=" * 60)

print(f"\nAudio files are in:")
print(OUTPUT_DIR)

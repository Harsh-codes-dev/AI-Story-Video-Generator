import json
import os
import random
from TTS.api import TTS

SESSION_DIR = os.environ.get("SESSION_DIR", "output")
STORY_FILE = os.path.join(SESSION_DIR, "story.json")
OUTPUT_DIR = os.path.join(SESSION_DIR, "audio")

print("\nLoading XTTS-v2...")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")
print("XTTS-v2 loaded on GPU")

# Get actual available speakers directly from the model
available_speakers = getattr(tts, "speakers", [])
if not available_speakers:
    print("Warning: No speakers found in TTS model. Defaulting to blank.")
    available_speakers = [""]

# Shuffle so every video gets unique voices
random.shuffle(available_speakers)

# Load story
with open(STORY_FILE, "r") as f:
    story = json.load(f)

language = story.get("language", "en")
print(f"Story language: {language}")

# Assign random voices from the ACTUAL model speakers
character_voices = {}

# Assign Narrator (use the first available speaker)
character_voices["N001"] = available_speakers[0]
speaker_idx = 1

for char in story.get("characters", []):
    character_voices[char["character_id"]] = available_speakers[speaker_idx % len(available_speakers)]
    speaker_idx += 1

print("\nAssigned Voices:")
for cid, voice in character_voices.items():
    print(f"  {cid}: {voice}")

def generate_audio(character_id, text, output_file):
    speaker = character_voices.get(character_id, available_speakers[0])
    print(f"\nGenerating Audio -> ID: {character_id} | Voice: {speaker}")
    print(f"Text: {text}")

    # Use built-in speaker instead of speaker_wav reference file
    tts.tts_to_file(
        text=text,
        speaker=speaker,
        language=language,
        file_path=output_file
    )
    print(f"Saved: {output_file}")

# ============================================================
# MAIN
# ============================================================
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
        output_file = os.path.join(OUTPUT_DIR, f"scene_{scene_id:02d}_narration.wav")
        generate_audio("N001", narration, output_file)

    # --------------------------------------------------------
    # CHARACTER DIALOGUE
    # --------------------------------------------------------
    for index, dialogue in enumerate(scene.get("dialogue", []), start=1):
        character_id = dialogue["character_id"]
        text = dialogue["text"].strip()
        output_file = os.path.join(OUTPUT_DIR, f"scene_{scene_id:02d}_{character_id}_{index:02d}.wav")
        generate_audio(character_id, text, output_file)

print("\n" + "=" * 60)
print("ALL AUDIO GENERATED SUCCESSFULLY!")
print("=" * 60)

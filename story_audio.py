import json
import os
import random
from TTS.api import TTS

STORY_FILE = "output/story.json"
OUTPUT_DIR = "output/audio"

# XTTS-v2 Built-in Speakers
MALE_VOICES = ["Craig Gutsy", "Damien Black", "Royston Shirle", "Andrew Chipper", "Badr Odhiambo"]
FEMALE_VOICES = ["Ana Florence", "Claribel Dervla", "Daisy Studious", "Gracie Wise", "Tammie Ema"]
NARRATOR_VOICE = "Tennen Ishikawa"

# Load story
with open(STORY_FILE, "r") as f:
    story = json.load(f)

language = story.get("language", "en")
print(f"Story language: {language}")

# Assign random XTTS voices to the invented characters based on gender
character_voices = {"N001": NARRATOR_VOICE}
m_idx, f_idx = 0, 0
random.shuffle(MALE_VOICES)
random.shuffle(FEMALE_VOICES)

for char in story.get("characters", []):
    if char.get("gender", "male").lower() == "female":
        character_voices[char["character_id"]] = FEMALE_VOICES[f_idx % len(FEMALE_VOICES)]
        f_idx += 1
    else:
        character_voices[char["character_id"]] = MALE_VOICES[m_idx % len(MALE_VOICES)]
        m_idx += 1

print("\nAssigned Voices:")
for cid, voice in character_voices.items():
    print(f"  {cid}: {voice}")

print("\nLoading XTTS-v2...")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")
print("XTTS-v2 loaded on GPU")

def generate_audio(character_id, text, output_file):
    speaker = character_voices.get(character_id, MALE_VOICES[0])
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

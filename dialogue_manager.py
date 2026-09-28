import json
import os
import sys

from TTS.api import TTS


# ==========================================
# Configuration
# ==========================================

CHARACTER_DB = "characters/characters.json"

NARRATOR_REFERENCE = "voices/narrator/narrator.wav"

OUTPUT_DIR = "output/dialogue"


# ==========================================
# Load Character Database
# ==========================================

if not os.path.exists(CHARACTER_DB):

    print(f"Character database not found: {CHARACTER_DB}")
    sys.exit(1)


with open(CHARACTER_DB, "r") as f:

    characters = json.load(f)


# ==========================================
# Create Output Directory
# ==========================================

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ==========================================
# Check Narrator Reference
# ==========================================

if not os.path.exists(NARRATOR_REFERENCE):

    print(f"Narrator reference not found: {NARRATOR_REFERENCE}")
    sys.exit(1)


# ==========================================
# Load XTTS-v2 ONCE
# ==========================================

print("Loading XTTS-v2...")

tts = TTS(
    "tts_models/multilingual/multi-dataset/xtts_v2"
).to("cuda")

print("XTTS-v2 loaded on GPU")


# ==========================================
# Find Character
# ==========================================

def find_character(name):

    for character_id, character in characters.items():

        if character["name"].lower() == name.lower():

            return character_id

    return None


# ==========================================
# Generate Narration
# ==========================================

def generate_narration(text, index):

    output_file = f"{OUTPUT_DIR}/{index:03d}_NARRATOR.wav"


    print()
    print("================================")
    print("Type         : NARRATION")
    print("Voice        : Narrator")
    print(f"Dialogue     : {text}")
    print(f"Output       : {output_file}")
    print("================================")


    print("Generating narration...")


    tts.tts_to_file(
        text=text,
        speaker_wav=NARRATOR_REFERENCE,
        language="en",
        file_path=output_file
    )


    print(f"Narration audio generated: {output_file}")


# ==========================================
# Generate Character Dialogue
# ==========================================

def generate_character_dialogue(character_name, text, index):

    character_id = find_character(character_name)


    if character_id is None:

        print()
        print(f"Character not found: {character_name}")
        print("Skipping dialogue...")

        return


    character = characters[character_id]

    voice_id = character["voice_id"]

    reference = character["reference"]

    output_file = f"{OUTPUT_DIR}/{index:03d}_{character_id}.wav"


    print()
    print("================================")
    print("Type         : CHARACTER")
    print(f"Speaker      : {character_name}")
    print(f"Character ID : {character_id}")
    print(f"Voice ID     : {voice_id}")
    print(f"Dialogue     : {text}")
    print(f"Output       : {output_file}")
    print("================================")


    if not os.path.exists(reference):

        print(f"Voice reference not found: {reference}")
        print("Skipping dialogue...")

        return


    print("Generating character speech...")


    tts.tts_to_file(
        text=text,
        speaker_wav=reference,
        language="en",
        file_path=output_file
    )


    print(f"Character audio generated: {output_file}")


# ==========================================
# Process Story
# ==========================================

def process_story(story):

    lines = story.strip().split("\n")

    index = 1


    for line in lines:

        line = line.strip()


        # Ignore empty lines

        if not line:

            continue


        # ----------------------------------
        # Narration
        # ----------------------------------

        if line.upper().startswith("NARRATION:"):

            text = line.split(":", 1)[1].strip()


            if text:

                generate_narration(
                    text,
                    index
                )

                index += 1


            continue


        # ----------------------------------
        # Character Dialogue
        # ----------------------------------

        if ":" in line:

            character_name, text = line.split(":", 1)

            character_name = character_name.strip()

            text = text.strip()


            if character_name and text:

                generate_character_dialogue(
                    character_name,
                    text,
                    index
                )

                index += 1


# ==========================================
# Main
# ==========================================

if __name__ == "__main__":

    if len(sys.argv) != 2:

        print()
        print("Usage:")
        print("python dialogue_manager.py <story_file>")
        print()

        sys.exit(1)


    story_file = sys.argv[1]


    if not os.path.exists(story_file):

        print()
        print(f"Story file not found: {story_file}")
        print()

        sys.exit(1)


    with open(story_file, "r") as f:

        story = f.read()


    print()
    print("================================")
    print(f"Story file: {story_file}")
    print("================================")


    process_story(story)


    print()
    print("================================")
    print("Story processing completed!")
    print("================================")

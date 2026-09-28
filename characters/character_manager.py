import json
import os


DATABASE = "characters/characters.json"


def load_characters():
    if not os.path.exists(DATABASE):
        return {}

    with open(DATABASE, "r") as f:
        return json.load(f)


def save_characters(characters):
    with open(DATABASE, "w") as f:
        json.dump(characters, f, indent=4)


def get_or_create_character(name, gender, voice_reference):
    characters = load_characters()

    # Check if character already exists
    for character_id, character in characters.items():
        if character["name"].lower() == name.lower():
            print(f"Character already exists: {character_id}")
            return character_id

    # Create new Character ID
    number = len(characters) + 1
    character_id = f"C{number:03d}"

    # Create Voice ID
    voice_id = f"VC{number:03d}"

    characters[character_id] = {
        "name": name,
        "gender": gender,
        "voice_id": voice_id,
        "reference": voice_reference
    }

    save_characters(characters)

    print(f"New character created!")
    print(f"Character ID: {character_id}")
    print(f"Name: {name}")
    print(f"Voice ID: {voice_id}")

    return character_id


if __name__ == "__main__":

    character_id = get_or_create_character(
        name="Amit",
        gender="male",
        voice_reference="voices/male/amit.wav"
    )

    print(f"Result: {character_id}")

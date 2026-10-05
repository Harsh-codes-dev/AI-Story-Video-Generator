import json
import os
from openai import OpenAI

# ============================================================
# CONFIGURATION
# ============================================================

CHARACTER_DB = "characters/characters.json"
OUTPUT_FILE = "output/story.json"

# OpenRouter client
client = OpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


# ============================================================
# LOAD AVAILABLE CHARACTERS
# ============================================================

def load_available_characters():

    if not os.path.exists(CHARACTER_DB):
        raise FileNotFoundError(
            f"Character database not found: {CHARACTER_DB}"
        )

    with open(CHARACTER_DB, "r") as f:
        characters = json.load(f)

    available = {}

    for character_id, character in characters.items():

        # Narrator is NOT a story character
        if character_id.startswith("N"):
            continue

        reference = character.get("reference")

        # Only use characters whose voice files exist
        if reference and os.path.exists(reference):

            available[character_id] = {
                "name": character["name"],
                "gender": character["gender"],
                "voice_id": character["voice_id"]
            }

    return available


# ============================================================
# BUILD SYSTEM PROMPT
# ============================================================

def build_system_prompt(characters):

    character_list = ""

    for character_id, character in characters.items():

        character_list += (
            f"{character_id}: "
            f"{character['name']} "
            f"({character['gender']}, "
            f"voice={character['voice_id']})\n"
        )

    return f"""
You are the story generation engine for a multimodal
text-to-video system.

AVAILABLE CHARACTERS:

{character_list}

NARRATOR:
N001

IMPORTANT CHARACTER RULES:

1. Use ONLY the characters listed in AVAILABLE CHARACTERS.
2. NEVER create a new character.
3. NEVER create IDs such as C004, C005, etc.
4. NEVER rename an existing character.
5. Every dialogue speaker MUST use an available character ID.
6. Narration is always separate from character dialogue.
7. The narrator is N001.
8. Keep character identities consistent across all scenes.
9. Characters listed in a scene must actually appear in that scene.
10. Do not introduce unnamed characters.
11. Generate scenes suitable for 3D image generation.
12. Every scene MUST contain an image_prompt.
13. The "image_prompt" MUST always be in ENGLISH, even if the story is in another language (e.g. Hindi).
14. The "image_prompt" MUST be highly concise (under 25 words) to avoid token truncation.
15. The story should follow the duration requested by the user.
16. For a 30-second story, keep the story short enough to fit
    approximately 30 seconds of narration/dialogue.
17. Return ONLY valid JSON.
18. Do NOT return Markdown.
19. Do NOT use ```json.
20. Do NOT add explanations outside the JSON.

OUTPUT FORMAT:

{{
    "title": "Story title",
    "language": "en",
    "duration_seconds": 30,
    "scenes": [
        {{
            "scene_id": 1,
            "narration": "Narration text for this scene.",
            "characters": ["C001"],
            "dialogue": [
                {{
                    "character_id": "C001",
                    "text": "Dialogue text."
                }}
            ],
            "image_prompt": "Detailed 3D cinematic scene description."
        }}
    ]
}}

IMPORTANT:

- "characters" contains character IDs appearing in the scene.
- "dialogue" contains only spoken character dialogue.
- "narration" contains narrator text.
- "image_prompt" describes the visual scene.
- Do not put dialogue inside narration.
- Do not put narration inside dialogue.
"""


# ============================================================
# GENERATE STORY
# ============================================================

def generate_story(user_prompt):

    characters = load_available_characters()

    if not characters:
        raise RuntimeError(
            "No available characters found in the character database."
        )

    print("\nAvailable characters:")

    for character_id, character in characters.items():
        print(
            f"  {character_id} -> "
            f"{character['name']} "
            f"({character['gender']})"
        )

    system_prompt = build_system_prompt(characters)

    print("\nSending request to OpenRouter...")

    response = client.chat.completions.create(

        model="openrouter/free",

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],

        response_format={
            "type": "json_object"
        }
    )

    story_text = response.choices[0].message.content

    if not story_text:
        raise RuntimeError("The LLM returned an empty response.")

    try:
        story = json.loads(story_text)
    except json.JSONDecodeError as e:
        print("\nLLM returned invalid JSON:")
        print(story_text)
        raise RuntimeError(
            f"Could not parse story JSON: {e}"
        )

    return story


# ============================================================
# VALIDATE STORY
# ============================================================

def validate_story(story):

    required_fields = [
        "title",
        "scenes"
    ]

    for field in required_fields:

        if field not in story:
            raise ValueError(
                f"Story is missing required field: {field}"
            )

    if not isinstance(story["scenes"], list):
        raise ValueError(
            "Story 'scenes' must be a list."
        )

    available_characters = load_available_characters()

    for scene in story["scenes"]:

        if "scene_id" not in scene:
            raise ValueError(
                "Scene is missing scene_id."
            )

        if "narration" not in scene:
            raise ValueError(
                f"Scene {scene['scene_id']} is missing narration."
            )

        if "characters" not in scene:
            raise ValueError(
                f"Scene {scene['scene_id']} is missing characters."
            )

        if "dialogue" not in scene:
            raise ValueError(
                f"Scene {scene['scene_id']} is missing dialogue."
            )

        if "image_prompt" not in scene:
            raise ValueError(
                f"Scene {scene['scene_id']} is missing image_prompt."
            )

        # Check scene character IDs
        for character_id in scene["characters"]:

            if character_id not in available_characters:

                raise ValueError(
                    f"Invalid character ID in scene "
                    f"{scene['scene_id']}: {character_id}"
                )

        # Check dialogue character IDs
        for dialogue in scene["dialogue"]:

            character_id = dialogue.get("character_id")

            if character_id not in available_characters:

                raise ValueError(
                    f"Invalid dialogue character ID: "
                    f"{character_id}"
                )

            if "text" not in dialogue:
                raise ValueError(
                    "Dialogue is missing text."
                )

    print("\nStory validation successful!")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("        KRINJAL STORY GENERATOR")
    print("=" * 60)

    # Check API key
    if not os.environ.get("OPENROUTER_API_KEY"):

        print("\nERROR:")
        print("OPENROUTER_API_KEY is not set.")

        print("\nRun:")
        print(
            'export OPENROUTER_API_KEY="YOUR_KEY_HERE"'
        )

        exit(1)

    import sys
    # Get user prompt from arguments or ask for it
    if len(sys.argv) > 1:
        user_prompt = " ".join(sys.argv[1:]).strip()
    else:
        user_prompt = input("\nEnter your story prompt: ").strip()

    if not user_prompt:

        print("Story prompt cannot be empty.")
        exit(1)

    print("\nGenerating story...\n")

    try:

        story = generate_story(user_prompt)

        # Validate
        validate_story(story)

        # Create output directory
        os.makedirs("output", exist_ok=True)

        # Save story
        with open(
            OUTPUT_FILE,
            "w"
        ) as f:

            json.dump(
                story,
                f,
                indent=4
            )

        print("\n" + "=" * 60)
        print("STORY GENERATED SUCCESSFULLY!")
        print("=" * 60)

        print(
            f"\nSaved to: {OUTPUT_FILE}"
        )

        print("\n===== GENERATED STORY =====\n")

        print(
            json.dumps(
                story,
                indent=4
            )
        )

    except Exception as e:

        print("\nERROR:")
        print(e)
        import sys
        sys.exit(1)

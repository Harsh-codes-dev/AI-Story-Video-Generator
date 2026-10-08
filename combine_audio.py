import json
import os
import subprocess

SESSION_DIR = os.environ.get("SESSION_DIR", "output")
STORY_FILE = os.path.join(SESSION_DIR, "story.json")
AUDIO_DIR = os.path.join(SESSION_DIR, "audio")
OUTPUT_FILE = os.path.join(SESSION_DIR, "final_story.wav")

FFMPEG = "/home/aiml/ffmpeg-7.0.2-amd64-static/ffmpeg"


# ============================================================
# LOAD STORY
# ============================================================

with open(STORY_FILE, "r") as f:
    story = json.load(f)


# ============================================================
# CREATE AUDIO LIST
# ============================================================

audio_files = []

for scene in story["scenes"]:

    scene_id = scene["scene_id"]

    # Narration first
    narration_file = os.path.join(
        AUDIO_DIR,
        f"scene_{scene_id:02d}_narration.wav"
    )

    if os.path.exists(narration_file):
        audio_files.append(narration_file)

    # Dialogue in JSON order
    for index, dialogue in enumerate(
        scene.get("dialogue", []),
        start=1
    ):

        character_id = dialogue["character_id"]

        dialogue_file = os.path.join(
            AUDIO_DIR,
            f"scene_{scene_id:02d}_{character_id}_{index:02d}.wav"
        )

        if os.path.exists(dialogue_file):
            audio_files.append(dialogue_file)


# ============================================================
# CHECK FILES
# ============================================================

print("\nAudio sequence:")

for i, file in enumerate(audio_files, start=1):
    print(f"{i}. {file}")


if not audio_files:
    raise RuntimeError("No audio files found.")


# ============================================================
# CREATE CONCAT FILE FOR FFMPEG
# ============================================================

concat_file = os.path.join(SESSION_DIR, "audio_concat.txt")

with open(concat_file, "w") as f:

    for audio_file in audio_files:

        absolute_path = os.path.abspath(audio_file)

        # Escape single quotes for FFmpeg
        absolute_path = absolute_path.replace("'", "'\\''")

        f.write(
            f"file '{absolute_path}'\n"
        )


# ============================================================
# COMBINE AUDIO
# ============================================================

print("\nCombining audio with FFmpeg...\n")

command = [
    FFMPEG,
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concat_file,
    "-c:a",
    "pcm_s16le",
    OUTPUT_FILE
]

result = subprocess.run(
    command,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)


if result.returncode != 0:

    print("FFmpeg ERROR:")
    print(result.stderr)

    raise RuntimeError(
        "FFmpeg failed to combine the audio."
    )


# ============================================================
# GET FINAL DURATION
# ============================================================

duration_command = [
    FFMPEG,
    "-i",
    OUTPUT_FILE
]

duration_result = subprocess.run(
    duration_command,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

print("\n" + "=" * 60)
print("FINAL AUDIO CREATED SUCCESSFULLY!")
print("=" * 60)

print(f"\nOutput:")
print(OUTPUT_FILE)

print("\nFFmpeg information:")

for line in duration_result.stderr.splitlines():

    if "Duration:" in line:
        print(line)
        break

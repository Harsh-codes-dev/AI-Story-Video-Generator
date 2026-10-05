import json
import os
import torch
from diffusers import FluxPipeline

STORY_FILE = "output/story.json"
CHARACTER_FILE = "characters/characters.json"
OUTPUT_DIR = "output/images"
MODEL = "black-forest-labs/FLUX.1-schnell"


# -----------------------------
# Load story
# -----------------------------
with open(STORY_FILE, "r", encoding="utf-8") as f:
    story = json.load(f)

# -----------------------------
# Extract characters from story
# -----------------------------
char_map = {c["character_id"]: c["name"] for c in story.get("characters", [])}

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("===================================")
print("       KRINJAL VISUAL PIPELINE")
print("===================================")
print(f"Story: {story['title']}")
print(f"Language: {story.get('language', 'en')}")
print(f"Scenes: {len(story['scenes'])}")
print()


# -----------------------------
# Load FLUX ONCE
# -----------------------------
print("Loading FLUX...")

pipe = FluxPipeline.from_pretrained(
    MODEL,
    torch_dtype=torch.float16,
    device_map="balanced"
)

# device_map="balanced" automatically splits the model across your 4 GPUs
# pipe.enable_sequential_cpu_offload()  <-- No longer needed, model is distributed

print("FLUX loaded!")
print()


# -----------------------------
# Generate scene images
# -----------------------------
for scene in story["scenes"]:

    scene_id = scene["scene_id"]

    output_file = os.path.join(
        OUTPUT_DIR,
        f"scene_{scene_id:03d}.png"
    )

    # Skip already generated images
    if os.path.exists(output_file):
        print(f"Scene {scene_id}: already exists")
        continue

    print("-----------------------------------")
    print(f"Generating Scene {scene_id}")

    # Get character names only
    character_names = []

    for character_id in scene.get("characters", []):
        if character_id in char_map:
            character_names.append(char_map[character_id])

    character_list = ", ".join(character_names)

    # -----------------------------
    # HIGH-FIDELITY VISUAL PROMPT
    # -----------------------------
    prompt = f"""
Cinematic Masterpiece, 8k resolution, photorealistic, highly detailed, stunning lighting.
{scene.get("image_prompt", "")}
Characters: {character_list}.
Consistent character appearance, natural poses, dynamic angle, award-winning photography.
"""

    print("Characters:", character_list)
    print("Generating image...")

    image = pipe(
        prompt,
        height=1024,
        width=576,
        num_inference_steps=20,
        guidance_scale=0.0
    ).images[0]

    # Free up GPU memory aggressively after each generation
    torch.cuda.empty_cache()

    image.save(output_file)

    print(f"Saved: {output_file}")


print()
print("===================================")
print("Visual generation completed!")
print(f"Images saved in: {OUTPUT_DIR}")
print("===================================")

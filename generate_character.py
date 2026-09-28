import json
import os
import sys
import torch
from diffusers import FluxPipeline

CHARACTER_DB = "characters/characters.json"
MODEL = "black-forest-labs/FLUX.1-schnell"

if len(sys.argv) != 2:
    print("Usage: python generate_character.py C001")
    sys.exit(1)

character_id = sys.argv[1]

with open(CHARACTER_DB, "r") as f:
    characters = json.load(f)

if character_id not in characters:
    raise ValueError(f"Character {character_id} not found")

character = characters[character_id]

if "visual" not in character:
    raise ValueError(f"No visual information for {character_id}")

description = character["visual"]["description"]
output_file = character["visual"]["reference_image"]

prompt = f"""
3D animated movie character, {description}.
Full body, standing, facing camera, clear face and clothing,
cinematic 3D render, detailed character, simple background.
"""

print(f"Generating visual reference for {character['name']}...")
print(f"Character ID: {character_id}")

pipe = FluxPipeline.from_pretrained(
    MODEL,
    torch_dtype=torch.float16
)

pipe.enable_model_cpu_offload()

image = pipe(
    prompt,
    height=768,
    width=768,
    num_inference_steps=4,
    guidance_scale=0.0,
    max_sequence_length=256
).images[0]

os.makedirs(os.path.dirname(output_file), exist_ok=True)
image.save(output_file)

print(f"Saved: {output_file}")

import os
import json
import torch
import scipy.io.wavfile
from diffusers import AudioLDM2Pipeline

# Directories
SESSION_DIR = os.environ.get("SESSION_DIR", "output")
STORY_FILE = os.path.join(SESSION_DIR, "story.json")
MUSIC_DIR = os.path.join(SESSION_DIR, "music")

def main():
    print("===================================")
    print("      KRINJAL MUSIC PIPELINE       ")
    print("===================================")

    if not os.path.exists(STORY_FILE):
        print("No story.json found. Run the pipeline first.")
        return

    with open(STORY_FILE, "r", encoding="utf-8") as f:
        story = json.load(f)

    os.makedirs(MUSIC_DIR, exist_ok=True)

    print("Loading AudioLDM2 Model (High-Fidelity AI Audio)...")
    repo_id = "cvssp/audioldm2"
    
    # We use float16 and offload to CUDA for speed
    pipe = AudioLDM2Pipeline.from_pretrained(repo_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda")
    print("AudioLDM2 Model Loaded!\n")

    for scene in story.get("scenes", []):
        scene_id = scene["scene_id"]
        
        output_file = os.path.join(MUSIC_DIR, f"scene_{scene_id:03d}_bgm.wav")
        if os.path.exists(output_file):
            print(f"Skipping Scene {scene_id} - Music already exists.")
            continue

        music_prompt = scene.get("music_prompt", "ambient cinematic background music")
        sfx_prompt = scene.get("sfx_prompt", "")
        
        # Combine both for a rich atmospheric background track
        full_prompt = f"{music_prompt}, {sfx_prompt}, high quality, cinematic, stereo"
        print(f"Generating Background Audio for Scene {scene_id}...")
        print(f"Prompt: {full_prompt}")

        # Generate audio (AudioLDM2 default duration is 10 seconds)
        # This will loop perfectly under our 6-second video clips
        generator = torch.manual_seed(42)
        audio = pipe(
            full_prompt, 
            num_inference_steps=20, 
            audio_length_in_s=10.0, 
            generator=generator
        ).audios[0]

        # Save as WAV (AudioLDM2 natively outputs at 16000Hz)
        scipy.io.wavfile.write(output_file, rate=16000, data=audio)
        print(f"Saved: {output_file}\n")

    print("===================================")
    print("Music generation completed!")
    print(f"Files saved in: {MUSIC_DIR}")
    print("===================================")

if __name__ == "__main__":
    main()

import os
import json
import torch
import glob
from diffusers import CogVideoXImageToVideoPipeline
from diffusers.utils import load_image, export_to_video

# Directories
SESSION_DIR = os.environ.get("SESSION_DIR", "output")
IMAGE_DIR = os.path.join(SESSION_DIR, "images")
VIDEO_DIR = os.path.join(SESSION_DIR, "videos")
STORY_FILE = os.path.join(SESSION_DIR, "story.json")

# State of the art Image-to-Video model
MODEL_ID = "THUDM/CogVideoX-5b-I2V"

def main():
    print("===================================")
    print("      KRINJAL VIDEO PIPELINE       ")
    print("      Powered by CogVideoX-5B      ")
    print("===================================")

    os.makedirs(VIDEO_DIR, exist_ok=True)
    
    # 1. Load the story to get the text prompts for each image
    if not os.path.exists(STORY_FILE):
        print(f"Error: {STORY_FILE} not found. Please generate the story first.")
        return
        
    with open(STORY_FILE, "r", encoding="utf-8") as f:
        story = json.load(f)
        
    char_map = {c["character_id"]: c["name"] for c in story.get("characters", [])}
    scene_prompts = {}
    for scene in story.get("scenes", []):
        scene_id = f"scene_{scene['scene_id']:03d}"
        chars = [char_map[cid] for cid in scene.get("characters", []) if cid in char_map]
        
        # CogVideoX uses the text prompt to understand how to animate the image
        prompt = scene.get("image_prompt", "") + ". Featuring: " + ", ".join(chars)
        scene_prompts[scene_id] = prompt

    # 2. Find all generated scene images
    image_files = sorted(glob.glob(os.path.join(IMAGE_DIR, "scene_*.png")))
    
    if not image_files:
        print(f"No images found in {IMAGE_DIR}. Please run visual_pipeline first.")
        return
        
    print(f"Found {len(image_files)} scene images.")
    print("Loading CogVideoX-5B Model (this is a massive 5B parameter model, please wait)...")
    
    # Load the CogVideoX model distributed across the DGX GPUs
    pipe = CogVideoXImageToVideoPipeline.from_pretrained(
        MODEL_ID, 
        torch_dtype=torch.float16, 
        device_map="balanced"
    )
    
    print("CogVideoX Model Loaded! Generating ultra-realistic cinematic animations...\n")
    
    for img_path in image_files:
        base_name = os.path.basename(img_path)
        name_without_ext = os.path.splitext(base_name)[0]
        output_video_path = os.path.join(VIDEO_DIR, f"{name_without_ext}.mp4")
        
        if os.path.exists(output_video_path):
            print(f"[{name_without_ext}] Video already exists. Skipping.")
            continue
            
        print(f"[{name_without_ext}] Processing image to video...")
        
        # Get the text prompt for this specific scene
        text_prompt = scene_prompts.get(name_without_ext, "A highly detailed cinematic 3D animation.")
        print(f"Prompt: {text_prompt}")
        
        # Load the input image
        image = load_image(img_path)
        
        # CogVideoX-5B performs best near its native 720x480 resolution.
        # We will resize to a vertical 9:16 ratio that matches its training distribution.
        image = image.resize((480, 720)) 
        
        # Generate video frames
        generator = torch.manual_seed(42)
        frames = pipe(
            prompt=text_prompt,
            image=image,
            height=720,                # Force Vertical (Portrait) Height
            width=480,                 # Force Vertical (Portrait) Width
            num_video_frames=49,       # Generates a smooth 6-second video (49 frames at 8 fps)
            num_inference_steps=50,    # High step count for maximum cinematic quality
            guidance_scale=6.0,        # Strictly follow the text prompt + image
            generator=generator
        ).frames[0]
        
        # Export to MP4 at 8 frames per second (CogVideoX native standard)
        export_to_video(frames, output_video_path, fps=8)
        
        print(f"[{name_without_ext}] Saved video to {output_video_path}\n")
        
    print("===================================")
    print("Video generation completed!")
    print(f"Videos saved in: {VIDEO_DIR}")
    print("===================================")

if __name__ == "__main__":
    main()

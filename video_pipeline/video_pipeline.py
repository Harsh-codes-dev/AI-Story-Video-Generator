import os
import torch
import glob
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import load_image, export_to_video

# Directories
IMAGE_DIR = "output/images"
VIDEO_DIR = "output/videos"

# We use SVD-XT which is optimized for 25 frames
MODEL_ID = "stabilityai/stable-video-diffusion-img2vid-xt"

def main():
    print("===================================")
    print("      KRINJAL VIDEO PIPELINE       ")
    print("===================================")

    os.makedirs(VIDEO_DIR, exist_ok=True)
    
    # Find all generated scene images
    image_files = sorted(glob.glob(os.path.join(IMAGE_DIR, "scene_*.png")))
    
    if not image_files:
        print(f"No images found in {IMAGE_DIR}. Please run visual_pipeline first.")
        return
        
    print(f"Found {len(image_files)} scene images.")
    print("Loading Stable Video Diffusion Model (this may take a moment)...")
    
    # Load the Stable Video Diffusion model
    pipe = StableVideoDiffusionPipeline.from_pretrained(
        MODEL_ID, torch_dtype=torch.float16, variant="fp16", device_map="balanced"
    )
    # Offload model to CPU when not used to save GPU memory
    # pipe.enable_model_cpu_offload() <-- No longer needed since we are distributing across 4 GPUs
    
    print("SVD Model Loaded! Generating animations...\n")
    
    for img_path in image_files:
        # Extract filename to create matching video filename
        base_name = os.path.basename(img_path)
        name_without_ext = os.path.splitext(base_name)[0]
        output_video_path = os.path.join(VIDEO_DIR, f"{name_without_ext}.mp4")
        
        # Skip if video already exists
        if os.path.exists(output_video_path):
            print(f"[{name_without_ext}] Video already exists. Skipping.")
            continue
            
        print(f"[{name_without_ext}] Processing image to video...")
        
        # Load the input image
        image = load_image(img_path)
        
        # SVD performs best with 1024x576 resolution
        image = image.resize((1024, 576)) 
        
        # Generate video frames
        # decode_chunk_size=8 helps with VRAM usage on the DGX
        generator = torch.manual_seed(42)
        frames = pipe(image, decode_chunk_size=8, generator=generator).frames[0]
        
        # Export to MP4 at 7 frames per second (approx ~3.5 seconds of video)
        export_to_video(frames, output_video_path, fps=7)
        
        print(f"[{name_without_ext}] Saved video to {output_video_path}\n")
        
    print("===================================")
    print("Video generation completed!")
    print(f"Videos saved in: {VIDEO_DIR}")
    print("===================================")

if __name__ == "__main__":
    main()

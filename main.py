import os
import subprocess
import sys

def run_script(script_name, args=None):
    """Run a python script and wait for it to complete."""
    command = [sys.executable, script_name]
    if args:
        command.extend(args)
    
    print(f"\n" + "="*50)
    print(f"🚀 STARTING: {script_name}")
    print("="*50)
    
    try:
        # Run the process, inherit stdout/stdin so we can interact (e.g. input())
        subprocess.run(command, check=True)
        print(f"\n✅ COMPLETED: {script_name}")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ [ERROR] {script_name} failed with exit code {e.returncode}.")
        sys.exit(1)

def main():
    print("=" * 60)
    print("      AI STORY VIDEO GENERATOR - MASTER PIPELINE")
    print("=" * 60)
    
    # 1. Set OpenRouter API Key
    os.environ["OPENROUTER_API_KEY"] = "YOUR_API_KEY_HERE"
        
    # 2. Step 1: Generate Story (JSON)
    # This will ask the user for a prompt via input()
    run_script("story_generator.py")
    
    # 3. Step 2: Generate Visuals (FLUX)
    run_script(os.path.join("visual_pipeline", "visual_pipeline.py"))
    
    # 3.5 Step 2.5: Animate Visuals (Stable Video Diffusion)
    run_script(os.path.join("video_pipeline", "video_pipeline.py"))
    
    # 4. Step 3: Generate Voices (XTTS-v2)
    run_script("story_audio.py")
    
    # 5. Step 4: Combine Audio (FFmpeg)
    run_script("combine_audio.py")
    
    print("\n" + "=" * 60)
    print("🎉 FULL PIPELINE COMPLETED SUCCESSFULLY!")
    print("Check the 'output' directory for your final assets.")
    print("=" * 60)

if __name__ == "__main__":
    main()

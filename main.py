import os
import subprocess
import sys
import uuid
import re
from dotenv import load_dotenv

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
    # If the user provided a prompt to main.py, pass it to story_generator.py
    prompt_args = sys.argv[1:] if len(sys.argv) > 1 else None

    print("=" * 60)
    print("      AI STORY VIDEO GENERATOR - MASTER PIPELINE")
    print("=" * 60)
    
    # Load environment variables securely
    load_dotenv()
    if not os.environ.get("OPENROUTER_API_KEY"):
        print("❌ [ERROR] OPENROUTER_API_KEY is missing from .env file!")
        sys.exit(1)

    # Concurrency Lock (Phase 5)
    lock_file = "pipeline.lock"
    if os.path.exists(lock_file):
        print("❌ [ERROR] Another video generation is currently running! Please wait.")
        sys.exit(1)
    
    try:
        # Create lock
        with open(lock_file, "w") as f:
            f.write("locked")

        # Input Sanitization (Phase 2 & 3)
        if prompt_args:
            raw_prompt = " ".join(prompt_args)
            
            # 1. Enforce length limit
            if len(raw_prompt) > 500:
                print("❌ [ERROR] Prompt exceeds 500 characters. Please be concise.")
                sys.exit(1)
                
            # 2. Strip dangerous system control characters
            sanitized_prompt = re.sub(r'[<>{}[\]\\]', '', raw_prompt)
            
            # 3. Basic NSFW/Keyword blacklist
            blacklist = ["nsfw", "gore", "violence", "porn", "blood"]
            if any(word in sanitized_prompt.lower() for word in blacklist):
                print("❌ [ERROR] Prompt blocked by safety filter.")
                sys.exit(1)
                
            prompt_args = [sanitized_prompt]

        # Output Isolation (Phase 4)
        session_id = str(uuid.uuid4())[:8]
        session_dir = os.path.join("output", f"session_{session_id}")
        os.makedirs(session_dir, exist_ok=True)
        os.environ["SESSION_DIR"] = session_dir
        
        print(f"📁 Session Directory Created: {session_dir}")
        
    # 2. Step 1: Generate Story (JSON)
    run_script("story_generator.py", args=prompt_args)
    
    # 3. Step 2: Generate Visuals (FLUX)
    run_script(os.path.join("visual_pipeline", "visual_pipeline.py"))
    
    # 3.5 Step 2.5: Animate Visuals (Stable Video Diffusion)
    run_script(os.path.join("video_pipeline", "video_pipeline.py"))
    
    # 4. Step 3: Generate Voices (XTTS-v2)
    run_script("story_audio.py")
    
    # 5. Step 4: Combine Audio (FFmpeg)
    run_script("combine_audio.py")
    
    # 6. Step 5: Final Video Assembly (FFmpeg)
    run_script("video_assembler.py")
    
        print("\n" + "=" * 60)
        print("🎉 FULL PIPELINE COMPLETED SUCCESSFULLY!")
        print(f"Check the '{session_dir}' directory for your final assets.")
        print("=" * 60)
        
    finally:
        # Release the lock when done or if an error occurs
        if os.path.exists(lock_file):
            os.remove(lock_file)

if __name__ == "__main__":
    main()

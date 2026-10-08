import json
import os
import subprocess
import glob

SESSION_DIR = os.environ.get("SESSION_DIR", "output")
STORY_FILE = os.path.join(SESSION_DIR, "story.json")
AUDIO_DIR = os.path.join(SESSION_DIR, "audio")
VIDEO_DIR = os.path.join(SESSION_DIR, "videos")
OUTPUT_DIR = SESSION_DIR
FINAL_OUTPUT = os.path.join(SESSION_DIR, "Final_Story.mp4")

# Using standard ffmpeg command
FFMPEG = "ffmpeg"

def run_ffmpeg(command):
    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg Error: {e.stderr.decode()}")
        raise

def main():
    print("===================================")
    print("      KRINJAL VIDEO ASSEMBLER      ")
    print("===================================")

    if not os.path.exists(STORY_FILE):
        print("No story.json found. Run the pipeline first.")
        return

    with open(STORY_FILE, "r") as f:
        story = json.load(f)

    final_clips = []

    for scene in story["scenes"]:
        scene_id = scene["scene_id"]
        scene_video = os.path.join(VIDEO_DIR, f"scene_{scene_id:03d}.mp4")
        
        if not os.path.exists(scene_video):
            print(f"Skipping Scene {scene_id} - Video not found: {scene_video}")
            continue

        print(f"\n--- Assembling Scene {scene_id} ---")
        
        # 1. Gather all audio for this scene
        scene_audio_files = sorted(glob.glob(os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_*.wav")))
        
        if not scene_audio_files:
            print(f"No audio found for scene {scene_id}. Using video only.")
            final_clips.append(scene_video)
            continue

        scene_audio_concat = os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_merged.wav")
        scene_final_vid = os.path.join(VIDEO_DIR, f"scene_{scene_id:03d}_final.mp4")

        # 2. Merge all audio for the scene into one WAV
        concat_txt = os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_concat.txt")
        with open(concat_txt, "w") as f:
            for audio in scene_audio_files:
                f.write(f"file '{os.path.abspath(audio)}'\n")
        
        print("Merging audio segments...")
        run_ffmpeg([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_txt, "-c", "copy", scene_audio_concat])

        # 3. Combine Video and Audio (Looping the video to match audio length)
        print("Syncing video to audio length...")
        # -stream_loop -1 loops the video infinitely. -shortest stops encoding when the shortest stream (audio) ends.
        run_ffmpeg([
            FFMPEG, "-y", 
            "-stream_loop", "-1", "-i", scene_video, 
            "-i", scene_audio_concat, 
            "-c:v", "libx264", "-c:a", "aac", 
            "-shortest", "-pix_fmt", "yuv420p", 
            scene_final_vid
        ])
        
        print(f"Scene {scene_id} finished: {scene_final_vid}")
        final_clips.append(scene_final_vid)

    if not final_clips:
        print("No clips to assemble!")
        return

    # 4. Concatenate all final scene clips into the Final Movie
    print("\n===================================")
    print("STITCHING FINAL MOVIE...")
    
    final_concat_txt = os.path.join(OUTPUT_DIR, "final_movie_concat.txt")
    with open(final_concat_txt, "w") as f:
        for clip in final_clips:
            f.write(f"file '{os.path.abspath(clip)}'\n")

    run_ffmpeg([
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", final_concat_txt, 
        "-c", "copy", FINAL_OUTPUT
    ])

    print("\n🎉 FINAL MOVIE GENERATED SUCCESSFULLY!")
    print(f"Path: {FINAL_OUTPUT}")
    print("===================================")

if __name__ == "__main__":
    main()

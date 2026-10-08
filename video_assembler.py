import json
import os
import subprocess
import glob
import textwrap

SESSION_DIR = os.environ.get("SESSION_DIR", "output")
STORY_FILE = os.path.join(SESSION_DIR, "story.json")
AUDIO_DIR = os.path.join(SESSION_DIR, "audio")
VIDEO_DIR = os.path.join(SESSION_DIR, "videos")
MUSIC_DIR = os.path.join(SESSION_DIR, "music")
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
    print("      (With Subtitles & BGM)       ")
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
        
        # 1. Gather all voice audio for this scene
        scene_audio_files = sorted(glob.glob(os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_*.wav")))
        if not scene_audio_files:
            print(f"No audio found for scene {scene_id}. Skipping.")
            continue

        scene_audio_concat = os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_merged.wav")
        mixed_audio = os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_final_mixed.wav")
        scene_final_vid = os.path.join(VIDEO_DIR, f"scene_{scene_id:03d}_final.mp4")

        # 2. Merge all voice parts into one WAV
        concat_txt = os.path.join(AUDIO_DIR, f"scene_{scene_id:02d}_concat.txt")
        with open(concat_txt, "w") as f:
            for audio in scene_audio_files:
                f.write(f"file '{os.path.abspath(audio)}'\n")
        
        print("Merging voice segments...")
        run_ffmpeg([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_txt, "-c", "copy", scene_audio_concat])

        # 3. Mix Voice with Background Music
        bgm_file = os.path.join(MUSIC_DIR, f"scene_{scene_id:03d}_bgm.wav")
        final_scene_audio = scene_audio_concat
        
        if os.path.exists(bgm_file):
            print("Mixing voice with atmospheric background music...")
            # amix lowers the BGM volume to 0.3 so the voice remains clear
            run_ffmpeg([
                FFMPEG, "-y",
                "-i", scene_audio_concat,
                "-i", bgm_file,
                "-filter_complex", "[0:a]volume=1.0[v];[1:a]volume=0.3[m];[v][m]amix=inputs=2:duration=first:dropout_transition=2",
                mixed_audio
            ])
            final_scene_audio = mixed_audio

        # 4. Generate Subtitles Text File
        scene_text_parts = []
        if scene.get("narration"):
            scene_text_parts.append(scene["narration"])
        for dialogue in scene.get("dialogue", []):
            scene_text_parts.append(dialogue["text"])
            
        scene_text = " ".join(scene_text_parts)
        wrapped_text = textwrap.fill(scene_text, width=30)
        
        text_file = os.path.join(OUTPUT_DIR, f"scene_{scene_id:03d}_subtitles.txt")
        with open(text_file, "w", encoding="utf-8") as f:
            f.write(wrapped_text)

        # 5. Combine Video, Audio, and Burn Subtitles
        print("Applying TikTok subtitles and syncing video...")
        
        # Format path for FFmpeg drawtext (replace \ with / for Windows compatibility)
        safe_text_path = os.path.abspath(text_file).replace('\\', '/')
        
        # TikTok style 1080p: upscale video to 1080x1920 first, then apply high-res centered text
        text_filter = f"scale=1080:1920,drawtext=textfile='{safe_text_path}':fontcolor=white:fontsize=80:box=1:boxcolor=black@0.6:boxborderw=25:x=(w-text_w)/2:y=h-text_h-120:text_align=C"

        # -stream_loop -1 loops video infinitely. -shortest stops encoding when audio ends.
        run_ffmpeg([
            FFMPEG, "-y", 
            "-stream_loop", "-1", "-i", scene_video, 
            "-i", final_scene_audio,
            "-vf", text_filter,
            "-c:v", "libx264", "-c:a", "aac", 
            "-shortest", "-pix_fmt", "yuv420p", 
            scene_final_vid
        ])
        
        print(f"Scene {scene_id} finished: {scene_final_vid}")
        final_clips.append(scene_final_vid)

    if not final_clips:
        print("No clips to assemble!")
        return

    # 6. Concatenate all final scene clips into the Final Movie
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

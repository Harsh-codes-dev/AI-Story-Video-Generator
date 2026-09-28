import torch
from diffusers import FluxPipeline

MODEL = "black-forest-labs/FLUX.1-schnell"

print("Loading FLUX...")

pipe = FluxPipeline.from_pretrained(
    MODEL,
    torch_dtype=torch.float16
)

pipe.enable_model_cpu_offload()

print("FLUX loaded!")

prompt = """
A cinematic 3D-style scene of a young Indian man,
short black hair, medium skin tone, dark blue hoodie,
standing outside an abandoned mansion at night,
dramatic moonlight, realistic 3D character,
detailed environment, cinematic composition
"""

image = pipe(
    prompt,
    height=768,
    width=768,
    num_inference_steps=4,
    guidance_scale=0.0,
    max_sequence_length=256
).images[0]

image.save("test_flux.png")

print("Image saved: test_flux.png")

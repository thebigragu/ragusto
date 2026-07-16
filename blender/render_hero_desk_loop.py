"""
Arcform — Cinematic desk hero loop (Blender headless EEVEE).
Renders a seamless ~7s studio desk plate (empty desk for WebGL MacBook overlay).

Output frames: blender/output/hero-desk/####.png
Then run: npm run videos:encode
"""

import math
import os

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "blender", "output", "hero-desk")
os.makedirs(OUT, exist_ok=True)


def mat(name, *, color=(0.8, 0.8, 0.8, 1), metal=0.0, rough=0.4, emit=0.0, emit_color=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    if emit > 0:
        bsdf.inputs["Emission Strength"].default_value = emit
        bsdf.inputs["Emission Color"].default_value = emit_color or color
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def box(name, size=(1, 1, 1), loc=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return obj


# --- Scene: dark studio + empty desk (right-weighted for MacBook overlay) ---
floor = box("Floor", size=(12, 12, 0.08), loc=(0, 0, -0.04))
floor.data.materials.append(mat("FloorMat", color=(0.04, 0.04, 0.045, 1), rough=0.55))

wall = box("BackWall", size=(12, 0.2, 5), loc=(0, -3.2, 2.2))
wall.data.materials.append(mat("WallMat", color=(0.07, 0.075, 0.09, 1), rough=0.7))

desk = box("Desk", size=(2.4, 1.1, 0.06), loc=(0.85, -0.35, 0.72))
desk.data.materials.append(mat("DeskMat", color=(0.12, 0.1, 0.09, 1), metal=0.15, rough=0.35))

leg_mat = mat("LegMat", color=(0.2, 0.2, 0.22, 1), metal=0.85, rough=0.25)
for i, lx in enumerate((-0.15, 1.85)):
    for ly in (-0.7, 0.0):
        leg = box(f"Leg_{i}_{ly}", size=(0.05, 0.05, 0.72), loc=(lx, ly, 0.36))
        leg.data.materials.append(leg_mat)

# Soft practical lamp (left)
lamp_base = box("LampBase", size=(0.18, 0.18, 0.04), loc=(-1.1, -0.2, 0.76))
lamp_base.data.materials.append(mat("LampBaseMat", color=(0.15, 0.15, 0.16, 1), metal=0.6, rough=0.3))
shade = box("LampShade", size=(0.22, 0.22, 0.16), loc=(-1.1, -0.2, 1.05))
shade.data.materials.append(
    mat("ShadeMat", color=(1.0, 0.85, 0.65, 1), rough=0.5, emit=2.5, emit_color=(1.0, 0.82, 0.6, 1))
)

# Distant window glow
glow = box("WindowGlow", size=(2.5, 0.05, 1.8), loc=(-2.8, -3.05, 2.0))
glow.data.materials.append(
    mat("GlowMat", color=(0.4, 0.55, 0.7, 1), rough=1.0, emit=4.0, emit_color=(0.55, 0.7, 0.9, 1))
)

# Lights
key = bpy.data.objects.new("KeyLight", bpy.data.lights.new("KeyLightData", "AREA"))
key.data.energy = 80
key.data.size = 2.5
key.data.color = (1.0, 0.92, 0.85)
key.location = (2.5, 1.5, 3.2)
key.rotation_euler = (math.radians(-45), math.radians(20), math.radians(30))
link(key)

fill = bpy.data.objects.new("FillLight", bpy.data.lights.new("FillLightData", "AREA"))
fill.data.energy = 25
fill.data.size = 3.0
fill.data.color = (0.7, 0.8, 1.0)
fill.location = (-2.0, 1.0, 2.5)
link(fill)

rim = bpy.data.objects.new("RimLight", bpy.data.lights.new("RimLightData", "POINT"))
rim.data.energy = 40
rim.data.color = (0.4, 0.9, 0.85)
rim.location = (1.5, -2.0, 2.0)
link(rim)

# Camera — desk right-weighted empty zone for MacBook overlay
cam_data = bpy.data.cameras.new("HeroCam")
cam_data.lens = 38
cam = bpy.data.objects.new("HeroCam", cam_data)
cam.location = (-0.15, 2.8, 1.55)
cam.rotation_euler = (math.radians(78), 0, math.radians(8))
link(cam)
scene.camera = cam

# Animate slow camera drift + lamp flicker for seamless loop
fps = 24
frames = 168  # 7 seconds
scene.render.fps = fps
scene.frame_start = 1
scene.frame_end = frames

cam.keyframe_insert(data_path="location", frame=1)
cam.location = (-0.05, 2.72, 1.58)
cam.keyframe_insert(data_path="location", frame=frames // 2)
cam.location = (-0.15, 2.8, 1.55)
cam.keyframe_insert(data_path="location", frame=frames)

shade_mat = shade.data.materials[0]
nt = shade_mat.node_tree
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
emit_in = bsdf.inputs["Emission Strength"]
for f, v in ((1, 2.2), (42, 2.8), (84, 2.1), (126, 2.7), (168, 2.2)):
    emit_in.default_value = v
    emit_in.keyframe_insert("default_value", frame=f)

# EEVEE render settings
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in dir(bpy.types) else "BLENDER_EEVEE"
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.filepath = os.path.join(OUT, "frame_")
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False

world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.02, 0.022, 0.03, 1)
bg.inputs[1].default_value = 0.4

print(f"Rendering hero desk loop → {OUT}")
bpy.ops.render.render(animation=True)
print("Done.")

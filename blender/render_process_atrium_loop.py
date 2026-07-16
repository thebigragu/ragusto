"""
Arcform — Cinematic atrium process loop (Blender headless EEVEE).
Tall glass atrium atmosphere for process section.

Output frames: blender/output/process-atrium/####.png
Then run: npm run videos:encode
"""

import math
import os

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "blender", "output", "process-atrium")
os.makedirs(OUT, exist_ok=True)


def mat(name, *, color=(0.8, 0.8, 0.8, 1), metal=0.0, rough=0.4, emit=0.0, emit_color=None, alpha=1.0):
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
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.9
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


floor = box("Floor", size=(16, 16, 0.1), loc=(0, 0, -0.05))
floor.data.materials.append(mat("FloorMat", color=(0.05, 0.055, 0.06, 1), rough=0.4, metal=0.2))

# Tall glass panels (right)
glass_mat = mat("GlassMat", color=(0.55, 0.85, 0.9, 1), rough=0.05, metal=0.0, alpha=0.25, emit=0.3, emit_color=(0.3, 0.7, 0.75, 1))
for i, x in enumerate((2.5, 3.5, 4.5, 5.5)):
    pane = box(f"Glass_{i}", size=(0.08, 4.0, 6.0), loc=(x, -1.0, 3.0))
    pane.data.materials.append(glass_mat)

# Soft cyan wall panels glow
for i, z in enumerate((1.5, 3.5, 5.5)):
    panel = box(f"GlowPanel_{i}", size=(0.05, 1.2, 1.4), loc=(5.8, 0.5 + i * 0.3, z))
    panel.data.materials.append(
        mat(f"PanelEmit_{i}", color=(0.2, 0.9, 0.85, 1), rough=1.0, emit=3.5, emit_color=(0.25, 0.85, 0.8, 1))
    )

# Ceiling structure
beam = box("Beam", size=(14, 0.3, 0.3), loc=(0, 0, 6.5))
beam.data.materials.append(mat("BeamMat", color=(0.15, 0.15, 0.17, 1), metal=0.7, rough=0.3))

# Lights
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("SunData", "SUN"))
sun.data.energy = 2.5
sun.data.color = (0.85, 0.92, 1.0)
sun.rotation_euler = (math.radians(35), math.radians(-20), math.radians(40))
link(sun)

area = bpy.data.objects.new("AtriumFill", bpy.data.lights.new("AtriumFillData", "AREA"))
area.data.energy = 60
area.data.size = 6
area.data.color = (0.6, 0.9, 0.95)
area.location = (1, 2, 5)
link(area)

cam_data = bpy.data.cameras.new("AtriumCam")
cam_data.lens = 28
cam = bpy.data.objects.new("AtriumCam", cam_data)
cam.location = (-3.5, 6.0, 2.2)
cam.rotation_euler = (math.radians(85), 0, math.radians(-28))
link(cam)
scene.camera = cam

fps = 24
frames = 192  # 8 seconds
scene.render.fps = fps
scene.frame_start = 1
scene.frame_end = frames

cam.keyframe_insert(data_path="location", frame=1)
cam.location = (-3.2, 5.7, 2.35)
cam.keyframe_insert(data_path="location", frame=frames // 2)
cam.location = (-3.5, 6.0, 2.2)
cam.keyframe_insert(data_path="location", frame=frames)

scene.render.engine = "BLENDER_EEVEE_NEXT" if hasattr(bpy.types, "BLENDER_EEVEE_NEXT") or True else "BLENDER_EEVEE"
try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except Exception:
    scene.render.engine = "BLENDER_EEVEE"

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.filepath = os.path.join(OUT, "frame_")
scene.render.image_settings.file_format = "PNG"

world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.015, 0.02, 0.028, 1)
bg.inputs[1].default_value = 0.35

print(f"Rendering atrium loop → {OUT}")
bpy.ops.render.render(animation=True)
print("Done.")

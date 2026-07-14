"""
Open MacBook-style laptop. Screen faces the keyboard/camera when open.
Named Screen_Display for R3F. Exports public/models/hero-laptop.glb
"""

from __future__ import annotations

import math
import os

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, *, color=(0.8, 0.8, 0.8, 1), metal=0.0, rough=0.35, emit=0.0, emit_color=None):
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


def apply(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj.select_set(False)


def bevel(obj, w=0.006, seg=4):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = w
    mod.segments = seg
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)


def box(name, sx, sy, sz, loc=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (sx, sy, sz)
    apply(o)
    return o


m_alu = mat("Alu", color=(0.82, 0.84, 0.86, 1), metal=1.0, rough=0.16)
m_dark = mat("Dark", color=(0.08, 0.08, 0.09, 1), metal=0.3, rough=0.4)
m_keys = mat("Keys", color=(0.14, 0.14, 0.15, 1), metal=0.05, rough=0.55)
m_screen = mat("Screen", color=(0.01, 0.02, 0.04, 1), metal=0.0, rough=0.2, emit=2.0, emit_color=(0.25, 0.4, 0.85, 1))
m_black = mat("Black", color=(0.02, 0.02, 0.025, 1), metal=0.1, rough=0.45)

W, D = 1.6, 1.08

# Base
base = box("Base", W, D, 0.055, (0, 0, 0.028))
base.data.materials.append(m_alu)
bevel(base, 0.01, 5)

# Keyboard surface
kb_plate = box("KeyPlate", W * 0.9, D * 0.48, 0.01, (0, 0.14, 0.06))
kb_plate.data.materials.append(m_keys)
bevel(kb_plate, 0.002, 2)

# Trackpad
pad = box("Pad", 0.58, 0.36, 0.006, (0, -0.28, 0.06))
pad.data.materials.append(m_alu)
bevel(pad, 0.005, 4)

# Hinge at rear of base (y negative)
hinge = bpy.data.objects.new("Hinge", None)
scene.collection.objects.link(hinge)
hinge.location = (0, -D * 0.5 + 0.02, 0.055)
# Open ~105° from closed. Closed lid rests on +Y; open stands with screen toward +Y camera.
hinge.rotation_euler = (math.radians(105), 0, 0)

# Outer lid (aluminum back) — in hinge local: thin in Y, tall in Z
lid = box("Lid", W, 0.04, D * 0.98, (0, 0.0, D * 0.49))
lid.parent = hinge
lid.location = (0, 0.01, D * 0.49)
lid.data.materials.append(m_alu)
bevel(lid, 0.008, 5)

# Inner black bezel / backing (opaque so screen isn't see-through)
backing = box("ScreenBack", W * 0.94, 0.01, D * 0.9, (0, -0.018, D * 0.49))
backing.parent = hinge
backing.location = (0, -0.018, D * 0.49)
backing.data.materials.append(m_black)

# Display — faces -Y in hinge local = toward keyboard / camera when open
bpy.ops.mesh.primitive_plane_add(size=1)
screen = bpy.context.active_object
screen.name = "Screen_Display"
screen.scale = (W * 0.88, D * 0.8, 1)
apply(screen)
screen.rotation_euler = (math.radians(-90), 0, 0)  # normal toward -Y
screen.parent = hinge
screen.location = (0, -0.025, D * 0.49)
screen.data.materials.append(m_screen)

# Webcam
cam = box("Cam", 0.04, 0.01, 0.04, (0, -0.02, D * 0.9))
cam.parent = hinge
cam.location = (0, -0.02, D * 0.92)
cam.data.materials.append(m_dark)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "models", "hero-laptop.glb")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=False, export_apply=True, export_yup=True)
print("Exported", OUT)

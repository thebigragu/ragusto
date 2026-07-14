"""
Arcform — Modern black leather wingback lounge chair (matches AI hero).
Chrome five-star swivel base, high back with wings, integrated headrest.
Exports: public/models/hero-chair.glb
"""

from __future__ import annotations

import math
import os

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


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
    # Leather sheen
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.45
    if "Coat Weight" in bsdf.inputs and metal < 0.2:
        bsdf.inputs["Coat Weight"].default_value = 0.35
        bsdf.inputs["Coat Roughness"].default_value = 0.25
    if emit > 0:
        bsdf.inputs["Emission Strength"].default_value = emit
        bsdf.inputs["Emission Color"].default_value = emit_color or color
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def apply_scale(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.select_set(False)


def box(name, size=(1, 1, 1), loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    apply_scale(obj)
    return obj


def cyl(name, r=0.5, depth=1, loc=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def sphere(name, r=0.5, loc=(0, 0, 0), segs=32):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=segs, ring_count=segs // 2)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def bevel(obj, width=0.02, segments=3):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)


m_leather = mat("LeatherBlack", color=(0.02, 0.02, 0.025, 1), metal=0.05, rough=0.38)
m_leather_soft = mat("LeatherSoft", color=(0.03, 0.03, 0.035, 1), metal=0.02, rough=0.48)
m_chrome = mat("Chrome", color=(0.88, 0.9, 0.93, 1), metal=1.0, rough=0.08)
m_dark_metal = mat("DarkMetal", color=(0.08, 0.09, 0.1, 1), metal=0.9, rough=0.25)

# --- Seat cushion ---
seat = box("Seat", size=(0.72, 0.7, 0.14), loc=(0, 0.05, 0.42))
seat.data.materials.append(m_leather)
bevel(seat, 0.035, 4)

# Slight seat scoop via second layer
seat_pad = box("SeatPad", size=(0.62, 0.58, 0.05), loc=(0, 0.02, 0.5))
seat_pad.data.materials.append(m_leather_soft)
bevel(seat_pad, 0.03, 3)

# --- Backrest (tall wingback) ---
back = box("Back", size=(0.72, 0.12, 0.95), loc=(0, -0.32, 0.95))
back.data.materials.append(m_leather)
bevel(back, 0.04, 4)

# Wings (left / right)
for side, x in (("L", -0.34), ("R", 0.34)):
    wing = box(f"Wing_{side}", size=(0.14, 0.35, 0.55), loc=(x, -0.12, 0.95), rot=(0.15, 0, 0.12 if side == "L" else -0.12))
    wing.data.materials.append(m_leather)
    bevel(wing, 0.03, 3)

# Headrest cushion
head = box("Headrest", size=(0.42, 0.14, 0.18), loc=(0, -0.22, 1.32))
head.data.materials.append(m_leather_soft)
bevel(head, 0.04, 4)

# Armrests
for side, x in (("L", -0.38), ("R", 0.38)):
    arm = box(f"Arm_{side}", size=(0.12, 0.55, 0.1), loc=(x, 0.05, 0.62))
    arm.data.materials.append(m_leather)
    bevel(arm, 0.025, 3)
    arm_post = box(f"ArmPost_{side}", size=(0.1, 0.1, 0.22), loc=(x, -0.18, 0.52))
    arm_post.data.materials.append(m_leather)

# --- Chrome star base ---
hub = cyl("BaseHub", r=0.09, depth=0.08, loc=(0, 0.02, 0.12), verts=32)
hub.data.materials.append(m_chrome)

column = cyl("Column", r=0.035, depth=0.32, loc=(0, 0.02, 0.28), verts=24)
column.data.materials.append(m_chrome)

# Five legs
for i in range(5):
    ang = i * (2 * math.pi / 5) + 0.2
    lx = math.cos(ang) * 0.28
    ly = math.sin(ang) * 0.28
    leg = box(f"Leg_{i}", size=(0.42, 0.05, 0.035), loc=(lx * 0.55, ly * 0.55 + 0.02, 0.06), rot=(0, 0, ang))
    leg.data.materials.append(m_chrome)
    bevel(leg, 0.008, 2)
    # Caster
    caster = sphere(f"Caster_{i}", r=0.035, loc=(math.cos(ang) * 0.42, math.sin(ang) * 0.42 + 0.02, 0.035), segs=20)
    caster.data.materials.append(m_dark_metal)

# Origin at floor center
root = bpy.data.objects.new("HeroChair", None)
root.empty_display_size = 0.2
link(root)
for obj in list(scene.collection.objects):
    if obj != root and obj.parent is None and obj.type == "MESH":
        obj.parent = root

# Export
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "models", "hero-chair.glb")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_yup=True,
)
print(f"Exported {OUT}")

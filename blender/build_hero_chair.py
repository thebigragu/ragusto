"""
Arcform — Sleek black leather wingback matching the AI hero still.
Rounded cushions, chrome five-star base. Subdivision for soft leather.
Exports: public/models/hero-chair.glb
"""

from __future__ import annotations

import math
import os

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, *, color=(0.8, 0.8, 0.8, 1), metal=0.0, rough=0.4):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    if "Coat Weight" in bsdf.inputs and metal < 0.3:
        bsdf.inputs["Coat Weight"].default_value = 0.4
        bsdf.inputs["Coat Roughness"].default_value = 0.22
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.5
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


def soft_box(name, size, loc, rot=(0, 0, 0), bevel_w=0.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    apply_scale(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    b = obj.modifiers.new("Bevel", "BEVEL")
    b.width = bevel_w
    b.segments = 5
    b.limit_method = "ANGLE"
    s = obj.modifiers.new("Subsurf", "SUBSURF")
    s.levels = 2
    s.render_levels = 2
    bpy.ops.object.modifier_apply(modifier=b.name)
    bpy.ops.object.modifier_apply(modifier=s.name)
    obj.select_set(False)
    return obj


def cyl(name, r, depth, loc, verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def sphere(name, r, loc, segs=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=segs, ring_count=segs // 2)
    return bpy.context.active_object


m_leather = mat("Leather", color=(0.018, 0.018, 0.022, 1), metal=0.04, rough=0.36)
m_leather2 = mat("LeatherSoft", color=(0.025, 0.025, 0.03, 1), metal=0.02, rough=0.45)
m_chrome = mat("Chrome", color=(0.9, 0.92, 0.95, 1), metal=1.0, rough=0.07)
m_dark = mat("Caster", color=(0.05, 0.05, 0.06, 1), metal=0.85, rough=0.3)

# Seat — thick cushioned
seat = soft_box("Seat", (0.78, 0.72, 0.16), (0, 0.08, 0.44), bevel_w=0.05)
seat.data.materials.append(m_leather)

# Back — tall curved wingback feel via thick bevels
back = soft_box("Back", (0.78, 0.14, 1.05), (0, -0.3, 1.0), bevel_w=0.055)
back.data.materials.append(m_leather)

# Wings
for side, x, twist in (("L", -0.38, 0.18), ("R", 0.38, -0.18)):
    wing = soft_box(f"Wing_{side}", (0.16, 0.42, 0.62), (x, -0.08, 0.98), rot=(0.2, 0, twist), bevel_w=0.045)
    wing.data.materials.append(m_leather)

# Headrest pillow
head = soft_box("Headrest", (0.48, 0.16, 0.2), (0, -0.2, 1.4), bevel_w=0.05)
head.data.materials.append(m_leather2)

# Arms
for side, x in (("L", -0.42), ("R", 0.42)):
    arm = soft_box(f"Arm_{side}", (0.13, 0.58, 0.11), (x, 0.08, 0.64), bevel_w=0.035)
    arm.data.materials.append(m_leather)
    post = soft_box(f"Post_{side}", (0.11, 0.11, 0.24), (x, -0.18, 0.54), bevel_w=0.025)
    post.data.materials.append(m_leather)

# Chrome base
hub = cyl("Hub", 0.095, 0.07, (0, 0.05, 0.11), 40)
hub.data.materials.append(m_chrome)
col = cyl("Column", 0.032, 0.34, (0, 0.05, 0.28), 32)
col.data.materials.append(m_chrome)

for i in range(5):
    ang = i * (2 * math.pi / 5) + 0.15
    bpy.ops.mesh.primitive_cube_add(size=1, location=(math.cos(ang) * 0.22, math.sin(ang) * 0.22 + 0.05, 0.055), rotation=(0, 0, ang))
    leg = bpy.context.active_object
    leg.name = f"Leg_{i}"
    leg.scale = (0.4, 0.045, 0.03)
    apply_scale(leg)
    bpy.context.view_layer.objects.active = leg
    leg.select_set(True)
    b = leg.modifiers.new("Bevel", "BEVEL")
    b.width = 0.01
    b.segments = 3
    bpy.ops.object.modifier_apply(modifier=b.name)
    leg.select_set(False)
    leg.data.materials.append(m_chrome)
    caster = sphere(f"Caster_{i}", 0.032, (math.cos(ang) * 0.4, math.sin(ang) * 0.4 + 0.05, 0.032))
    caster.data.materials.append(m_dark)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "models", "hero-chair.glb")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=False, export_apply=True, export_yup=True)
print(f"Exported {OUT}")

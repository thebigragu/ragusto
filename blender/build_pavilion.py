"""
Arcform — Immersive pavilion landscape (Blender headless).
Exports: public/models/studio-pavilion.glb

Minimalist glass pavilion + rock masses for luxury studio process section.
"""

import os
import math
import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


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
            bsdf.inputs["Transmission Weight"].default_value = 0.7
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def box(name, size=(1, 1, 1), loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return obj


def sphere(name, r=0.5, loc=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=32, ring_count=16)
    obj = bpy.context.active_object
    obj.name = name
    return obj


m_concrete = mat("Concrete", color=(0.85, 0.87, 0.9, 1), metal=0.15, rough=0.35)
m_glass = mat("PavilionGlass", color=(0.6, 0.8, 0.95, 1), metal=0.0, rough=0.05, alpha=0.35, emit=0.4, emit_color=(0.3, 0.7, 1.0, 1))
m_glow = mat("InteriorGlow", color=(0.2, 0.5, 0.8, 1), metal=0.0, rough=0.5, emit=3.5, emit_color=(0.4, 0.8, 1.0, 1))
m_rock = mat("Rock", color=(0.12, 0.1, 0.09, 1), metal=0.0, rough=0.92)
m_rock_warm = mat("RockWarm", color=(0.25, 0.14, 0.1, 1), metal=0.0, rough=0.9)
m_ground = mat("Ground", color=(0.04, 0.035, 0.03, 1), metal=0.0, rough=1.0)
m_orb = mat("RoofOrb", color=(0.8, 0.95, 1.0, 1), metal=0.2, rough=0.2, emit=4.0, emit_color=(0.5, 0.85, 1.0, 1))

# Pavilion volumes
main = box("PavilionMain", size=(1.8, 1.1, 0.9), loc=(0, 0, 0.45))
main.data.materials.append(m_concrete)
upper = box("PavilionUpper", size=(1.1, 0.85, 0.55), loc=(0.35, -0.1, 1.05))
upper.data.materials.append(m_concrete)
wing = box("PavilionWing", size=(0.55, 0.7, 0.7), loc=(-0.95, 0.1, 0.35))
wing.data.materials.append(m_concrete)

# Glass panes
g1 = box("GlassFront", size=(1.4, 0.02, 0.65), loc=(0, 0.56, 0.45))
g1.data.materials.append(m_glass)
g2 = box("GlassUpper", size=(0.75, 0.02, 0.4), loc=(0.35, 0.33, 1.05))
g2.data.materials.append(m_glass)
interior = box("InteriorLight", size=(1.5, 0.8, 0.6), loc=(0, 0, 0.45))
interior.data.materials.append(m_glow)

orb = sphere("RoofOrb", r=0.09, loc=(0.5, -0.05, 1.45))
orb.data.materials.append(m_orb)

# Rock masses — stacked boxes for sedimentary look
def rock_mass(name, loc, scale=1.0, warm=False):
    material = m_rock_warm if warm else m_rock
    a = box(f"{name}_A", size=(1.4 * scale, 1.0 * scale, 2.2 * scale), loc=loc)
    a.data.materials.append(material)
    b = box(
        f"{name}_B",
        size=(0.9 * scale, 0.8 * scale, 1.4 * scale),
        loc=(loc[0] + 0.35 * scale, loc[1] + 0.2 * scale, loc[2] - 0.2 * scale),
        rot=(0.1, -0.3, 0.1),
    )
    b.data.materials.append(material)
    c = box(
        f"{name}_C",
        size=(0.7 * scale, 0.6 * scale, 0.9 * scale),
        loc=(loc[0] - 0.3 * scale, loc[1] - 0.2 * scale, loc[2] + 0.5 * scale),
    )
    c.data.materials.append(material)


rock_mass("RockL", (-2.5, -1.0, 0.8), scale=1.1)
rock_mass("RockR", (2.7, -0.6, 0.9), scale=1.3, warm=True)
rock_mass("RockBack", (0.2, -2.2, 1.2), scale=1.5)
rock_mass("RockNear", (-3.0, 0.8, 0.4), scale=0.85)

# Ground
bpy.ops.mesh.primitive_cylinder_add(radius=10, depth=0.05, location=(0, 0, -0.02), vertices=64)
ground = bpy.context.active_object
ground.name = "Ground"
ground.data.materials.append(m_ground)

for obj in list(scene.objects):
    if obj.type == "MESH":
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
    else:
        obj.select_set(False)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
out = os.path.join(root, "public", "models", "studio-pavilion.glb")
os.makedirs(os.path.dirname(out), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=out,
    export_format="GLB",
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials="EXPORT",
    export_lights=False,
    export_cameras=False,
    export_yup=True,
)

print("EXPORTED", out)

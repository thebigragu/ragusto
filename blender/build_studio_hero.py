"""
Arcform — Luxury design studio hero set (Blender headless).
Exports: public/models/studio-hero.glb

Imagery: glass desk, dual design monitors, floating boards,
sculptural orb pedestal, soft lamp — premium AI/design studio.
No rockets, no microchips.
"""

import math
import os
import sys

import bpy

# --- reset ---
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, *, color=(0.8, 0.8, 0.8, 1), metal=0.0, rough=0.4, emit=0.0, emit_color=None, alpha=1.0, ior=1.45):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if emit > 0:
        bsdf.inputs["Emission Strength"].default_value = emit
        bsdf.inputs["Emission Color"].default_value = emit_color or color
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.85
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.85
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def mesh_obj(name, verts, faces):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    return link(obj)


def box(name, size=(1, 1, 1), loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return obj


def cylinder(name, r=0.5, depth=1, loc=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def sphere(name, r=0.5, loc=(0, 0, 0), segs=48):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=segs, ring_count=segs // 2)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def plane(name, size=1, loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    return obj


# Materials
m_black_metal = mat("BlackMetal", color=(0.05, 0.055, 0.07, 1), metal=0.92, rough=0.22)
m_silver = mat("Silver", color=(0.72, 0.75, 0.8, 1), metal=0.95, rough=0.18)
m_glass = mat("GlassDesk", color=(0.85, 0.9, 0.95, 1), metal=0.0, rough=0.05, alpha=0.25, ior=1.5)
m_marble = mat("Marble", color=(0.92, 0.91, 0.89, 1), metal=0.05, rough=0.35)
m_warm_emit = mat("WarmScreen", color=(0.1, 0.12, 0.18, 1), metal=0.0, rough=0.4, emit=2.5, emit_color=(0.35, 0.55, 1.0, 1))
m_teal_emit = mat("TealBoard", color=(0.08, 0.12, 0.14, 1), metal=0.1, rough=0.35, emit=1.8, emit_color=(0.15, 0.75, 0.7, 1))
m_violet_emit = mat("VioletBoard", color=(0.1, 0.08, 0.14, 1), metal=0.1, rough=0.35, emit=1.6, emit_color=(0.45, 0.35, 0.95, 1))
m_lamp = mat("LampShade", color=(0.95, 0.93, 0.88, 1), metal=0.0, rough=0.5, emit=3.0, emit_color=(1.0, 0.92, 0.8, 1))
m_chrome = mat("Chrome", color=(0.9, 0.92, 0.95, 1), metal=1.0, rough=0.08)
m_dark_ui = mat("DarkUI", color=(0.08, 0.09, 0.11, 1), metal=0.3, rough=0.4)

# --- Desk ---
top = box("DeskTop", size=(2.4, 1.1, 0.04), loc=(0, 0, 0.72))
top.data.materials.append(m_glass)

leg_l = box("DeskLegL", size=(0.06, 0.9, 0.72), loc=(-1.05, 0, 0.36))
leg_r = box("DeskLegR", size=(0.06, 0.9, 0.72), loc=(1.05, 0, 0.36))
leg_l.data.materials.append(m_black_metal)
leg_r.data.materials.append(m_black_metal)

rail = box("DeskRail", size=(2.1, 0.05, 0.04), loc=(0, -0.4, 0.2))
rail.data.materials.append(m_chrome)

# --- Dual monitors ---
for i, x in enumerate((-0.55, 0.55)):
    stand = cylinder(f"MonStand{i}", r=0.08, depth=0.35, loc=(x, -0.25, 0.9))
    stand.data.materials.append(m_black_metal)
    base = cylinder(f"MonBase{i}", r=0.18, depth=0.03, loc=(x, -0.25, 0.74))
    base.data.materials.append(m_black_metal)
    bezel = box(f"MonBezel{i}", size=(0.85, 0.04, 0.55), loc=(x, -0.28, 1.25))
    bezel.data.materials.append(m_black_metal)
    screen = box(f"MonScreen{i}", size=(0.78, 0.01, 0.48), loc=(x, -0.255, 1.25))
    screen.data.materials.append(m_warm_emit if i == 0 else m_teal_emit)

# --- Floating design boards ---
board1 = box("BoardA", size=(0.7, 0.02, 0.95), loc=(-1.7, 0.3, 1.35), rot=(0.15, 0.25, 0.4))
board1.data.materials.append(m_violet_emit)
board2 = box("BoardB", size=(0.55, 0.02, 0.75), loc=(1.75, 0.15, 1.55), rot=(-0.1, -0.3, -0.25))
board2.data.materials.append(m_teal_emit)
board3 = box("BoardC", size=(0.45, 0.015, 0.6), loc=(-1.4, 0.6, 0.95), rot=(0.2, 0.1, 0.5))
board3.data.materials.append(m_warm_emit)

# Frame edges for boards
for b in (board1, board2, board3):
    # subtle chrome rim via thin scaled copy
    pass

# --- Sculptural orb on pedestal ---
pedestal = cylinder("Pedestal", r=0.22, depth=0.55, loc=(1.5, 0.55, 0.275))
pedestal.data.materials.append(m_marble)
orb = sphere("Orb", r=0.2, loc=(1.5, 0.55, 0.72))
orb.data.materials.append(m_chrome)
# glass outer shell
shell = sphere("OrbShell", r=0.24, loc=(1.5, 0.55, 0.72))
shell.data.materials.append(m_glass)

# --- Desk lamp ---
lamp_arm = cylinder("LampArm", r=0.02, depth=0.7, loc=(-1.0, 0.35, 1.15))
lamp_arm.rotation_euler = (0.9, 0, 0.4)
lamp_arm.data.materials.append(m_chrome)
lamp_base = cylinder("LampBase", r=0.12, depth=0.03, loc=(-1.15, 0.45, 0.75))
lamp_base.data.materials.append(m_black_metal)
shade = cylinder("LampShade", r=0.14, depth=0.12, loc=(-0.85, 0.15, 1.45))
shade.data.materials.append(m_lamp)

# --- Keyboard / trackpad suggestion ---
kb = box("Keyboard", size=(0.55, 0.22, 0.02), loc=(0, 0.15, 0.75))
kb.data.materials.append(m_dark_ui)
pad = box("Trackpad", size=(0.18, 0.14, 0.01), loc=(0.45, 0.15, 0.745))
pad.data.materials.append(m_silver)

# --- Soft floor disc (for contact shadow catcher in engine) ---
floor = cylinder("FloorDisc", r=2.8, depth=0.02, loc=(0, 0, 0.01))
floor.data.materials.append(mat("Floor", color=(0.02, 0.025, 0.04, 1), metal=0.0, rough=0.95))

# --- Lights (baked into look via emissives; also add for viewport) ---
light_data = bpy.data.lights.new(name="Key", type="AREA")
light_data.energy = 200
light_data.size = 2.5
light_obj = bpy.data.objects.new(name="Key", object_data=light_data)
light_obj.location = (1.5, -2.0, 3.0)
link(light_obj)

fill = bpy.data.lights.new(name="Fill", type="AREA")
fill.energy = 80
fill.size = 3
fill_obj = bpy.data.objects.new(name="Fill", object_data=fill)
fill_obj.location = (-2.0, 1.5, 2.2)
link(fill_obj)

# Apply transforms on meshes only
for obj in list(scene.objects):
    if obj.type == "MESH":
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
    else:
        obj.select_set(False)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# Export path
root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
out = os.path.join(root, "public", "models", "studio-hero.glb")
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

"""
Arcform — Luxury night lounge hero (Blender 5.x headless).
Exports: public/models/arcform-lounge.glb

Scene: polished floor, concrete wall, window light, sculptural table,
holographic screen frames (named Screen_A/B/C for R3F canvas textures),
chrome lamp accents. Chair is loaded in R3F (Poly Haven) for PBR fidelity.
"""

from __future__ import annotations

import math
import os
import struct
import zlib

import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys() else "CYCLES"


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "models", "arcform-lounge.glb")
TEX = os.path.join(ROOT, "public", "models", "screen-ui")


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def write_png(path: str, w: int, h: int, rgba: bytes) -> None:
    """Minimal PNG writer (RGBA8)."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + rgba[y * w * 4 : (y + 1) * w * 4] for y in range(h))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def make_ui_texture(path: str, tint=(80, 230, 210), seed=1) -> str:
    w, h = 512, 768
    px = bytearray(w * h * 4)
    r, g, b = tint
    for y in range(h):
        for x in range(w):
            i = (y * w + x) * 4
            # dark glass base
            px[i : i + 4] = bytes((8, 14, 18, 210))
            # grid
            if x % 32 == 0 or y % 32 == 0:
                px[i : i + 4] = bytes((r // 4, g // 4, b // 4, 230))
            # waveform band
            wave = int(40 + 18 * math.sin((x + seed * 40) * 0.04) + 10 * math.sin(y * 0.02))
            if abs(y - (180 + wave)) < 2:
                px[i : i + 4] = bytes((r, g, b, 255))
            # bars
            if 420 < y < 560 and 40 < x < w - 40:
                bar_i = (x - 40) // 28
                height = 20 + ((bar_i * 17 + seed * 13) % 90)
                if y > 560 - height and (x - 40) % 28 < 14:
                    px[i : i + 4] = bytes((r, g, b, 240))
            # scan line
            if y % 96 == (seed * 11) % 96:
                px[i] = min(255, px[i] + 40)
                px[i + 1] = min(255, px[i + 1] + 60)
                px[i + 2] = min(255, px[i + 2] + 50)
            # corner brackets
            if (x < 18 or x > w - 19) and (y < 18 or y > h - 19):
                if x < 4 or x > w - 5 or y < 4 or y > h - 5:
                    px[i : i + 4] = bytes((r, g, b, 255))
    write_png(path, w, h, bytes(px))
    return path


def mat(name, *, color=(0.8, 0.8, 0.8, 1), metal=0.0, rough=0.4, emit=0.0, emit_color=None, alpha=1.0, ior=1.45, transmission=0.0):
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
    if transmission > 0:
        key = "Transmission Weight" if "Transmission Weight" in bsdf.inputs else "Transmission"
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = transmission
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def mat_textured(name, image_path, emit=2.2):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex = nt.nodes.new("ShaderNodeTexImage")
    img = bpy.data.images.load(image_path)
    tex.image = img
    bsdf.inputs["Metallic"].default_value = 0.15
    bsdf.inputs["Roughness"].default_value = 0.25
    bsdf.inputs["Emission Strength"].default_value = emit
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def apply_mesh_scale(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.select_set(False)


def box(name, size=(1, 1, 1), loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    apply_mesh_scale(obj)
    return obj


def cylinder(name, r=0.5, depth=1, loc=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def plane(name, size=1, loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    return obj


ensure_dir(TEX)
ui_a = make_ui_texture(os.path.join(TEX, "screen_a.png"), (56, 220, 210), 1)
ui_b = make_ui_texture(os.path.join(TEX, "screen_b.png"), (80, 180, 255), 2)
ui_c = make_ui_texture(os.path.join(TEX, "screen_c.png"), (120, 200, 255), 3)

m_floor = mat("Floor", color=(0.04, 0.045, 0.05, 1), metal=0.35, rough=0.12)
m_wall = mat("Wall", color=(0.07, 0.075, 0.08, 1), metal=0.05, rough=0.55)
m_slat = mat("Slat", color=(0.045, 0.048, 0.052, 1), metal=0.1, rough=0.4)
m_chrome = mat("Chrome", color=(0.85, 0.88, 0.92, 1), metal=1.0, rough=0.08)
m_glass = mat("Glass", color=(0.8, 0.88, 0.95, 1), metal=0.0, rough=0.04, alpha=0.22, transmission=0.92, ior=1.5)
m_marble = mat("Marble", color=(0.12, 0.12, 0.13, 1), metal=0.15, rough=0.25)
m_led = mat("WarmLED", color=(1, 0.75, 0.45, 1), metal=0.0, rough=0.4, emit=6.0, emit_color=(1.0, 0.72, 0.4, 1))
m_frame = mat("HoloFrame", color=(0.1, 0.2, 0.22, 1), metal=0.6, rough=0.2, emit=1.2, emit_color=(0.2, 0.9, 0.85, 1))
m_screen_a = mat_textured("ScreenA", ui_a, emit=2.8)
m_screen_b = mat_textured("ScreenB", ui_b, emit=2.6)
m_screen_c = mat_textured("ScreenC", ui_c, emit=2.4)
m_city = mat("CityGlow", color=(0.2, 0.15, 0.08, 1), metal=0.0, rough=1.0, emit=1.4, emit_color=(1.0, 0.7, 0.35, 1))

# Floor
floor = plane("Floor", size=14, loc=(0, 0, 0))
floor.data.materials.append(m_floor)

# Back wall + vertical slats
wall = box("BackWall", size=(8, 0.25, 4.2), loc=(1.2, -2.4, 2.1))
wall.data.materials.append(m_wall)
for i in range(18):
    x = -1.6 + i * 0.28
    slat = box(f"Slat_{i}", size=(0.06, 0.08, 3.6), loc=(x + 1.5, -2.25, 1.9))
    slat.data.materials.append(m_slat)

# Warm LED cove
led = box("WarmLED", size=(6.5, 0.04, 0.03), loc=(1.2, -2.2, 0.08))
led.data.materials.append(m_led)

# Window / city light plane (left)
window = plane("CityWindow", size=5.5, loc=(-3.6, -0.2, 2.0), rot=(math.pi / 2, 0, math.pi / 2))
window.scale = (1.0, 0.85, 1)
apply_mesh_scale(window)
window.data.materials.append(m_city)

# Coffee table
top = cylinder("TableTop", r=0.55, depth=0.04, loc=(-0.85, 0.55, 0.42), verts=64)
top.data.materials.append(m_marble)
rim = cylinder("TableRim", r=0.56, depth=0.015, loc=(-0.85, 0.55, 0.40), verts=64)
rim.data.materials.append(m_chrome)
base = cylinder("TableBase", r=0.12, depth=0.38, loc=(-0.85, 0.55, 0.2), verts=32)
base.data.materials.append(m_chrome)

# Glass on table
glass = cylinder("Drink", r=0.05, depth=0.12, loc=(-0.7, 0.45, 0.5), verts=24)
glass.data.materials.append(m_glass)

# Credenza
cred = box("Credenza", size=(2.4, 0.45, 0.55), loc=(1.4, -1.85, 0.28))
cred.data.materials.append(m_wall)

# Holographic screens (named for R3F)
screens = [
    ("Screen_A", (0.55, -1.35, 1.55), (0, 0.25, -0.18), (0.72, 1.05), m_screen_a),
    ("Screen_B", (1.25, -1.55, 1.75), (0, -0.08, 0.12), (0.68, 1.15), m_screen_b),
    ("Screen_C", (1.95, -1.25, 1.45), (0, -0.22, 0.28), (0.7, 0.95), m_screen_c),
]

for name, loc, rot, size, material in screens:
    frame = box(f"{name}_Frame", size=(size[0] + 0.04, 0.03, size[1] + 0.04), loc=loc, rot=rot)
    frame.data.materials.append(m_frame)
    panel = plane(name, size=1, loc=(loc[0], loc[1] + 0.02, loc[2]), rot=(math.pi / 2 + rot[0], rot[1], rot[2]))
    panel.scale = (size[0], size[1], 1)
    apply_mesh_scale(panel)
    panel.data.materials.append(material)

# Soft area lights (as meshes for glTF — real lights may not export)
key = plane("KeyLightCard", size=1.8, loc=(-2.2, 1.5, 3.2), rot=(1.1, 0, -0.4))
key.data.materials.append(mat("KeyEmit", color=(1, 1, 1, 1), emit=3.5, emit_color=(0.85, 0.9, 1.0, 1)))
fill = plane("FillLightCard", size=1.2, loc=(2.8, 0.8, 2.4), rot=(1.2, 0, 0.6))
fill.data.materials.append(mat("FillEmit", color=(1, 1, 1, 1), emit=1.8, emit_color=(0.4, 0.9, 0.95, 1)))

# Origin marker empty for R3F alignment
empty = bpy.data.objects.new("ArcformOrigin", None)
empty.empty_display_size = 0.3
link(empty)

# Export
ensure_dir(os.path.dirname(OUT))
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_yup=True,
)
print(f"Exported {OUT}")

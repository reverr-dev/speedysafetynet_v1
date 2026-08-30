#!/usr/bin/env python3
"""
Stamp the company mark onto every product and project photograph.

    python scripts/watermark.py            # stamp anything not yet stamped
    python scripts/watermark.py --force    # redo everything
    python scripts/watermark.py --check    # report only, change nothing

Why the mark is burned into the file rather than laid over it in CSS.

A CSS overlay would be less work and easier to restyle, but it vanishes the
moment somebody right-clicks and saves the picture — which is exactly when the
client wants his name on it. These are his own photographs of his own
installations, and a competitor lifting them is a real thing that happens in
this trade. Burned in, the mark travels with the file.

Originals are kept untouched in public/images/_originals/ so this is always
reversible and never compounds — stamping a stamped image would darken the
mark a little more each run, and after three runs it looks like a mistake.

Requires Pillow:  pip install pillow
"""

import sys
from pathlib import Path

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public/images/brand/iso-logo.png"
ORIGINALS = ROOT / "public/images/_originals"

# Folders whose contents get the mark. The brand folder is deliberately absent
# — stamping the logo onto itself would be silly.
TARGETS = ["public/images/products", "public/images/projects", "public/images/ground"]

# Pictures that already carry the mark in their own pixels.
#
# These four are the client's own marketing artwork, not photographs — he
# designed them with the gear device and the web address already on them, in
# some cases twice. Stamping ours on top put a third gear directly over the
# one he had placed in the corner, which looked like a mistake rather than a
# signature. Paths are relative to public/images/.
#
# If a file is listed here and has already been stamped, the next run puts the
# clean original back.
ALREADY_BRANDED = {
    "products/anti-bird-net.jpg",
    "products/construction-fall-safety-net.jpg",
    "products/invisible-grill.jpg",
    "products/premium-artificial-grass-40mm.jpg",
}

# Fraction of the image width the mark should occupy.
#
# The client asked specifically for his logo to be "visible perfectly", so this
# is sized and weighted to be read at a glance on a phone rather than to sit
# discreetly in a corner. It is his mark and his instruction; a watermark he
# has to squint at does not do the job he wants it to do.
LOGO_WIDTH_RATIO = 0.30
MARGIN_RATIO = 0.035
OPACITY = 0.95

# Hard limits on the mark's rendered width, in pixels.
#
# The ratio alone misbehaves at both ends. On a 1400px photograph 30% is a
# 420px logo that stops being a signature and becomes the subject. On a 300px
# thumbnail crop it is 90px, at which size the web address inside the mark is
# no longer legible — so the picture carries a blue smudge that protects
# nothing and just looks dirty.
#
# Below the minimum the image is left clean rather than stamped badly. A
# thumbnail is not the file a competitor lifts anyway; the full-size one is,
# and that one is comfortably above the floor.
MIN_LOGO_WIDTH = 150
MAX_LOGO_WIDTH = 340

# Halo behind the mark so it reads on both a bright turf photo and a dark
# wooden floor. Blur is in pixels; strength multiplies the silhouette's alpha.
HALO_BLUR = 4
HALO_STRENGTH = 2.6

# Anything smaller than this is a thumbnail-grade crop; a mark on it would
# cover the product rather than sign it.
MIN_SIDE = 260


def stamped_marker(path: Path) -> Path:
    """Sidecar holding the clean original of a file we have stamped."""
    return ORIGINALS / f"{path.parent.name}__{path.name}"


def legacy_marker(path: Path) -> Path:
    """Empty flag: "this file is stamped, but no clean original was kept."

    An early version of this script did not save originals. The pictures it
    marked are perfectly fine — one mark each, correctly placed — but there is
    nothing to roll them back to, and nothing on disk to distinguish them from
    a picture that has never been touched.

    Without this flag the next ordinary run would read them as unstamped and
    put a second mark on top of the first. The flag is empty on purpose: it
    records a fact, it is not a backup.
    """
    return ORIGINALS / f"{path.parent.name}__{path.name}.stamped-no-original"


def restore(path: Path) -> str:
    """Put the clean original back over a file we should not have stamped.

    Used when a picture moves into ALREADY_BRANDED, or drops below the legible
    logo width, after an earlier run has already marked it. Without this the
    bad stamp would stay on disk forever — the sidecar exists, so the normal
    path would report "already stamped" and skip it.
    """
    original = stamped_marker(path)
    if not original.exists():
        return "left clean"
    Image.open(original).convert("RGB").save(
        path, "JPEG", quality=86, optimize=True, progressive=True
    )
    original.unlink()
    return "restored to the clean original"


def stamp(path: Path, logo: Image.Image, rel: str, force: bool) -> str:
    original = stamped_marker(path)

    # Every reason NOT to stamp is settled before the sidecar is written.
    #
    # Order matters here. Creating the sidecar first and bailing out after it
    # would put a clean file through restore() — a needless JPEG re-encode that
    # loses a little quality every time the script runs.
    if rel in ALREADY_BRANDED:
        return f"{restore(path)} — the client's artwork already carries the mark"

    # Measure the clean version, not whatever is on disk: on a re-run the file
    # in place is already marked.
    with Image.open(original if original.exists() else path) as probe:
        width, height = probe.size

    if min(width, height) < MIN_SIDE:
        return f"{restore(path)} — {width}x{height} is too small to sign"

    target_w = int(width * LOGO_WIDTH_RATIO)
    if target_w < MIN_LOGO_WIDTH:
        return (
            f"{restore(path)} — at {width}px wide the mark would be "
            f"{target_w}px and unreadable"
        )
    target_w = min(target_w, MAX_LOGO_WIDTH)

    if legacy_marker(path).exists():
        # Stamped, but by a version of this script that kept nothing to go
        # back to. Leave it exactly as it is, under --force too: re-stamping
        # would put a second mark on the first, and that is not undoable.
        return "already stamped (no clean original kept — cannot be redone)"

    if original.exists() and not force:
        return "already stamped"

    # First run for this file: keep the clean version before touching it.
    if not original.exists():
        original.parent.mkdir(parents=True, exist_ok=True)
        Image.open(path).save(original)

    # On a re-run, always start from the clean original so the mark never
    # compounds.
    base = Image.open(original).convert("RGBA")

    mark = logo.resize(
        (target_w, max(1, round(logo.height * target_w / logo.width))),
        Image.LANCZOS,
    )

    if OPACITY < 1:
        alpha = mark.getchannel("A").point(lambda v: int(v * OPACITY))
        mark.putalpha(alpha)

    # A soft white halo behind the mark.
    #
    # Without it the logo is dark blue on whatever happens to be underneath,
    # and on the safety-net photograph — dark blue rope on dark brown wood —
    # the URL simply vanishes. The halo is the mark's own silhouette, blurred
    # and painted white, so it hugs the shape instead of sitting behind it as
    # an obvious box.
    halo_src = mark.getchannel("A").filter(ImageFilter.GaussianBlur(HALO_BLUR))
    halo_src = halo_src.point(lambda v: min(255, int(v * HALO_STRENGTH)))
    halo = Image.new("RGBA", mark.size, (255, 255, 255, 0))
    halo.putalpha(halo_src)

    margin = int(base.width * MARGIN_RATIO)
    pos = (base.width - mark.width - margin, base.height - mark.height - margin)

    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.paste(halo, pos, halo)
    layer.paste(mark, pos, mark)
    out = Image.alpha_composite(base, layer).convert("RGB")

    out.save(path, "JPEG", quality=86, optimize=True, progressive=True)
    return "stamped"


def main() -> int:
    force = "--force" in sys.argv
    check_only = "--check" in sys.argv

    if not LOGO.exists():
        sys.exit(f"Logo not found at {LOGO}")

    logo = Image.open(LOGO).convert("RGBA")
    counts: dict[str, int] = {}

    for folder in TARGETS:
        d = ROOT / folder
        if not d.is_dir():
            continue
        files = sorted(p for p in d.iterdir() if p.suffix.lower() in {".jpg", ".jpeg"})
        if not files:
            continue

        print(f"\n{folder}")
        for f in files:
            rel = f"{f.parent.name}/{f.name}"
            if check_only:
                if rel in ALREADY_BRANDED:
                    result = "artwork — left alone"
                elif legacy_marker(f).exists():
                    result = "stamped (no clean original)"
                elif stamped_marker(f).exists():
                    result = "stamped"
                else:
                    result = "NOT stamped"
            else:
                result = stamp(f, logo, rel, force)
            # Group by the verb, not the explanation after the dash — and stop
            # at the first bracket too, or every parenthetical becomes its own
            # tally line.
            key = result.split(" —")[0].split(" (")[0]
            counts[key] = counts.get(key, 0) + 1
            print(f"  {f.name:<42} {result}")

    print("\n" + ", ".join(f"{v} {k}" for k, v in sorted(counts.items())))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

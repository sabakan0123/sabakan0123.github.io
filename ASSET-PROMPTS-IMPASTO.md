# Impasto revision — 2026-10-12

Mode: built-in image_gen, no CLI fallback. Generated PNGs were converted to WebP with Sharp; the paw's alpha channel is preserved.

## Cat paw

Output: `assets/tuxedo-paw-impasto.webp` (1600 × 800).
Edit target: `assets/tuxedo-paw.webp`.

Prompt:

> Edit target: the existing horizontal tuxedo cat forepaw asset. Create its replacement for a website scratch animation. MUST be a radically more painterly, tactile OIL PAINTING, not photographic fur. SINGLE forearm only, black arm extends off the LEFT edge, white four-toed shorthaired paw with small ivory claws points to the RIGHT, top/three-quarter view. Wide 2:1 composition, paw and claws occupy rightmost half, horizontal arm aligned center. Real transparent background, no other objects, no scratch lines, no text. Extreme macro impasto paint texture: sculptural thick palette-knife slabs of ivory and black paint, raised ridges throwing small shadows, clear broad bristle grooves, tiny cracked gesso, woven linen impressions and fine canvas creases within the painted silhouette. Dramatic raking upper-left light on paint peaks. Black is mixed charcoal/navy with glints of blue-grey, white creamy titanium paint. Abstract impressionist brushwork suggests the short-haired feline paw anatomy without rendering individual fur hairs. Edges made of thick broken brush strokes, no fluffy long hair. Preserve isolated paw concept but REVERSE direction from source so fingertips point RIGHT, arm continues to LEFT. Paw is recognisable and elegant, visibly an actual thickly painted object.

## Canvas

Output: `assets/linen-canvas.webp` (1200 × 1200).

Prompt:

> Create a square fine-art material texture for the background of a minimalist portfolio website: blank ivory-white artist's linen painting canvas, extreme close-up flat front-on photograph of real gesso-primed woven linen. Intricately visible orthogonal interlaced threads, small irregular slubs, fine dry gesso brush marks, very subtle shallow folds and tensile creases. Soft grazing studio light, white to light warm ivory only. No art, no colored pigment, no text, no objects, no frame, no deep shadows, no dark stains. Restrained tonal variation so black typography on it remains clear. Even illumination at all four edges for near-seamless repeating background; tactile white canvas fabric more prominent than paper grain. High detail.

## Image placement

The hero uses the existing original `watergarden-shorthair.webp`: water lilies and a shorthaired tuxedo cat. The actual Monet painting is restricted to the later interlude. Source information is retained in `ASSETS-WATER-LILIES.md`, without visible painting captions on the portfolio.

## Animation

Arrival and positioning: 0–1.05 seconds, zero scratches. A left-to-right stroke follows, with four scratch endpoints computed from the rotated claw positions. The arm lifts away, then curled strips reveal the portfolio. Text is revealed glyph by glyph through a ragged brush mask; this is a painting effect rather than a simulation of the font's original handwriting stroke order. Reduced motion displays all text immediately and skips the entrance.

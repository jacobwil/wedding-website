# Wedding photo archive — 18 compositions

This update combines the previous 12 cleaned photo compositions with **6 newly extracted**
items from the 6600 × 10200 px, 600 DPI source scan dated 2026-10-08.
The 6 new crops use native scan pixels: three large individual black-and-white prints
and three strips reading “Hannah & Spencer / May 24, 2026”. All wedding text was kept.
No geometric upscaling or generative reconstruction was applied to the new crops.

The complete package contains:

- `masters/`: 18 archival-size JPEG masters, retaining their available source dimensions.
- `web/display/`: 18 WebP assets, 1200 px maximum long edge.
- `web/thumbnails/`: 18 WebP thumbnails, 480 px maximum long edge.
- `sources/`: original native-resolution scan that produced the 6 additions.
- `contact_sheet.avif`: 8192 × 7651, visually dense high-res contact sheet.
- `contact_sheet_preview.jpg`: small JPEG preview for easy opening.
- `manifest.json`, `quality_report.csv`: dimensions, descriptions, file sizes.

The Sabrina's Second Hand lettering has been restored from the cleaned source JPEG;
only the Cash App/Visa payment line is painted over, preserving all three photo panels.
The four Zappos strips retain “WIN THE DAY” while their logo has been covered on the
printed yellow border. Existing earlier vendor redactions were otherwise retained.

AVIF is favored over HEIC for the contact sheet because it compresses efficiently
and has much broader current browser interoperability. The separately provided JPEG
contact sheet is a universal compatibility fallback.

Caveat: the earlier ALFI backdrop still shows ALFI brand lettering; this is inherited
from the previous processing pass, rather than completely removed by this addition.

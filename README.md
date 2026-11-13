# Rooted in Farming. <span>Connected to the World.</span>
Four website directions for Agrionyx: MD2 and Sarawak Gold pineapple, fresh and IQF, from Malaysian farms to six markets. Pick the one that feels most like you.

| Variant | What it is | Folder |
|---|---|---|
| V1 · Farm to Port | One camera journey in your films: over the pineapple fields, through the CPPC, out to the port. | `variants/01-farm-to-port/site/` |
| V2 · From the Crown | One pineapple, followed from its plant into the CPPC and on to fresh and IQF. | `variants/02-from-the-crown/site/` |
| V3 · The Centre | Your real CPPC on stage, with fruit flowing in from farmers and out to buyers. | `variants/03-the-centre/site/` |
| V4 · Every Acre | Every acre a point of light: a pineapple that becomes your farm map and export routes. | `variants/04-every-acre/site/` |

**Run locally:** `python serve.py . 8080` (or any static server with byte-range support) in this folder, then open http://127.0.0.1:8080/ for the hub page.

Static HTML, CSS and vanilla JS: no build step. Each variant is self-contained in its `site/` folder.

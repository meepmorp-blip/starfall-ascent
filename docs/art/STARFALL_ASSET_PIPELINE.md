# Asset pipeline (art)

The full pipeline, with commands, is in `docs/tooling/STARFALL_ASSET_PIPELINE.md`. Summary for art work:

1. **Capture before:** `node shots.js before` (in `tools/`).
2. **Change the art:** environment paint in `paintTheme`, mood in the `ATMO` table, live detail in `drawAtmosUnder` / `drawAtmosOver`.
3. **Capture after:** `node shots.js after`.
4. **Compare:** `python compare.py before after`.
5. **Review:** before/after images go to the owner for approval. Approved comparisons are kept in `docs/art/`.

Image assets (portraits, key art) are not used yet. When they are: generate or receive the PNG, process it with `tools/assets.py` (`key`, `pal`, `scale`, `trim`), and embed it as a data URI so the game stays a single offline file.

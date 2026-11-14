# Tooling setup guide

Everything below has already been done on the owner's laptop. This is the record, and the steps to repeat it on another machine.

## Requirements
- Node.js 18 or newer (22.18.0 here)
- Python 3.10 or newer (3.12.10 here)
- Claude Code

## Steps

Install the tool dependencies:

```bash
cd starfall_ascent/tools
```

```bash
npm install
```

Download Playwright's browser (about 124 MB):

```bash
npx playwright install chromium
```

Install the Python packages:

```bash
pip install pillow numpy imageio
```

Register the Playwright MCP server for Claude Code:

```bash
claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest
```

Check it:

```bash
claude mcp list
```

## Verify

```bash
node shots.js verify title
```

```bash
node sprites.js 96
```

Expected: three `ok title-…` lines, then one `ok` line per sprite sheet.

## Files
| File | What it is |
|---|---|
| `tools/package.json` | Declares Playwright |
| `tools/serve.js` | Tiny local server for the game folder (port 5190) |
| `tools/shots.js` | Screenshot runner |
| `tools/compare.py` | Before/after comparison |
| `tools/sprites.js` | Sprite-sheet exporter |
| `tools/assets.py` | Image processing commands |
| `tools/.gitignore` | Keeps `node_modules/` and `out/` out of the repo |

## Security notes
- No API keys or tokens are stored anywhere in the repo. The repo is public.
- If an image-generation key is added later, it goes in an environment variable only.
- The MCP config backup from before this setup: `~/.claude.json.bak-2026-11-14`.
- Packages come from the official npm and PyPI registries: `playwright` and `@playwright/mcp` (Microsoft), `pillow`, `numpy`, `imageio`.

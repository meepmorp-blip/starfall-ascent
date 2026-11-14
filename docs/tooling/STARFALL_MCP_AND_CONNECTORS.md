# MCP servers and connectors

## Configured
| Server | Scope | Command | Status |
|---|---|---|---|
| `playwright` | user (`~/.claude.json`) | `npx -y @playwright/mcp@latest` | Connected (checked with `claude mcp list`) |

A backup of the config from before the change is at `~/.claude.json.bak-2026-11-14`.

Setup command used:

```bash
claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest
```

To remove it:

```bash
claude mcp remove playwright --scope user
```

## Already available without MCP
- **Built-in browser pane** (Claude desktop app): interactive clicking, console, network. Best for quick manual-style checks.
- **`tools/shots.js`** (Playwright as a script): best for repeatable screenshot sets and before/after comparisons. This is the main visual-testing path; the MCP server is the interactive alternative.

## Claude Code and Fable
Fable 5.2 is a model selected inside Claude Code (`/model`). There is no separate Fable program and no separate integration: the same MCP servers, files and commands apply whichever model is active.

## Image generation: what is needed from you
No image-generation tool exists in this environment today. Options, none set up, because each needs your account and key:

| Option | Cost | What you would do |
|---|---|---|
| OpenAI Images API (gpt-image) | Paid per image | Create an API key and set it as the `OPENAI_API_KEY` environment variable on this laptop |
| Google Gemini image models | Free tier exists, limits apply | Create a key in Google AI Studio and set `GEMINI_API_KEY` |
| Stability / other hosted models | Paid | Account + key |
| Local Stable Diffusion | Free, but needs a strong graphics card and several GB of downloads | Approve the install |

Rules that will be followed if you approve one:
- The key stays in an environment variable. It is never written into the repo, a doc, or a commit.
- Generated art is original, pixel-art styled, and post-processed with `tools/assets.py` (palette reduction, transparent background, slicing).
- The repository is public, so nothing secret goes into it.

**Honest recommendation:** the game currently has no image files at all. Every character, Vice, map and effect is drawn by code, which is why it loads instantly, works offline, and stays consistent. Improving that code-drawn art (more animation frames, lighting, richer maps) is free and can start now. AI-generated images are best kept for a few high-impact pieces, such as splash art, character portraits and boss key art.

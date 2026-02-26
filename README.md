# 📏 ContextScale

**How Big Is 128K Tokens, _Really?_**

> Making the abstract concrete — an interactive visualization of AI context windows.

## 🔎 [Explore Context Windows →](https://mrunreal.github.io/ContextScale/)

![ContextScale](https://img.shields.io/badge/Models%20Tracked-25-blue?style=for-the-badge)
![Comparisons](https://img.shields.io/badge/Real--World%20Comparisons-29-green?style=for-the-badge)
![D3.js](https://img.shields.io/badge/Built%20with-D3.js-orange?style=for-the-badge)

---

## What Is This?

Everyone talks about "128K context" and "1M tokens" — but what does that actually _mean_?

ContextScale makes it tangible:

- **128K tokens** = the entire Hobbit (~95K words)
- **1M tokens** = all of Harry Potter + Lord of the Rings combined
- **10M tokens** (Llama 4 Scout) = 7,500 research papers

## Features

- **Interactive Slider** — Drag to explore any token count, see what fits
- **Every Major Model** — GPT-4o, Claude 4, Gemini 2.5, Llama 4, and more
- **Real-World Comparisons** — Books, codebases, research papers, screenplays
- **Paste Your Own Text** — See exactly which models can handle it
- **Logarithmic Scale Bars** — Visualize the massive range from 8K to 10M tokens
- **Mind-Blowing Facts** — Context you won't believe (Wikipedia = 556 Gemini windows)

## Quick Facts

| Model | Context | Equals |
|---|---|---|
| GPT-4 (Original) | 8K tokens | ~6 pages |
| GPT-4o | 128K tokens | 1 full novel |
| Claude 4 Opus | 200K tokens | An entire codebase |
| Gemini 2.5 Pro | 1M tokens | 15 novels |
| Llama 4 Scout | 10M tokens | 7,500 papers |

## Tech Stack

- **Vanilla JavaScript** + **D3.js** — No framework overhead
- **Logarithmic scaling** — Makes the 8K→10M range actually visible
- **GitHub Pages** — Free hosting, zero backend
- **Space Grotesk + JetBrains Mono** — Clean typography

## Data

All model context windows in [`data.json`](data.json). Includes:
- 25 AI models with official context window sizes
- 29 real-world content comparisons with estimated token counts

## License

MIT — Use it, fork it, fill it with context.

---

*Part of a portfolio of AI ecosystem tools:*
*[ModelForest](https://github.com/MrUnreal/ModelForest) · [LLMTracker](https://github.com/MrUnreal/LLMTracker) · [AIGraveyard](https://github.com/MrUnreal/AIGraveyard) · ContextScale*

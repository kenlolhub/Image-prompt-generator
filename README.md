---
title: CANVAS Image Prompt Generator
emoji: 🎨
colorFrom: gray
colorTo: yellow
sdk: static
pinned: false
---

# CANVAS — Image Prompt Generator

A minimal, guided web tool for composing high-quality image prompts using the **CANVAS framework**. Works with Gemini, Midjourney, Flux, and other image generators.

## CANVAS Framework

| Letter | Field | Description |
|--------|-------|-------------|
| **C** | Character | Who or what is the main subject? |
| **A** | Action | What is the subject doing? |
| **N** | Narrative context | Where is it, and what is the environment? |
| **V** | Viewpoint | Camera angle, shot type, framing, distance, focus |
| **A** | Aesthetic | Visual style, medium, mood, lighting, texture, era |
| **S** | Safeguards | What to avoid — negative prompts |

## Features

- Guided form for all 6 CANVAS fields
- Vocabulary chip pickers for Viewpoint (14 options) and Aesthetic (18 options, pick up to 3)
- Animated placeholder tips to inspire each field
- Live prompt preview that updates as you type
- One-click copy to clipboard
- Session history: last 10 generated prompts stored in your browser (localStorage)
- Restore any past prompt back into the form
- Muji-inspired minimal design — warm neutrals, clean typography

## Usage

1. Fill in each CANVAS field (or pick from the chip selectors)
2. Watch the prompt assemble in real time at the top
3. Click **Copy** to copy the prompt to your clipboard
4. Paste into Gemini, Midjourney, or any other image generator

No sign-up, no backend, no data sent anywhere — runs entirely in your browser.

<img width="1926" height="646" alt="Shot Dia172048" src="https://github.com/user-attachments/assets/47ea71df-7900-44cd-b3c7-4cd8865c4bf9" />

# OWN Research

Research paper → structured PowerPoint presentation. Upload a paper, get a presentation-ready breakdown with problem statement, methodology, key findings, and implications. Includes executive summaries, mind maps, contextual Q&A, and export to PPTX/PDF.

[<!-- Demo: https://youtu.be/YOUR_VIDEO_ID -->](https://github.com/user-attachments/assets/b3c453c6-6a7b-4ddb-9cf1-8184ca7bcaa9)

---

## Features

- **Structured extraction** — Parses research papers into a defined schema: Problem, Methodology, Key Findings, Implications
- **Presentation generation** — Produces slide decks from extracted structure, ready to present or share
- **Executive summary** — Concise document-level summary generated from full paper content
- **Mind map generation** — Visual mapping of concepts, relationships, and findings
- **Contextual Q&A** — AI tutor that answers questions grounded in the source document — responses cite directly from the paper
- **Export** — Output as PowerPoint (.pptx) or PDF

---

## Architecture

```
PDF Upload
    ↓
Document Parser (text + structure extraction)
    ↓
┌───────────────────────────────────────────────┐
│  Structured Breakdown                         │
│  (Problem → Methodology → Findings → Impact)  │
└───────────────────────────────────────────────┘
    ↓                ↓                ↓
Executive        Mind Map        Slide Deck
Summary          Generator       Generator
                                     ↓
                                PPTX / PDF Export
    ↓
Vector Index → Contextual Q&A
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TypeScript, React |
| Document Processing | PDF parsing, section classification |
| AI Pipeline | RAG (Retrieval-Augmented Generation), embedding-based retrieval |
| Export Engine | PPTX and PDF generation from structured output |
| Q&A | Context-grounded responses with source attribution |

---

## Motivation

Research papers are dense by design. Extracting the core structure — what problem was solved, how, and what it means — takes significant time. OWN Research automates that extraction and produces presentation-ready output, reducing hours of manual work to seconds.

---

## Status

In production. Active user base at Millat Umidi School, Tashkent.

---

[Komron Keldiyorov](https://github.com/own-k)

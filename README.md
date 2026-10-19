# Lumen

> **Lumen** is a privacy-first, client-side application that compares a resume with a job description to deliver a weighted fit score, granular skill-gap analysis, structural ATS health checks, and tailored draft application language. 

All document text extraction and scoring happen directly in your browser. Resume files are never uploaded to an application server.

---

## 🚀 Overview & Evolution

Lumen is a modern rewrite replacing an earlier Flask implementation. 
* **Previous Implementation:** Accepted PDF uploads only, relied on a short fixed skill list, and exposed a results export that did not retain the analysis session.
* **Current Application:** Accepts **PDF, DOCX, and plain text (up to 8 MB)**, utilizes a comprehensive technical and professional skill lexicon, and generates persistent reports entirely within your browser session.

---

## 💡 Capabilities

| Capability | Behavior |
| :--- | :--- |
| **Resume Input** | Paste text directly, or import PDF, DOCX, or TXT files up to 8 MB. Image-only PDFs trigger an explicit prompt to paste text. |
| **Job Description** | Free-text input with a built-in sample product-management posting provided for testing. |
| **Fit Score** | A comprehensive 0–100 score featuring individual component breakdowns for **Skills**, **Role**, and **Experience**. |
| **Weight Presets** | Weights are normalized to 100. Built-in presets include **Classic** (50/30/20), **Skills first** (70/15/15), and **Leadership** (30/45/25). |
| **Skill Gaps** | Identifies skills present in the job posting but missing from the resume, categorized and ordered by frequency of appearance. |
| **Structural Checks** | Evaluates 8 key criteria: contact details, word count/length, quantified lines, opening action verbs, standard sections, first-person usage, stock phrases, and extractable text. |
| **Bullet Revision** | On-device rewrites of weak bullet openers. Unknown numerical values remain as `[metric]` placeholders. |
| **Cover Note** | Generates a concise draft note based strictly on detected overlap. Does not invent employers, dates, or metrics absent from source texts. |
| **Session History** | Stores up to eight recent analyses in browser `localStorage`. Entries can be easily reopened, removed, or cleared completely. |
| **Export Options** | Copy the full analysis as a Markdown report or print/save the results view directly. |
| **Optional Model Rewrite** | A single user-initiated network request for AI-assisted rewrites. Constrained strictly to avoid inventing career history or metrics. |

---

## 📊 Scoring & Methodology

The overall score is calculated dynamically via the formula:

$$\text{overall} = \frac{\text{skill} \times w_{\text{skills}} + \text{role} \times w_{\text{role}} + \text{experience} \times w_{\text{experience}}}{100}$$

Where $w_{\text{skills}}$, $w_{\text{role}}$, and $w_{\text{experience}}$ are integers summing to 100 (default: 50, 30, and 20).

### Score Components

| Component | Calculation Method | Included in Overall Score? |
| :--- | :--- | :--- |
| **Skills** | Ratio of posting skills found on the resume, scaled by 1.5 and capped at 100. Falls back to keyword overlap if the posting contains no lexicon skills. | **Yes** |
| **Role** | Best similarity match between detected job titles using a synonym map (bare title tokens are not treated as full role matches). | **Yes** |
| **Experience** | Stated years (or longest employment date span on the resume) combined equally with degree level (doctorate, master's, bachelor's, or other). | **Yes** |
| **Semantic Overlap** | Cosine similarity of unigram term frequencies. | No |
| **Keyword Overlap** | Overlap among distinctive terms after stop-word removal. | No |
| **Structural Health** | Percentage share of the eight parser/skim checks that pass successfully. | No |

### Score Bands

* **85–100:** Strong fit
* **70–84:** Competitive
* **55–69:** Stretch
* **0–54:** Rework first

> **Lexicon Coverage:** The built-in lexicon covers programming languages, web/data tooling, cloud platforms, testing frameworks, design, product management, and marketing terms. Generic soft-skill phrases are intentionally excluded to prevent artificial score inflation.

---

## 🔒 Data Handling & Privacy

* **Local-First Processing:** Parsing, scoring, bullet revision, cover note generation, and history management occur entirely within your browser. 
* **History Management:** Local storage retains up to eight records and is completely removed when cleared by the user. Data is never transmitted during ordinary page loads.
* **Model Rewrite API:** The optional model rewrite is the sole network call requiring resume and posting payloads. It triggers only upon explicit user action, sends a truncated payload, and does not persist responses on any server controlled by this application. If provider quotas are exhausted, the interface gracefully informs the user that live rewrites are unavailable while preserving local analysis.

---

## 🛠️ Tech Stack & Repository Layout

### Built With
* **Framework & UI:** React 19, TanStack Start, Tailwind CSS 4
* **Document Extraction:** `unpdf` (PDF), `mammoth` (DOCX)
* **Visualizations:** Recharts
* **Typography:** Fraunces (Display), Outfit (UI)

### Repository Structure

```text
src/
├── routes/index.tsx          # Route entry point
├── components/
│   ├── studio.tsx            # Input, weighting, history, and report UI
│   └── score-ring.tsx        # Score display ring component
├── styles.css                # Color, typography, and surface design tokens
└── lib/
    └── analyzer/
        ├── engine.ts         # Scoring, health checks, local rewrites, cover notes
        ├── lexicon.ts        # Skill patterns, action verbs, and stop words
        ├── extract.ts        # PDF, DOCX, and plain-text file extraction
        ├── samples.ts        # Sample resume and posting test fixtures
        ├── history.ts        # localStorage history manager
        └── coach.ts          # Optional model rewrite integration
```

---

## ⚙️ Getting Started & Scripts

### Prerequisites
* **Node.js** version 22 or later
* **npm**

### Installation

```bash
# Clone the repository and install dependencies
npm install

# Start the development server (binds to 0.0.0.0:8080)
npm run dev
```

### Available Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the local development server |
| `npm run typecheck` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run build` | Generates a production build optimized for the Vercel (Nitro) target |
| `npm run preview` | Serves the production build locally |

> **Deployment:** The production build is stateless and requires no backend database. Publishing the built application deploys seamlessly to Vercel.

---

## ⚠️ Limitations & Edge Cases

* **Lexicon Boundaries:** Skills are recognized strictly via the built-in lexicon and aliases rather than an open-ended ontology. Unrecognized custom tools are omitted from the skill score.
* **Scanned PDFs:** Image-only or scanned PDFs cannot be read automatically; users must paste the extracted text manually.
* **File Formats:** Legacy `.doc` files are not supported (only `.docx`, `.pdf`, and `.txt`).
* **Date Spans:** Employment date-span estimates rely on the single longest continuous range and do not sum overlapping concurrent roles.
* **Bullet Rewrites:** Local bullet revisions update structure and verbs but cannot fabricate missing career facts or metrics.

[README.md](https://github.com/user-attachments/files/33660561/README.md)
# Lumen

Lumen is a client-side application that compares a resume with a job description and returns a weighted fit score, a skill-gap analysis, structural checks, and draft language for a tailored application. Document text is extracted and scored in the browser. Resume files are not uploaded to an application server.

The project replaces an earlier Flask implementation. That version accepted PDF uploads only, used a short fixed skill list, and exposed a results export that did not retain the analysis. The current application accepts PDF, DOCX, and plain text, uses a broader skill lexicon, and produces the report in the same session.

## Capabilities

| Capability | Behavior |
| --- | --- |
| Resume input | Paste text, or import PDF, DOCX, or TXT up to 8 MB. Image-only PDFs produce an error asking for pasted text. |
| Job description | Free-text input. A sample product-management posting is provided. |
| Fit score | A single 0–100 score with component scores for skills, role, and experience. |
| Weights | Skills, role, and experience weights are normalized to 100. Presets are Classic (50/30/20), Skills first (70/15/15), and Leadership (30/45/25). |
| Skill gaps | Skills present in the posting and absent from the resume, grouped by category and ordered by frequency in the posting. |
| Structural checks | Contact details, length, quantified lines, opening verbs, standard sections, first-person usage, stock phrases, and extractable text. |
| Bullet revision | On-device rewrites of weak bullet openers. Unknown quantities remain as `[metric]` placeholders. |
| Cover note | A short draft based only on detected overlap. It does not introduce employers, dates, or metrics that are not in the source text. |
| History | Up to eight analyses stored in `localStorage` for the current browser. Entries can be reopened, removed, or cleared. |
| Export | Copy a Markdown report, or print the results view. |
| Optional model rewrite | A single user-initiated request. The model is instructed not to invent employers, titles, dates, degrees, or metrics. |

Two fixtures are included for comparison. **Strong sample** pairs a Python résumé with a Python developer posting. **Stretch sample** pairs a marketing résumé with the same posting.

## Scoring

The overall score is:

```text
overall = (skill × wSkills + role × wRole + experience × wExperience) / 100
```

`wSkills`, `wRole`, and `wExperience` are integers that sum to 100. The default weights are 50, 30, and 20.

| Component | Method | Included in overall score |
| --- | --- | --- |
| Skills | Ratio of posting skills found on the résumé, scaled by 1.5 and capped at 100. If the posting names no lexicon skills, keyword overlap is used instead. | Yes |
| Role | Best similarity between detected titles, using a small synonym map. A bare title token is not treated as a full role match. | Yes |
| Experience | Stated years, or the longest employment date span on the résumé, combined equally with degree level (doctorate, master's, bachelor's, other). | Yes |
| Semantic overlap | Cosine similarity of unigram term frequencies. | No |
| Keyword overlap | Overlap among distinctive terms after stop-word removal. | No |
| Structural health | Share of eight checks that pass. | No |

Score bands:

| Range | Label |
| --- | --- |
| 85–100 | Strong fit |
| 70–84 | Competitive |
| 55–69 | Stretch |
| 0–54 | Rework first |

The lexicon covers programming languages, web and data tooling, cloud platforms, testing, design, product, and marketing terms. Generic soft-skill phrases are excluded so they do not raise the skill score.

## Data handling

Parsing, scoring, bullet revision, the cover note, and history remain in the browser. History is limited to eight records and is removed when the user clears it. It is not transmitted with ordinary page loads.

The model rewrite is the only network call that includes résumé and posting text. It runs only after an explicit action, sends a truncated payload, and does not persist the response on a server controlled by this application. If the provider rejects the call because the quota is exhausted, the interface reports that the live rewrite is unavailable and leaves the local analysis in place.

## Requirements and scripts

- Node.js 22 or later
- npm

```bash
npm install
npm run dev
```

The development server binds to `0.0.0.0:8080`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run build` | Production build for the Vercel (Nitro) target |
| `npm run preview` | Serve the production build |

The production build does not require a database. Publishing the built application deploys it to Vercel.

## Repository layout

```text
src/routes/index.tsx           Route entry
src/components/studio.tsx      Input, weighting, history, and report UI
src/components/score-ring.tsx  Score display
src/styles.css                 Color, type, and surface tokens
src/lib/analyzer/engine.ts     Scoring, health checks, local rewrites, cover note
src/lib/analyzer/lexicon.ts    Skill patterns, verbs, and stop words
src/lib/analyzer/extract.ts    PDF, DOCX, and plain-text extraction
src/lib/analyzer/samples.ts    Sample résumé and posting text
src/lib/analyzer/history.ts    localStorage history
src/lib/analyzer/coach.ts      Optional model rewrite
```

PDF text is extracted with `unpdf`. DOCX text is extracted with `mammoth`. Component charts use Recharts. The interface is React 19, TanStack Start, and Tailwind CSS 4. Display type is Fraunces; UI type is Outfit.

## Limitations

- Skills are recognized from the lexicon and aliases, not from an open-ended ontology. An unrecognized tool is omitted from the skill score.
- Image-only or scanned PDFs cannot be read. The user must paste the text.
- Legacy `.doc` files are not supported. DOCX is supported.
- Date-span estimates use the longest single range. They do not sum overlapping roles.
- Local bullet rewrites change structure and verbs. They do not supply missing facts.
- The model rewrite, when available, is constrained not to fabricate career facts. Placeholders are used where a number is absent.

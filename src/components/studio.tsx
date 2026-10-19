import * as Tabs from "@radix-ui/react-tabs";
import { useServerFn } from "@tanstack/react-start";
import {
  Briefcase,
  Check,
  CircleAlert,
  Copy,
  FileUp,
  History,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { coachWithGrok, type CoachResult } from "@/lib/analyzer/coach";
import { readResumeFile } from "@/lib/analyzer/extract";
import {
  analyze,
  normalizeWeights,
  skillByCategory,
  type FitReport,
  type Weights,
} from "@/lib/analyzer/engine";
import {
  clearHistory,
  loadHistory,
  removeHistory,
  saveHistory,
  type HistoryEntry,
} from "@/lib/analyzer/history";
import { SAMPLE_JOB, SAMPLE_PRODUCT_JOB, SAMPLE_RESUME, SAMPLE_SWITCH } from "@/lib/analyzer/samples";
import { cn } from "@/lib/cn";
import { ScoreRing } from "@/components/score-ring";

const PRESETS: { id: string; label: string; weights: Weights }[] = [
  { id: "classic", label: "Classic", weights: { skills: 50, role: 30, experience: 20 } },
  { id: "skills", label: "Skills first", weights: { skills: 70, role: 15, experience: 15 } },
  { id: "leadership", label: "Leadership", weights: { skills: 30, role: 45, experience: 25 } },
];

export function Studio() {
  const sharpen = useServerFn(coachWithGrok);
  const resultsRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [weights, setWeights] = useState<Weights>(PRESETS[0]!.weights);
  const [report, setReport] = useState<FitReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [tab, setTab] = useState("gaps");
  const [coach, setCoach] = useState<CoachResult | null>(null);
  const [coaching, setCoaching] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const bars = useMemo(
    () =>
      report
        ? [
            { name: "Skills", score: report.skill, weight: `${report.weights.skills}%` },
            { name: "Role", score: report.role, weight: `${report.weights.role}%` },
            { name: "Experience", score: report.experience, weight: `${report.weights.experience}%` },
          ]
        : [],
    [report],
  );

  async function takeFile(file: File) {
    setReading(true);
    setError(null);
    try {
      const text = await readResumeFile(file);
      setResume(text);
      setFileLabel(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setReading(false);
    }
  }

  function run(nextResume = resume, nextJob = job, nextWeights = weights) {
    if (nextResume.trim().length < 40 || nextJob.trim().length < 40) {
      setError("Paste a resume and a full posting — a few sentences each is not enough.");
      setReport(null);
      return;
    }
    setError(null);
    setCoach(null);
    const next = analyze(nextResume, nextJob, nextWeights);
    setReport(next);
    setTab("gaps");
    const entry: HistoryEntry = {
      id: `${Date.now()}`,
      at: Date.now(),
      label: fileLabel ?? firstLine(nextResume),
      overall: next.overall,
      verdict: next.verdict,
      resume: nextResume.slice(0, 20000),
      job: nextJob.slice(0, 20000),
      weights: next.weights,
    };
    setHistory(saveHistory(entry));
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function retune(key: keyof Weights, value: number) {
    const clamped = Math.min(80, Math.max(10, value));
    const others = (Object.keys(weights) as (keyof Weights)[]).filter((name) => name !== key);
    const rest = 100 - clamped;
    const base = others.reduce((sum, name) => sum + weights[name], 0) || 1;
    const next = { ...weights, [key]: clamped };
    let used = clamped;
    others.forEach((name, index) => {
      if (index === others.length - 1) next[name] = Math.max(5, 100 - used);
      else {
        next[name] = Math.max(5, Math.round((rest * weights[name]) / base));
        used += next[name];
      }
    });
    const drift = 100 - (next.skills + next.role + next.experience);
    next.skills += drift;
    setWeights(normalizeWeights(next));
  }

  async function copyReport() {
    if (!report) return;
    await navigator.clipboard.writeText(toMarkdown(report));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function askCoach() {
    if (!report) return;
    setCoaching(true);
    setCoach(null);
    try {
      const result = await sharpen({
        data: {
          resume: resume.slice(0, 8000),
          job: job.slice(0, 8000),
          missing: report.missingSkills.slice(0, 8).map((skill) => skill.label),
          role: report.targetRole,
        },
      });
      setCoach(result);
      setTab("rewrite");
    } catch (err) {
      setCoach({
        ok: false,
        error: err instanceof Error ? err.message : "The rewrite didn't finish.",
      });
    } finally {
      setCoaching(false);
    }
  }

  function openHistory(entry: HistoryEntry) {
    setResume(entry.resume);
    setJob(entry.job);
    setWeights(entry.weights);
    setFileLabel(entry.label);
    setHistoryOpen(false);
    const next = analyze(entry.resume, entry.job, entry.weights);
    setReport(next);
    setCoach(null);
    setError(null);
  }

  return (
    <div className="liquid-root">
      <header className="no-print mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-control border border-line bg-surface/80">
            <span className="size-4 rounded-full border-2 border-accent" />
          </span>
          <div>
            <p className="font-display text-2xl leading-none tracking-tight">Lumen</p>
            <p className="text-xs text-muted">Resume fit, kept on this device</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHistoryOpen((open) => !open)}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line bg-surface/70 px-3 text-sm text-fg"
        >
          <History className="size-4" aria-hidden="true" />
          History
          <span className="tabular-nums text-muted">{history.length}</span>
        </button>
      </header>

      {historyOpen ? (
        <div className="no-print mx-auto w-full max-w-6xl px-4 sm:px-6">
          <section className="glass mb-4 rounded-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Recent reads</h2>
              {history.length ? (
                <button
                  type="button"
                  className="text-sm text-muted underline-offset-4 hover:underline"
                  onClick={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted">Scores you run stay in this browser. Nothing is sent until you ask for a rewrite.</p>
            ) : (
              <ul className="grid gap-2">
                {history.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-2 rounded-control bg-bg/40 px-3 py-2">
                    <button type="button" className="min-h-11 min-w-0 flex-1 text-left" onClick={() => openHistory(entry)}>
                      <span className="block truncate text-sm">{entry.label}</span>
                      <span className="text-xs text-muted">
                        {entry.verdict} · {new Date(entry.at).toLocaleString()}
                      </span>
                    </button>
                    <span className="font-display text-2xl tabular-nums">{entry.overall}</span>
                    <button
                      type="button"
                      aria-label="Remove saved read"
                      className="grid size-11 place-items-center text-muted"
                      onClick={() => setHistory(removeHistory(entry.id))}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <section className="no-print mb-6 max-w-2xl">
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">See the fit before you apply.</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Drop in a resume and a posting. Lumen scores skills, role, and experience, then shows the gaps worth fixing.
          </p>
        </section>

        <div className="no-print mb-4 flex flex-wrap gap-2">
          <Ghost
            onClick={() => {
              setResume(SAMPLE_RESUME);
              setJob(SAMPLE_JOB);
              setFileLabel("Sample · strong match");
              setError(null);
            }}
          >
            Strong sample
          </Ghost>
          <Ghost
            onClick={() => {
              setResume(SAMPLE_SWITCH);
              setJob(SAMPLE_JOB);
              setFileLabel("Sample · career switch");
              setError(null);
            }}
          >
            Stretch sample
          </Ghost>
          <Ghost
            onClick={() => {
              setJob(SAMPLE_PRODUCT_JOB);
              setError(null);
            }}
          >
            Product posting
          </Ghost>
        </div>

        {error ? (
          <p className="no-print mb-4 rounded-control border border-line bg-surface px-4 py-3 text-sm text-bad" role="alert">
            {error}
          </p>
        ) : null}

        <div className="no-print grid gap-4 lg:grid-cols-2">
          <section className="glass rounded-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <FileUp className="size-5 text-accent" aria-hidden="true" />
                Resume
              </h2>
              <span className="text-xs text-subtle tabular-nums">{resume.trim() ? resume.trim().split(/\s+/).length : 0} words</span>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                const file = event.dataTransfer.files[0];
                if (file) void takeFile(file);
              }}
              className={cn(
                "mb-3 flex min-h-24 w-full flex-col items-center justify-center rounded-control border border-dashed px-4 py-4 text-center",
                dragOver ? "border-accent bg-surface-2" : "border-line bg-bg/30",
              )}
            >
              <span className="text-sm">{reading ? "Reading the file…" : "Drop a PDF, DOCX, or TXT"}</span>
              <span className="mt-1 text-xs text-muted">or click to browse · 8 MB max · text stays here</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void takeFile(file);
                event.target.value = "";
              }}
            />
            {fileLabel ? (
              <p className="mb-2 flex items-center justify-between gap-2 text-xs text-muted">
                <span className="truncate">{fileLabel}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => {
                    setFileLabel(null);
                  }}
                >
                  <X className="size-3" aria-hidden="true" />
                  Clear label
                </button>
              </p>
            ) : null}
            <textarea
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              placeholder="Or paste the resume. Headings, bullets, and dates all help."
              className="min-h-64 w-full resize-y rounded-control border border-line bg-bg/40 p-4 text-sm leading-relaxed text-fg placeholder:text-subtle"
            />
          </section>

          <section className="glass rounded-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <Briefcase className="size-5 text-accent" aria-hidden="true" />
                Posting
              </h2>
              <span className="text-xs text-subtle tabular-nums">{job.length} characters</span>
            </div>
            <textarea
              value={job}
              onChange={(event) => setJob(event.target.value)}
              placeholder="Paste the full job description: requirements, responsibilities, and nice-to-haves."
              className="min-h-80 w-full resize-y rounded-control border border-line bg-bg/40 p-4 text-sm leading-relaxed text-fg placeholder:text-subtle lg:min-h-[22rem]"
            />
          </section>
        </div>

        <section className="glass no-print mt-4 rounded-card p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">How to weigh the match</h2>
              <p className="text-sm text-muted">Classic is the original 50 / 30 / 20 split. The three always add to 100.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setWeights(preset.weights)}
                  className={cn(
                    "min-h-11 rounded-full px-3 text-sm",
                    sameWeights(weights, preset.weights) ? "bg-accent text-accent-fg" : "border border-line text-fg",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <WeightSlider label="Skills" value={weights.skills} onChange={(value) => retune("skills", value)} />
            <WeightSlider label="Role" value={weights.role} onChange={(value) => retune("role", value)} />
            <WeightSlider label="Experience" value={weights.experience} onChange={(value) => retune("experience", value)} />
          </div>
          <button
            type="button"
            onClick={() => run()}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-control bg-accent px-4 text-base font-medium text-accent-fg sm:w-auto"
          >
            Read the fit
          </button>
        </section>

        {report ? (
          <article ref={resultsRef} className="mt-6 scroll-mt-6">
            <section className="glass rounded-card p-4 sm:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <ScoreRing value={report.overall} label={report.verdict} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs tracking-wide text-muted uppercase">Target</p>
                  <h2 className="font-display text-3xl leading-tight">{report.targetRole}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{report.verdictNote}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Meter label="Semantic overlap" value={report.similarity} hint="Wording, not just skills" />
                    <Meter label="ATS health" value={report.ats} hint="Structure a parser can read" />
                    <Meter label="Keyword overlap" value={report.keyword} hint="Outside the weighted score" />
                  </div>
                </div>
              </div>
              <div className="mt-6 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bars} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-line)",
                        borderRadius: 12,
                        color: "var(--color-fg)",
                      }}
                      formatter={(value, _name, item) => [`${value}`, `Score · weight ${item.payload.weight}`]}
                    />
                    <Bar dataKey="score" fill="var(--color-accent)" radius={[8, 8, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="no-print mt-2 flex flex-wrap gap-2">
                <Ghost onClick={() => void copyReport()}>
                  <Copy className="size-4" aria-hidden="true" />
                  {copied ? "Copied" : "Copy report"}
                </Ghost>
                <Ghost onClick={() => window.print()}>
                  <Printer className="size-4" aria-hidden="true" />
                  Print
                </Ghost>
              </div>
            </section>

            <Tabs.Root value={tab} onValueChange={setTab} className="mt-4">
              <Tabs.List className="no-print flex gap-1 overflow-x-auto rounded-card bg-surface/80 p-1">
                {[
                  ["gaps", "Gaps"],
                  ["health", "Health"],
                  ["rewrite", "Rewrite"],
                  ["letter", "Letter"],
                ].map(([value, label]) => (
                  <Tabs.Trigger
                    key={value}
                    value={value!}
                    className="min-h-11 shrink-0 rounded-control px-4 text-sm text-muted data-[state=active]:bg-bg data-[state=active]:text-fg"
                  >
                    {label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value="gaps" className="mt-4 grid gap-4 lg:grid-cols-2">
                <Panel title="Missing from the resume" hint="Ordered by how often the posting repeats them.">
                  {report.missingSkills.length === 0 ? (
                    <p className="text-sm text-muted">Every detected posting skill shows up in the resume.</p>
                  ) : (
                    <SkillGroups skills={skillByCategory(report.missingSkills)} tone="miss" />
                  )}
                </Panel>
                <Panel title="Already covered">
                  {report.matchedSkills.length === 0 ? (
                    <p className="text-sm text-muted">No shared skills yet. Check that the posting names tools explicitly.</p>
                  ) : (
                    <SkillGroups skills={skillByCategory(report.matchedSkills)} tone="hit" />
                  )}
                </Panel>
                <Panel title="Phrases to borrow">
                  <ChipRow items={report.missingKeywords} empty="The wording already overlaps." />
                </Panel>
                <Panel title="What to do next">
                  <ul className="grid gap-3">
                    {report.suggestions.map((item) => (
                      <li key={item.suggestion} className="rounded-control bg-bg/40 p-3">
                        <p className="text-xs tracking-wide text-muted uppercase">
                          {item.priority} · {item.category}
                        </p>
                        <p className="mt-1 text-sm">{item.suggestion}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="Read of the two texts">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Stat label="Resume years" value={report.resume.experienceYears ? `${report.resume.experienceYears}` : "Unclear"} />
                    <Stat label="Posting years" value={report.job.experienceYears ? `${report.job.experienceYears}+` : "Unstated"} />
                    <Stat label="Resume education" value={report.resume.educationLabel} />
                    <Stat label="Posting education" value={report.job.educationLabel} />
                    <Stat label="Resume roles" value={report.resume.roles[0] ? titleCase(report.resume.roles[0]) : "None detected"} />
                    <Stat label="Posting roles" value={report.job.roles[0] ? titleCase(report.job.roles[0]) : "None detected"} />
                  </dl>
                </Panel>
                <Panel title="Extra skills the posting never names">
                  <ChipRow items={report.extraSkills.map((skill) => skill.label)} empty="Nothing extra stood out." />
                </Panel>
              </Tabs.Content>

              <Tabs.Content value="health" className="mt-4">
                <Panel title="Parser and skim checks">
                  <ul className="grid gap-2">
                    {report.health.map((check) => (
                      <li key={check.id} className="flex gap-3 rounded-control bg-bg/40 p-3">
                        {check.pass ? (
                          <Check className="mt-0.5 size-4 shrink-0 text-good" aria-hidden="true" />
                        ) : (
                          <CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
                        )}
                        <div>
                          <p className="text-sm">
                            {check.label}
                            <span className="ml-2 text-xs text-muted">{check.pass ? "Pass" : "Fix"}</span>
                          </p>
                          <p className="text-xs leading-relaxed text-muted">{check.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </Tabs.Content>

              <Tabs.Content value="rewrite" className="mt-4 grid gap-4">
                <Panel title="On-device bullet pass" hint="Weak openers are rewritten. Brackets are facts you still need to fill in.">
                  {report.bullets.length === 0 ? (
                    <p className="text-sm text-muted">No bullet-length lines were found. Paste the experience section with line breaks.</p>
                  ) : (
                    <ul className="grid gap-3">
                      {report.bullets.map((bullet) => (
                        <li key={bullet.original} className="grid gap-2 rounded-control bg-bg/40 p-3 text-sm sm:grid-cols-2">
                          <p className="text-muted">{bullet.original}</p>
                          <p>{bullet.rewrite}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
                <Panel
                  title="Sharpen with Grok"
                  hint="Sends this resume and posting once. It will not invent employers or numbers."
                >
                  <button
                    type="button"
                    onClick={() => void askCoach()}
                    disabled={coaching}
                    className="inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
                  >
                    {coaching ? "Writing…" : "Ask for a grounded rewrite"}
                  </button>
                  {coach && !coach.ok ? <p className="mt-3 text-sm text-warn">{coach.error}</p> : null}
                  {coach && coach.ok ? (
                    <div className="mt-4 grid gap-3">
                      <ul className="grid gap-2">
                        {coach.bullets.map((line) => (
                          <li key={line} className="rounded-control bg-bg/40 p-3 text-sm">
                            {line}
                          </li>
                        ))}
                      </ul>
                      {coach.cautions.length ? (
                        <p className="text-xs leading-relaxed text-muted">{coach.cautions.join(" ")}</p>
                      ) : null}
                    </div>
                  ) : null}
                </Panel>
              </Tabs.Content>

              <Tabs.Content value="letter" className="mt-4">
                <Panel title="Draft note" hint="Built from the overlap only. Edit the voice before you send it.">
                  <div className="max-w-prose text-sm leading-relaxed">
                    <p>{report.letter.greeting}</p>
                    {report.letter.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="mt-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {coach && coach.ok ? (
                    <div className="mt-4 border-t border-line pt-4">
                      <p className="text-xs tracking-wide text-muted uppercase">Grok draft</p>
                      <p className="mt-2 max-w-prose text-sm leading-relaxed whitespace-pre-wrap">{coach.letter}</p>
                    </div>
                  ) : null}
                </Panel>
              </Tabs.Content>
            </Tabs.Root>
          </article>
        ) : null}

        <footer className="no-print mt-10 text-xs leading-relaxed text-subtle">
          Files are read in the browser and are not stored on a server. History lives in this browser until you clear it.
          The live rewrite is the only step that leaves the device, and only when you ask.
        </footer>
      </main>
    </div>
  );
}

function Ghost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/60 px-3 text-sm text-fg"
    >
      {children}
    </button>
  );
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-muted">{value}</span>
      </span>
      <input
        type="range"
        min={10}
        max={80}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Meter({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-sm">{label}</p>
        <p className="text-sm tabular-nums text-muted">{value}</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-card p-4">
      <h3 className="font-display text-xl">{title}</h3>
      {hint ? <p className="mt-1 mb-3 text-xs leading-relaxed text-muted">{hint}</p> : <div className="mb-3" />}
      {children}
    </section>
  );
}

function SkillGroups({
  skills,
  tone,
}: {
  skills: { category: string; skills: { id: string; label: string }[] }[];
  tone: "hit" | "miss";
}) {
  return (
    <div className="grid gap-3">
      {skills.map((group) => (
        <div key={group.category}>
          <p className="mb-1 text-xs tracking-wide text-subtle uppercase">{group.category}</p>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <span
                key={skill.id}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  tone === "hit" ? "border-line text-good" : "border-line text-warn",
                )}
              >
                {skill.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipRow({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-line px-2.5 py-1 text-xs text-fg">
          {item}
        </span>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control bg-bg/40 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function firstLine(text: string): string {
  const line = text.split("\n").map((part) => part.trim()).find(Boolean);
  return (line ?? "Untitled resume").slice(0, 72);
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function sameWeights(a: Weights, b: Weights): boolean {
  return a.skills === b.skills && a.role === b.role && a.experience === b.experience;
}

function toMarkdown(report: FitReport): string {
  return [
    `# Lumen fit report — ${report.overall} · ${report.verdict}`,
    ``,
    report.verdictNote,
    ``,
    `Target: ${report.targetRole}`,
    `Skills ${report.skill} (${report.weights.skills}%) · Role ${report.role} (${report.weights.role}%) · Experience ${report.experience} (${report.weights.experience}%)`,
    `Semantic overlap ${report.similarity} · ATS health ${report.ats}`,
    ``,
    `## Missing skills`,
    report.missingSkills.map((skill) => `- ${skill.label}`).join("\n") || "- None",
    ``,
    `## Suggestions`,
    report.suggestions.map((item) => `- ${item.priority}: ${item.suggestion}`).join("\n"),
    ``,
    `## Letter`,
    report.letter.greeting,
    ...report.letter.paragraphs,
  ].join("\n");
}

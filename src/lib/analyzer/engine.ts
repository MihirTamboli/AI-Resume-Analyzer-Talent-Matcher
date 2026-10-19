import {
  ACTION_VERBS,
  EXTRA_STOP,
  ROLE_SYNONYMS,
  SENIORITY,
  SKILLS,
  STOPWORDS,
  WEAK_OPENERS,
} from "./lexicon";

export type Weights = {
  skills: number;
  role: number;
  experience: number;
};

export type FoundSkill = {
  id: string;
  label: string;
  category: string;
  count: number;
};

export type HealthCheck = {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
};

export type Suggestion = {
  category: string;
  priority: "High" | "Medium" | "Low";
  suggestion: string;
  description: string;
};

export type BulletRewrite = {
  original: string;
  rewrite: string;
};

export type Profile = {
  skills: FoundSkill[];
  roles: string[];
  experienceYears: number;
  educationLevel: number;
  educationLabel: string;
  keywords: string[];
  wordCount: number;
  email: boolean;
  phone: boolean;
  link: boolean;
};

export type FitReport = {
  overall: number;
  skill: number;
  role: number;
  experience: number;
  keyword: number;
  similarity: number;
  ats: number;
  verdict: string;
  verdictNote: string;
  weights: Weights;
  matchedSkills: FoundSkill[];
  missingSkills: FoundSkill[];
  extraSkills: FoundSkill[];
  matchedKeywords: string[];
  missingKeywords: string[];
  resume: Profile;
  job: Profile;
  suggestions: Suggestion[];
  health: HealthCheck[];
  bullets: BulletRewrite[];
  letter: { greeting: string; paragraphs: string[] };
  targetRole: string;
};

const DEFAULT_WEIGHTS: Weights = { skills: 50, role: 30, experience: 20 };

export function normalizeWeights(input?: Partial<Weights>): Weights {
  const skills = clamp(input?.skills ?? DEFAULT_WEIGHTS.skills, 5, 80);
  const role = clamp(input?.role ?? DEFAULT_WEIGHTS.role, 5, 80);
  const experience = clamp(input?.experience ?? DEFAULT_WEIGHTS.experience, 5, 80);
  const sum = skills + role + experience;
  const next = {
    skills: Math.round((skills / sum) * 100),
    role: Math.round((role / sum) * 100),
    experience: Math.round((experience / sum) * 100),
  };
  const drift = 100 - (next.skills + next.role + next.experience);
  next.skills += drift;
  return next;
}

export function analyze(resumeText: string, jobText: string, weightsInput?: Partial<Weights>): FitReport {
  const weights = normalizeWeights(weightsInput);
  const resume = profile(resumeText, "resume");
  const job = profile(jobText, "job");

  const resumeIds = new Set(resume.skills.map((s) => s.id));
  const matchedSkills = job.skills.filter((s) => resumeIds.has(s.id));
  const missingSkills = job.skills
    .filter((s) => !resumeIds.has(s.id))
    .sort((a, b) => b.count - a.count);
  const extraSkills = resume.skills.filter((s) => !job.skills.some((j) => j.id === s.id));

  const skill =
    job.skills.length === 0
      ? keywordScore(resume.keywords, job.keywords)
      : Math.min(100, Math.round((matchedSkills.length / job.skills.length) * 150));

  const role = roleScore(resume.roles, job.roles);
  const experience = experienceScore(
    resume.experienceYears,
    job.experienceYears,
    resume.educationLevel,
    job.educationLevel,
  );

  const keyword = keywordScore(resume.keywords, job.keywords);
  const matchedKeywords = resume.keywords.filter((k) => job.keywords.includes(k)).slice(0, 16);
  const missingKeywords = job.keywords.filter((k) => !resume.keywords.includes(k)).slice(0, 12);

  const similarity = Math.round(cosineSimilarity(termFreq(resumeText, false), termFreq(jobText, false)) * 100);
  const health = healthChecks(resumeText, resume);
  const ats = Math.round((health.filter((h) => h.pass).length / health.length) * 100);

  const overall = Math.round(
    (skill * weights.skills + role * weights.role + experience * weights.experience) / 100,
  );

  const { verdict, verdictNote } = band(overall);
  const targetRole = job.roles[0] ? titleCase(job.roles[0]) : "this role";

  const reportBase = {
    overall,
    skill,
    role,
    experience,
    keyword,
    similarity,
    ats,
    verdict,
    verdictNote,
    weights,
    matchedSkills,
    missingSkills,
    extraSkills,
    matchedKeywords,
    missingKeywords,
    resume,
    job,
    health,
    targetRole,
    suggestions: [] as Suggestion[],
    bullets: rewriteBullets(resumeText),
    letter: coverLetter(resumeText, targetRole, matchedSkills, missingSkills),
  };

  reportBase.suggestions = suggestions({
    ...reportBase,
    experienceYearsResume: resume.experienceYears,
    experienceYearsJob: job.experienceYears,
    educationResume: resume.educationLevel,
    educationJob: job.educationLevel,
  });

  return reportBase;
}

function suggestions(input: {
  skill: number;
  role: number;
  experience: number;
  keyword: number;
  overall: number;
  missingSkills: FoundSkill[];
  missingKeywords: string[];
  health: HealthCheck[];
  experienceYearsResume: number;
  experienceYearsJob: number;
  educationResume: number;
  educationJob: number;
}): Suggestion[] {
  const out: Suggestion[] = [];
  if (input.skill < 70 && input.missingSkills.length) {
    const names = input.missingSkills.slice(0, 5).map((s) => s.label);
    out.push({
      category: "Skills",
      priority: "High",
      suggestion: `Bring these posting skills onto the page: ${names.join(", ")}.`,
      description:
        "Only add a skill you can defend in an interview. Put the strongest ones in a skills line and once inside a bullet.",
    });
  }
  if (input.role < 60) {
    out.push({
      category: "Role alignment",
      priority: "High",
      suggestion: "Mirror the posting’s title in your headline and most recent role line.",
      description:
        "Recruiters skim the title first. Use the same family of words (engineer vs developer is fine; a distant title is not).",
    });
  }
  if (input.experience < 70 && input.experienceYearsJob > input.experienceYearsResume) {
    out.push({
      category: "Experience",
      priority: "Medium",
      suggestion: `The posting asks for about ${input.experienceYearsJob}+ years. Show equivalent scope if your title years are shorter.`,
      description:
        "Lead with the largest system, team, or budget you owned. Freelance, research, and shipped side projects count when they are specific.",
    });
  }
  if (input.educationJob > input.educationResume && input.educationJob >= 3) {
    out.push({
      category: "Education",
      priority: "Low",
      suggestion: "The posting prefers a higher degree. Surface certifications, coursework, or publications instead of hiding the gap.",
      description: "A one-line education note plus a credential beats leaving the section blank.",
    });
  }
  if (input.keyword < 50 && input.missingKeywords.length) {
    out.push({
      category: "Keywords",
      priority: "Medium",
      suggestion: `Work these phrases in naturally: ${input.missingKeywords.slice(0, 4).join(", ")}.`,
      description: "Applicant tracking systems still rank literal overlap. Use the posting’s wording once, not a stuffed list.",
    });
  }
  for (const check of input.health) {
    if (check.pass) continue;
    if (check.id === "metrics") {
      out.push({
        category: "Impact",
        priority: "High",
        suggestion: "Add numbers to at least three bullets: time saved, revenue, latency, users, or error rate.",
        description: check.detail,
      });
    } else if (check.id === "verbs") {
      out.push({
        category: "Bullets",
        priority: "Medium",
        suggestion: "Open bullets with a concrete verb — shipped, reduced, led — not “responsible for”.",
        description: check.detail,
      });
    } else if (check.id === "contact") {
      out.push({
        category: "Contact",
        priority: "High",
        suggestion: "Put a plain email and a phone or portfolio link in the first lines.",
        description: check.detail,
      });
    }
  }
  if (input.overall >= 85) {
    out.push({
      category: "Excellent match",
      priority: "Low",
      suggestion: "This draft already tracks the posting. Tighten the top three bullets and stop editing.",
      description: "A cover letter should repeat the same matched skills, not introduce a new story.",
    });
  } else if (input.overall < 80) {
    out.push({
      category: "Tailoring",
      priority: "Medium",
      suggestion: "Cut bullets that this posting never mentions and spend that space on the gaps above.",
      description: "One resume per posting beats a generic master file.",
    });
  }
  const rank = { High: 0, Medium: 1, Low: 2 };
  return out.sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, 6);
}

function coverLetter(
  resumeText: string,
  targetRole: string,
  matched: FoundSkill[],
  missing: FoundSkill[],
): { greeting: string; paragraphs: string[] } {
  const skills = matched.slice(0, 3).map((s) => s.label);
  const skillLine = skills.length
    ? `The overlap that matters is ${joinList(skills)}.`
    : "The posting and this resume share little explicit tooling yet, so the letter should lead with scope instead of a skill list.";
  const gap = missing[0]
    ? ` If you have adjacent proof of ${missing[0].label}, name the project. If you don’t, leave it out.`
    : "";
  const years = extractExplicitYears(resumeText);
  const tenure = years ? ` I have about ${years} years in related work.` : "";
  return {
    greeting: "Hello,",
    paragraphs: [
      `I’m writing about the ${targetRole} opening.${tenure} ${skillLine}`,
      `In the roles on my resume I shipped work a hiring manager can check: name the system, the constraint, and the result. I can walk through those decisions in an interview.${gap}`,
      "I’m glad to share a short walkthrough of the closest project. Thank you for reading.",
    ],
  };
}

function rewriteBullets(text: string): BulletRewrite[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-*–—\d.)]+/, "").trim())
    .filter((line) => line.length > 40 && line.length < 220);
  const weak = lines.filter((line) => WEAK_OPENERS.some((w) => w.re.test(line)));
  const pool = (weak.length ? weak : lines.filter((line) => !/\d/.test(line))).slice(0, 3);
  return pool.map((original) => {
    let body = original;
    let verb = "Delivered";
    for (const opener of WEAK_OPENERS) {
      if (opener.re.test(body)) {
        verb = opener.swap;
        body = body.replace(opener.re, "");
        break;
      }
    }
    const cleaned = body.charAt(0).toLowerCase() + body.slice(1).replace(/\.$/, "");
    const hasNumber = /\d/.test(original);
    const ending = hasNumber ? "" : ", moving [metric] by [amount]";
    return {
      original,
      rewrite: `${verb} ${cleaned}${ending}.`,
    };
  });
}

function isQuantified(line: string): boolean {
  if (/%|\$/.test(line)) return true;
  const nums = line.match(/\d[\d,]*/g) ?? [];
  return nums.some((token) => {
    const value = Number(token.replace(/,/g, ""));
    return value > 0 && (value < 1900 || value > 2100);
  });
}

function healthChecks(text: string, resume: Profile): HealthCheck[] {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const quantified = lines.filter(isQuantified).length;
  const verbHits = lines.filter((l) => {
    const word = l.replace(/^[\s•\-*–—]+/, "").split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    return word ? ACTION_VERBS.includes(word) : false;
  }).length;
  const pronouns = (text.match(/\b(I|me|my|mine)\b/g) ?? []).length;
  const words = resume.wordCount;
  return [
    {
      id: "contact",
      label: "Contact line",
      pass: resume.email && (resume.phone || resume.link),
      detail: resume.email
        ? "Email is present. Add a phone or a link if either is missing."
        : "No email found. Put it in the header as plain text, not an image.",
    },
    {
      id: "length",
      label: "Length",
      pass: words >= 280 && words <= 1100,
      detail:
        words < 280
          ? `${words} words is thin for most mid-level roles. Aim for 350–800.`
          : words > 1100
            ? `${words} words is long. Cut older roles to one line each.`
            : `${words} words sits in a readable range.`,
    },
    {
      id: "metrics",
      label: "Quantified bullets",
      pass: quantified >= 3,
      detail:
        quantified >= 3
          ? `${quantified} lines carry a number, percent, or dollar figure.`
          : `Only ${quantified} quantified line${quantified === 1 ? "" : "s"}. Add scale even if it is “4 services” or “12%”.`,
    },
    {
      id: "verbs",
      label: "Action verbs",
      pass: verbHits >= 3,
      detail:
        verbHits >= 3
          ? `${verbHits} lines open with a strong verb.`
          : "Most lines don’t start with a verb like led, shipped, or reduced.",
    },
    {
      id: "sections",
      label: "Core sections",
      pass: /experience|employment|work history/i.test(text) && /education|university|bachelor|master|b\.s|b\.tech/i.test(text) && /skill/i.test(text),
      detail: "Look for recognizable Experience, Education, and Skills headings so parsers don’t merge them.",
    },
    {
      id: "pronouns",
      label: "First person",
      pass: pronouns < 4,
      detail:
        pronouns < 4
          ? "The draft stays in resume voice."
          : `${pronouns} first-person pronouns. Drop “I” and start on the verb.`,
    },
    {
      id: "cliche",
      label: "Stock phrases",
      pass: !/references available|team player|hard worker|go-getter|synergy/i.test(text),
      detail: "Skip “references available” and filler labels. The work should carry the claim.",
    },
    {
      id: "readable",
      label: "Extractable text",
      pass: text.replace(/\s+/g, " ").trim().length > 180,
      detail:
        text.trim().length > 180
          ? "The text extracted cleanly."
          : "Almost no text came through. If this was a scanned PDF, paste the text instead.",
    },
  ];
}

function band(score: number): { verdict: string; verdictNote: string } {
  if (score >= 85) return { verdict: "Strong fit", verdictNote: "Submit. Spend ten minutes on the top bullets, not a rewrite." };
  if (score >= 70) return { verdict: "Competitive", verdictNote: "Close the two highest gaps, then send it." };
  if (score >= 55) return { verdict: "Stretch", verdictNote: "The posting is asking for a different shape of evidence. Tailor before you apply." };
  return { verdict: "Rework first", verdictNote: "Overlap is thin. Either retarget the resume or pick a closer posting." };
}

function profile(text: string, kind: "resume" | "job"): Profile {
  const skills = extractSkills(text);
  const roles = extractRoles(text);
  const explicit = extractExplicitYears(text);
  const spanned = kind === "resume" ? estimateSpanYears(text) : 0;
  const experienceYears = explicit || spanned;
  const educationLevel = educationScore(text);
  return {
    skills,
    roles,
    experienceYears,
    educationLevel,
    educationLabel: educationLabel(educationLevel),
    keywords: topKeywords(text, 24),
    wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
    email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
    phone: /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/.test(text),
    link: /https?:\/\/|linkedin\.com|github\.com/i.test(text),
  };
}

function extractSkills(text: string): FoundSkill[] {
  const found: FoundSkill[] = [];
  for (const def of SKILLS) {
    const matches = text.match(new RegExp(def.pattern.source, "gi"));
    if (matches?.length) {
      found.push({ id: def.id, label: def.label, category: def.category, count: matches.length });
    }
  }
  return found.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

const ROLE_RE =
  /\b(?:senior|junior|lead|principal|staff|associate|software|web|data|machine learning|ml|ai|backend|back-end|frontend|front-end|full[- ]stack|devops|cloud|security|mobile|ios|android|qa|product|project|program|site reliability|python|java|react|growth|marketing|content)(?:\s+[a-z0-9+#./-]+){0,3}\s+(?:engineer|developer|analyst|scientist|architect|manager|designer|consultant|specialist|director)\b/gi;

function extractRoles(text: string): string[] {
  const raw = text.match(ROLE_RE) ?? [];
  const seen = new Set<string>();
  const roles: string[] = [];
  for (const hit of raw) {
    const cleaned = hit.replace(/\s+/g, " ").trim().toLowerCase();
    if (cleaned.length < 5 || seen.has(cleaned)) continue;
    seen.add(cleaned);
    roles.push(cleaned);
  }
  return roles.slice(0, 8);
}

function extractExplicitYears(text: string): number {
  const years: number[] = [];
  const patterns = [
    /(\d{1,2})\s*\+\s*years?\b/gi,
    /(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*years?\b/gi,
    /(\d{1,2})\s*years?(?:\s+of)?\s+(?:experience|exp\b)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      for (const group of match.slice(1)) {
        if (group && /^\d+$/.test(group)) {
          const n = Number(group);
          if (n > 0 && n <= 40) years.push(n);
        }
      }
    }
  }
  return years.length ? Math.max(...years) : 0;
}

function estimateSpanYears(text: string): number {
  const now = new Date().getFullYear();
  let best = 0;
  const re = /((?:19|20)\d{2})\s*(?:-|–|—|to)\s*(present|current|now|(?:19|20)\d{2})/gi;
  for (const match of text.matchAll(re)) {
    const start = Number(match[1]);
    const end = /present|current|now/i.test(match[2] ?? "") ? now : Number(match[2]);
    if (end >= start && end - start <= 40) best = Math.max(best, end - start);
  }
  return best;
}

function educationScore(text: string): number {
  const t = text.toLowerCase();
  if (/\bph\.?d\b|doctorate/.test(t)) return 4;
  if (/\bmaster\b|\bmba\b|\bm\.s\b|\bm\.sc\b|\bm\.tech\b/.test(t)) return 3;
  if (/\bbachelor\b|\bb\.s\b|\bb\.sc\b|\bb\.tech\b|\bb\.e\b|\bundergrad/.test(t)) return 2;
  if (/\bassociate\b|\bbootcamp\b|\bcertificate\b/.test(t)) return 1;
  if (/\bdegree\b|\buniversity\b|\bcollege\b/.test(t)) return 1;
  return 0;
}

function educationLabel(level: number): string {
  return ["Not stated", "Some college / certificate", "Bachelor's", "Master's", "Doctorate"][level] ?? "Not stated";
}

function roleScore(resumeRoles: string[], jobRoles: string[]): number {
  if (!jobRoles.length) return resumeRoles.length ? 60 : 50;
  let best = 0;
  for (const job of jobRoles) {
    for (const resume of resumeRoles) {
      best = Math.max(best, roleSimilarity(resume, job));
    }
  }
  if (best >= 0.8) return 100;
  if (best >= 0.5) return 78;
  if (best >= 0.34) return 58;
  if (resumeRoles.length) return 30;
  return 0;
}

function roleSimilarity(a: string, b: string): number {
  const left = expandRole(a);
  const right = expandRole(b);
  if (!left.size || !right.size) return 0;
  let inter = 0;
  for (const token of left) if (right.has(token)) inter += 1;
  return inter / Math.min(left.size, right.size);
}

function expandRole(role: string): Set<string> {
  const out = new Set<string>();
  for (const raw of role.toLowerCase().split(/[^a-z0-9+#]+/)) {
    if (!raw || SENIORITY.has(raw) || raw.length < 2) continue;
    out.add(ROLE_SYNONYMS[raw] ?? raw);
  }
  return out;
}

function experienceScore(resumeYears: number, jobYears: number, resumeEdu: number, jobEdu: number): number {
  let experience = 50;
  if (jobYears > 0) {
    if (resumeYears >= jobYears) experience = 100;
    else if (resumeYears >= jobYears * 0.7) experience = 80;
    else if (resumeYears >= jobYears * 0.5) experience = 60;
    else experience = Math.max(20, Math.round((resumeYears / jobYears) * 40));
  } else {
    experience = resumeYears > 0 ? 70 : 50;
  }
  let education = 50;
  if (jobEdu > 0) {
    if (resumeEdu >= jobEdu) education = 100;
    else if (resumeEdu >= jobEdu - 1) education = 70;
    else education = Math.max(30, Math.round((resumeEdu / jobEdu) * 50));
  } else {
    education = resumeEdu > 0 ? 70 : 50;
  }
  return Math.round((experience + education) / 2);
}

function topKeywords(text: string, limit: number): string[] {
  const freq = termFreq(text);
  return [...freq.entries()]
    .filter(([term]) => !EXTRA_STOP.has(term) && term.length > 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term]) => term);
}

function keywordScore(resumeKeywords: string[], jobKeywords: string[]): number {
  const job = jobKeywords.slice(0, 20);
  if (!job.length) return 0;
  const resume = new Set(resumeKeywords.slice(0, 30));
  const hit = job.filter((k) => resume.has(k)).length;
  return Math.round((hit / job.length) * 100);
}

function termFreq(text: string, bigrams = true): Map<string, number> {
  const freq = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^\.+|\.+$/g, ""))
    .filter((token) => token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
  for (const token of tokens) freq.set(token, (freq.get(token) ?? 0) + 1);
  if (!bigrams) return freq;
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    if (bigram.length < 7 || EXTRA_STOP.has(tokens[i]!) || EXTRA_STOP.has(tokens[i + 1]!)) continue;
    freq.set(bigram, (freq.get(bigram) ?? 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (const value of a.values()) a2 += value * value;
  for (const value of b.values()) b2 += value * value;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [term, value] of small) {
    const other = large.get(term);
    if (other) dot += value * other;
  }
  if (!a2 || !b2) return 0;
  return dot / Math.sqrt(a2 * b2);
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function skillByCategory(skills: FoundSkill[]): { category: string; skills: FoundSkill[] }[] {
  const map = new Map<string, FoundSkill[]>();
  for (const skill of skills) {
    const list = map.get(skill.category) ?? [];
    list.push(skill);
    map.set(skill.category, list);
  }
  return [...map.entries()].map(([category, group]) => ({ category, skills: group }));
}

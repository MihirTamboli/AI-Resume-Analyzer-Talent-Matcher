import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { H as isRedirect, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, t as array } from "../_libs/zod.mjs";
import { a as History, c as CircleAlert, i as Printer, l as Check, o as FileUp, r as Trash2, s as Copy, t as X, u as Briefcase } from "../_libs/lucide-react.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "../_libs/radix-ui__react-tabs.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BR3ib5bK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var inputSchema = object({
	resume: string().min(40).max(8e3),
	job: string().min(40).max(8e3),
	missing: array(string().max(48)).max(8),
	role: string().max(80)
});
var coachWithGrok = createServerFn({ method: "POST" }).validator((input) => {
	const parsed = inputSchema.safeParse(input);
	if (!parsed.success) throw new Error("Add a bit more resume and posting text before asking for a rewrite.");
	return parsed.data;
}).handler(createSsrRpc("68fbf70e2302717b37e8c0b1cacfac63e89cbfa65b19267926e23b9ab22e712f"));
async function readResumeFile(file) {
	const name = file.name.toLowerCase();
	if (file.size > 8388608) throw new Error("Keep files under 8 MB.");
	if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) return (await file.text()).trim();
	if (name.endsWith(".pdf") || file.type === "application/pdf") {
		const { extractText, getDocumentProxy } = await import("../_libs/unpdf.mjs").then((n) => n.t);
		const { text } = await extractText(await getDocumentProxy(new Uint8Array(await file.arrayBuffer())), { mergePages: true });
		const joined = (Array.isArray(text) ? text.join("\n") : String(text ?? "")).trim();
		if (joined.length < 40) throw new Error("This PDF has almost no text. If it is a scan, paste the resume instead.");
		return joined;
	}
	if (name.endsWith(".docx")) {
		const value = (await (await import("../_libs/mammoth+xmlbuilder.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).extractRawText({ arrayBuffer: await file.arrayBuffer() })).value.trim();
		if (value.length < 40) throw new Error("That document didn't contain enough text.");
		return value;
	}
	throw new Error("Use a PDF, DOCX, or TXT file — or paste the text.");
}
function skill(id, label, category, pattern) {
	return {
		id,
		label,
		category,
		pattern: new RegExp(pattern, "i")
	};
}
/** High-signal skills only. Generic soft skills are omitted so they don't inflate every match. */
var SKILLS = [
	skill("python", "Python", "Languages", "\\bpython\\b"),
	skill("javascript", "JavaScript", "Languages", "(?<!\\.)\\bjavascript\\b|(?<!\\.)\\bjs\\b"),
	skill("typescript", "TypeScript", "Languages", "\\btypescript\\b|\\bts\\b"),
	skill("java", "Java", "Languages", "\\bjava\\b"),
	skill("csharp", "C#", "Languages", "\\bc#\\b|\\bcsharp\\b"),
	skill("cpp", "C++", "Languages", "\\bc\\+\\+|\\bcpp\\b"),
	skill("go", "Go", "Languages", "\\bgolang\\b|\\bgo\\s+(?:lang|developer|engineer)\\b"),
	skill("rust", "Rust", "Languages", "\\brust\\b"),
	skill("kotlin", "Kotlin", "Languages", "\\bkotlin\\b"),
	skill("swift", "Swift", "Languages", "\\bswift\\b"),
	skill("php", "PHP", "Languages", "\\bphp\\b"),
	skill("ruby", "Ruby", "Languages", "\\bruby\\b"),
	skill("scala", "Scala", "Languages", "\\bscala\\b"),
	skill("sql", "SQL", "Data", "\\bsql\\b"),
	skill("html", "HTML", "Web", "\\bhtml5?\\b"),
	skill("css", "CSS", "Web", "\\bcss3?\\b"),
	skill("react", "React", "Web", "\\breact(?:\\.js|js)?\\b"),
	skill("next", "Next.js", "Web", "\\bnext(?:\\.js|js)?\\b"),
	skill("vue", "Vue", "Web", "\\bvue(?:\\.js|js)?\\b"),
	skill("angular", "Angular", "Web", "\\bangular(?:js)?\\b"),
	skill("svelte", "Svelte", "Web", "\\bsvelte\\b"),
	skill("node", "Node.js", "Web", "\\bnode(?:\\.js|js)?\\b"),
	skill("express", "Express", "Web", "\\bexpress(?:\\.js)?\\b"),
	skill("django", "Django", "Web", "\\bdjango\\b"),
	skill("flask", "Flask", "Web", "\\bflask\\b"),
	skill("fastapi", "FastAPI", "Web", "\\bfastapi\\b"),
	skill("spring", "Spring", "Web", "\\bspring\\s*boot\\b|\\bspring\\b"),
	skill("dotnet", ".NET", "Web", "\\b\\.net\\b|\\basp\\.net\\b"),
	skill("graphql", "GraphQL", "Web", "\\bgraphql\\b"),
	skill("rest", "REST APIs", "Web", "\\brest(?:ful)?\\b|\\brest\\s+apis?\\b"),
	skill("postgres", "PostgreSQL", "Data", "\\bpostgres(?:ql)?\\b"),
	skill("mysql", "MySQL", "Data", "\\bmysql\\b"),
	skill("mongodb", "MongoDB", "Data", "\\bmongodb\\b|\\bmongo\\b"),
	skill("redis", "Redis", "Data", "\\bredis\\b"),
	skill("elasticsearch", "Elasticsearch", "Data", "\\belasticsearch\\b"),
	skill("snowflake", "Snowflake", "Data", "\\bsnowflake\\b"),
	skill("spark", "Spark", "Data", "\\bapache\\s+spark\\b|\\bspark\\b"),
	skill("kafka", "Kafka", "Data", "\\bkafka\\b"),
	skill("airflow", "Airflow", "Data", "\\bairflow\\b"),
	skill("dbt", "dbt", "Data", "\\bdbt\\b"),
	skill("pandas", "pandas", "Data", "\\bpandas\\b"),
	skill("numpy", "NumPy", "Data", "\\bnumpy\\b"),
	skill("sklearn", "scikit-learn", "Data", "\\bscikit[- ]learn\\b|\\bsklearn\\b"),
	skill("tensorflow", "TensorFlow", "Data", "\\btensorflow\\b"),
	skill("pytorch", "PyTorch", "Data", "\\bpytorch\\b"),
	skill("tableau", "Tableau", "Data", "\\btableau\\b"),
	skill("powerbi", "Power BI", "Data", "\\bpower\\s*bi\\b"),
	skill("excel", "Excel", "Data", "\\bexcel\\b"),
	skill("nlp", "NLP", "Data", "\\bnlp\\b|\\bnatural language processing\\b"),
	skill("ml", "Machine learning", "Data", "\\bmachine learning\\b|\\bml\\b"),
	skill("aws", "AWS", "Cloud", "\\baws\\b|\\bamazon web services\\b"),
	skill("azure", "Azure", "Cloud", "\\bazure\\b"),
	skill("gcp", "GCP", "Cloud", "\\bgcp\\b|\\bgoogle cloud\\b"),
	skill("docker", "Docker", "Cloud", "\\bdocker\\b"),
	skill("kubernetes", "Kubernetes", "Cloud", "\\bkubernetes\\b|\\bk8s\\b"),
	skill("terraform", "Terraform", "Cloud", "\\bterraform\\b"),
	skill("cicd", "CI/CD", "Cloud", "\\bci\\/cd\\b|\\bcontinuous integration\\b|\\bgithub actions\\b"),
	skill("jenkins", "Jenkins", "Cloud", "\\bjenkins\\b"),
	skill("linux", "Linux", "Cloud", "\\blinux\\b"),
	skill("git", "Git", "Tools", "\\bgit\\b|\\bgithub\\b|\\bgitlab\\b"),
	skill("jira", "Jira", "Tools", "\\bjira\\b"),
	skill("figma", "Figma", "Design", "\\bfigma\\b"),
	skill("sketch", "Sketch", "Design", "\\bsketch\\b"),
	skill("ux", "UX research", "Design", "\\bux\\b|\\buser experience\\b|\\buser research\\b"),
	skill("ui", "UI design", "Design", "\\bui design\\b|\\buser interface\\b"),
	skill("pytest", "pytest", "Testing", "\\bpytest\\b"),
	skill("jest", "Jest", "Testing", "\\bjest\\b"),
	skill("cypress", "Cypress", "Testing", "\\bcypress\\b"),
	skill("playwright", "Playwright", "Testing", "\\bplaywright\\b"),
	skill("selenium", "Selenium", "Testing", "\\bselenium\\b"),
	skill("agile", "Agile", "Delivery", "\\bagile\\b"),
	skill("scrum", "Scrum", "Delivery", "\\bscrum\\b"),
	skill("microservices", "Microservices", "Architecture", "\\bmicroservices?\\b"),
	skill("systemdesign", "System design", "Architecture", "\\bsystem design\\b"),
	skill("a11y", "Accessibility", "Web", "\\baccessibility\\b|\\ba11y\\b|\\bwcag\\b"),
	skill("seo", "SEO", "Marketing", "\\bseo\\b"),
	skill("sem", "SEM", "Marketing", "\\bsem\\b|\\bgoogle ads\\b"),
	skill("ga", "Google Analytics", "Marketing", "\\bgoogle analytics\\b|\\bga4\\b"),
	skill("hubspot", "HubSpot", "Marketing", "\\bhubspot\\b"),
	skill("roadmap", "Roadmapping", "Product", "\\broadmap\\b"),
	skill("abtest", "A/B testing", "Product", "\\ba\\/b testing\\b|\\bab testing\\b"),
	skill("okr", "OKRs", "Product", "\\bokrs?\\b"),
	skill("stakeholder", "Stakeholder management", "Product", "\\bstakeholder management\\b"),
	skill("prd", "PRDs", "Product", "\\bprds?\\b|\\bproduct requirements?\\b")
];
var STOPWORDS = new Set(`a an the and or but if then else when while of to for in on at by from with as into onto over under about between among through during without within is are was were be been being it its this that these those i me my we our you your they them their he she his her not no nor so than too very can will just also have has had do does did doing done using use used via per each other such more most some any all own same than into across both few many much`.split(/\s+/));
var EXTRA_STOP = new Set(`experience years year team work role roles job jobs ability strong skills skill including include required requirements requirement responsibility responsibilities candidate looking join company our your plus good great excellent preferred must able well knowledge familiar familiarity working environment position opportunity qualifications qualification web application applications code development develop developing maintain maintaining clean framework frameworks testing database databases version control write participate troubleshoot troubleshooting debug debugging ideal cross functional production tools tool service services platform platforms related field degree computer science skilled proficiency nice have using across collaborate collaborate collaborates collaboration reviews review review`.split(/\s+/));
var ACTION_VERBS = [
	"led",
	"built",
	"designed",
	"shipped",
	"launched",
	"owned",
	"delivered",
	"improved",
	"reduced",
	"increased",
	"automated",
	"migrated",
	"architected",
	"implemented",
	"developed",
	"created",
	"optimized",
	"scaled",
	"mentored",
	"partnered",
	"analyzed",
	"negotiated",
	"published",
	"refactored",
	"deployed",
	"introduced",
	"streamlined",
	"drove",
	"established"
];
var WEAK_OPENERS = [
	{
		re: /^(?:responsible for|responsibilities included)\s+/i,
		swap: "Owned"
	},
	{
		re: /^(?:worked on|work on)\s+/i,
		swap: "Delivered"
	},
	{
		re: /^(?:helped|helped with|assisted|assisted with)\s+/i,
		swap: "Partnered to"
	},
	{
		re: /^(?:involved in|participated in)\s+/i,
		swap: "Contributed to"
	},
	{
		re: /^(?:duties included|tasked with)\s+/i,
		swap: "Led"
	},
	{
		re: /^(?:handled|did)\s+/i,
		swap: "Ran"
	}
];
var SENIORITY = /* @__PURE__ */ new Set([
	"senior",
	"junior",
	"lead",
	"principal",
	"staff",
	"associate",
	"mid",
	"level",
	"sr",
	"jr",
	"i",
	"ii",
	"iii"
]);
var ROLE_SYNONYMS = {
	developer: "engineer",
	programmer: "engineer",
	swe: "engineer",
	engineering: "engineer",
	frontend: "front",
	"front-end": "front",
	backend: "back",
	"back-end": "back",
	fullstack: "full",
	"full-stack": "full",
	ml: "machine",
	learning: "machine",
	ux: "design",
	ui: "design",
	designer: "design",
	pm: "product",
	owner: "product",
	scientist: "science",
	analyst: "analysis"
};
var DEFAULT_WEIGHTS = {
	skills: 50,
	role: 30,
	experience: 20
};
function normalizeWeights(input) {
	const skills = clamp(input?.skills ?? DEFAULT_WEIGHTS.skills, 5, 80);
	const role = clamp(input?.role ?? DEFAULT_WEIGHTS.role, 5, 80);
	const experience = clamp(input?.experience ?? DEFAULT_WEIGHTS.experience, 5, 80);
	const sum = skills + role + experience;
	const next = {
		skills: Math.round(skills / sum * 100),
		role: Math.round(role / sum * 100),
		experience: Math.round(experience / sum * 100)
	};
	const drift = 100 - (next.skills + next.role + next.experience);
	next.skills += drift;
	return next;
}
function analyze(resumeText, jobText, weightsInput) {
	const weights = normalizeWeights(weightsInput);
	const resume = profile(resumeText, "resume");
	const job = profile(jobText, "job");
	const resumeIds = new Set(resume.skills.map((s) => s.id));
	const matchedSkills = job.skills.filter((s) => resumeIds.has(s.id));
	const missingSkills = job.skills.filter((s) => !resumeIds.has(s.id)).sort((a, b) => b.count - a.count);
	const extraSkills = resume.skills.filter((s) => !job.skills.some((j) => j.id === s.id));
	const skill = job.skills.length === 0 ? keywordScore(resume.keywords, job.keywords) : Math.min(100, Math.round(matchedSkills.length / job.skills.length * 150));
	const role = roleScore(resume.roles, job.roles);
	const experience = experienceScore(resume.experienceYears, job.experienceYears, resume.educationLevel, job.educationLevel);
	const keyword = keywordScore(resume.keywords, job.keywords);
	const matchedKeywords = resume.keywords.filter((k) => job.keywords.includes(k)).slice(0, 16);
	const missingKeywords = job.keywords.filter((k) => !resume.keywords.includes(k)).slice(0, 12);
	const similarity = Math.round(cosineSimilarity(termFreq(resumeText, false), termFreq(jobText, false)) * 100);
	const health = healthChecks(resumeText, resume);
	const ats = Math.round(health.filter((h) => h.pass).length / health.length * 100);
	const overall = Math.round((skill * weights.skills + role * weights.role + experience * weights.experience) / 100);
	const { verdict, verdictNote } = band(overall);
	const targetRole = job.roles[0] ? titleCase$1(job.roles[0]) : "this role";
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
		suggestions: [],
		bullets: rewriteBullets(resumeText),
		letter: coverLetter(resumeText, targetRole, matchedSkills, missingSkills)
	};
	reportBase.suggestions = suggestions({
		...reportBase,
		experienceYearsResume: resume.experienceYears,
		experienceYearsJob: job.experienceYears,
		educationResume: resume.educationLevel,
		educationJob: job.educationLevel
	});
	return reportBase;
}
function suggestions(input) {
	const out = [];
	if (input.skill < 70 && input.missingSkills.length) {
		const names = input.missingSkills.slice(0, 5).map((s) => s.label);
		out.push({
			category: "Skills",
			priority: "High",
			suggestion: `Bring these posting skills onto the page: ${names.join(", ")}.`,
			description: "Only add a skill you can defend in an interview. Put the strongest ones in a skills line and once inside a bullet."
		});
	}
	if (input.role < 60) out.push({
		category: "Role alignment",
		priority: "High",
		suggestion: "Mirror the posting’s title in your headline and most recent role line.",
		description: "Recruiters skim the title first. Use the same family of words (engineer vs developer is fine; a distant title is not)."
	});
	if (input.experience < 70 && input.experienceYearsJob > input.experienceYearsResume) out.push({
		category: "Experience",
		priority: "Medium",
		suggestion: `The posting asks for about ${input.experienceYearsJob}+ years. Show equivalent scope if your title years are shorter.`,
		description: "Lead with the largest system, team, or budget you owned. Freelance, research, and shipped side projects count when they are specific."
	});
	if (input.educationJob > input.educationResume && input.educationJob >= 3) out.push({
		category: "Education",
		priority: "Low",
		suggestion: "The posting prefers a higher degree. Surface certifications, coursework, or publications instead of hiding the gap.",
		description: "A one-line education note plus a credential beats leaving the section blank."
	});
	if (input.keyword < 50 && input.missingKeywords.length) out.push({
		category: "Keywords",
		priority: "Medium",
		suggestion: `Work these phrases in naturally: ${input.missingKeywords.slice(0, 4).join(", ")}.`,
		description: "Applicant tracking systems still rank literal overlap. Use the posting’s wording once, not a stuffed list."
	});
	for (const check of input.health) {
		if (check.pass) continue;
		if (check.id === "metrics") out.push({
			category: "Impact",
			priority: "High",
			suggestion: "Add numbers to at least three bullets: time saved, revenue, latency, users, or error rate.",
			description: check.detail
		});
		else if (check.id === "verbs") out.push({
			category: "Bullets",
			priority: "Medium",
			suggestion: "Open bullets with a concrete verb — shipped, reduced, led — not “responsible for”.",
			description: check.detail
		});
		else if (check.id === "contact") out.push({
			category: "Contact",
			priority: "High",
			suggestion: "Put a plain email and a phone or portfolio link in the first lines.",
			description: check.detail
		});
	}
	if (input.overall >= 85) out.push({
		category: "Excellent match",
		priority: "Low",
		suggestion: "This draft already tracks the posting. Tighten the top three bullets and stop editing.",
		description: "A cover letter should repeat the same matched skills, not introduce a new story."
	});
	else if (input.overall < 80) out.push({
		category: "Tailoring",
		priority: "Medium",
		suggestion: "Cut bullets that this posting never mentions and spend that space on the gaps above.",
		description: "One resume per posting beats a generic master file."
	});
	const rank = {
		High: 0,
		Medium: 1,
		Low: 2
	};
	return out.sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, 6);
}
function coverLetter(resumeText, targetRole, matched, missing) {
	const skills = matched.slice(0, 3).map((s) => s.label);
	const skillLine = skills.length ? `The overlap that matters is ${joinList(skills)}.` : "The posting and this resume share little explicit tooling yet, so the letter should lead with scope instead of a skill list.";
	const gap = missing[0] ? ` If you have adjacent proof of ${missing[0].label}, name the project. If you don’t, leave it out.` : "";
	const years = extractExplicitYears(resumeText);
	return {
		greeting: "Hello,",
		paragraphs: [
			`I’m writing about the ${targetRole} opening.${years ? ` I have about ${years} years in related work.` : ""} ${skillLine}`,
			`In the roles on my resume I shipped work a hiring manager can check: name the system, the constraint, and the result. I can walk through those decisions in an interview.${gap}`,
			"I’m glad to share a short walkthrough of the closest project. Thank you for reading."
		]
	};
}
function rewriteBullets(text) {
	const lines = text.split(/\n+/).map((line) => line.replace(/^[\s•\-*–—\d.)]+/, "").trim()).filter((line) => line.length > 40 && line.length < 220);
	const weak = lines.filter((line) => WEAK_OPENERS.some((w) => w.re.test(line)));
	return (weak.length ? weak : lines.filter((line) => !/\d/.test(line))).slice(0, 3).map((original) => {
		let body = original;
		let verb = "Delivered";
		for (const opener of WEAK_OPENERS) if (opener.re.test(body)) {
			verb = opener.swap;
			body = body.replace(opener.re, "");
			break;
		}
		const cleaned = body.charAt(0).toLowerCase() + body.slice(1).replace(/\.$/, "");
		const ending = /\d/.test(original) ? "" : ", moving [metric] by [amount]";
		return {
			original,
			rewrite: `${verb} ${cleaned}${ending}.`
		};
	});
}
function isQuantified(line) {
	if (/%|\$/.test(line)) return true;
	return (line.match(/\d[\d,]*/g) ?? []).some((token) => {
		const value = Number(token.replace(/,/g, ""));
		return value > 0 && (value < 1900 || value > 2100);
	});
}
function healthChecks(text, resume) {
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
			detail: resume.email ? "Email is present. Add a phone or a link if either is missing." : "No email found. Put it in the header as plain text, not an image."
		},
		{
			id: "length",
			label: "Length",
			pass: words >= 280 && words <= 1100,
			detail: words < 280 ? `${words} words is thin for most mid-level roles. Aim for 350–800.` : words > 1100 ? `${words} words is long. Cut older roles to one line each.` : `${words} words sits in a readable range.`
		},
		{
			id: "metrics",
			label: "Quantified bullets",
			pass: quantified >= 3,
			detail: quantified >= 3 ? `${quantified} lines carry a number, percent, or dollar figure.` : `Only ${quantified} quantified line${quantified === 1 ? "" : "s"}. Add scale even if it is “4 services” or “12%”.`
		},
		{
			id: "verbs",
			label: "Action verbs",
			pass: verbHits >= 3,
			detail: verbHits >= 3 ? `${verbHits} lines open with a strong verb.` : "Most lines don’t start with a verb like led, shipped, or reduced."
		},
		{
			id: "sections",
			label: "Core sections",
			pass: /experience|employment|work history/i.test(text) && /education|university|bachelor|master|b\.s|b\.tech/i.test(text) && /skill/i.test(text),
			detail: "Look for recognizable Experience, Education, and Skills headings so parsers don’t merge them."
		},
		{
			id: "pronouns",
			label: "First person",
			pass: pronouns < 4,
			detail: pronouns < 4 ? "The draft stays in resume voice." : `${pronouns} first-person pronouns. Drop “I” and start on the verb.`
		},
		{
			id: "cliche",
			label: "Stock phrases",
			pass: !/references available|team player|hard worker|go-getter|synergy/i.test(text),
			detail: "Skip “references available” and filler labels. The work should carry the claim."
		},
		{
			id: "readable",
			label: "Extractable text",
			pass: text.replace(/\s+/g, " ").trim().length > 180,
			detail: text.trim().length > 180 ? "The text extracted cleanly." : "Almost no text came through. If this was a scanned PDF, paste the text instead."
		}
	];
}
function band(score) {
	if (score >= 85) return {
		verdict: "Strong fit",
		verdictNote: "Submit. Spend ten minutes on the top bullets, not a rewrite."
	};
	if (score >= 70) return {
		verdict: "Competitive",
		verdictNote: "Close the two highest gaps, then send it."
	};
	if (score >= 55) return {
		verdict: "Stretch",
		verdictNote: "The posting is asking for a different shape of evidence. Tailor before you apply."
	};
	return {
		verdict: "Rework first",
		verdictNote: "Overlap is thin. Either retarget the resume or pick a closer posting."
	};
}
function profile(text, kind) {
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
		link: /https?:\/\/|linkedin\.com|github\.com/i.test(text)
	};
}
function extractSkills(text) {
	const found = [];
	for (const def of SKILLS) {
		const matches = text.match(new RegExp(def.pattern.source, "gi"));
		if (matches?.length) found.push({
			id: def.id,
			label: def.label,
			category: def.category,
			count: matches.length
		});
	}
	return found.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
var ROLE_RE = /\b(?:senior|junior|lead|principal|staff|associate|software|web|data|machine learning|ml|ai|backend|back-end|frontend|front-end|full[- ]stack|devops|cloud|security|mobile|ios|android|qa|product|project|program|site reliability|python|java|react|growth|marketing|content)(?:\s+[a-z0-9+#./-]+){0,3}\s+(?:engineer|developer|analyst|scientist|architect|manager|designer|consultant|specialist|director)\b/gi;
function extractRoles(text) {
	const raw = text.match(ROLE_RE) ?? [];
	const seen = /* @__PURE__ */ new Set();
	const roles = [];
	for (const hit of raw) {
		const cleaned = hit.replace(/\s+/g, " ").trim().toLowerCase();
		if (cleaned.length < 5 || seen.has(cleaned)) continue;
		seen.add(cleaned);
		roles.push(cleaned);
	}
	return roles.slice(0, 8);
}
function extractExplicitYears(text) {
	const years = [];
	for (const pattern of [
		/(\d{1,2})\s*\+\s*years?\b/gi,
		/(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*years?\b/gi,
		/(\d{1,2})\s*years?(?:\s+of)?\s+(?:experience|exp\b)/gi
	]) for (const match of text.matchAll(pattern)) for (const group of match.slice(1)) if (group && /^\d+$/.test(group)) {
		const n = Number(group);
		if (n > 0 && n <= 40) years.push(n);
	}
	return years.length ? Math.max(...years) : 0;
}
function estimateSpanYears(text) {
	const now = (/* @__PURE__ */ new Date()).getFullYear();
	let best = 0;
	for (const match of text.matchAll(/((?:19|20)\d{2})\s*(?:-|–|—|to)\s*(present|current|now|(?:19|20)\d{2})/gi)) {
		const start = Number(match[1]);
		const end = /present|current|now/i.test(match[2] ?? "") ? now : Number(match[2]);
		if (end >= start && end - start <= 40) best = Math.max(best, end - start);
	}
	return best;
}
function educationScore(text) {
	const t = text.toLowerCase();
	if (/\bph\.?d\b|doctorate/.test(t)) return 4;
	if (/\bmaster\b|\bmba\b|\bm\.s\b|\bm\.sc\b|\bm\.tech\b/.test(t)) return 3;
	if (/\bbachelor\b|\bb\.s\b|\bb\.sc\b|\bb\.tech\b|\bb\.e\b|\bundergrad/.test(t)) return 2;
	if (/\bassociate\b|\bbootcamp\b|\bcertificate\b/.test(t)) return 1;
	if (/\bdegree\b|\buniversity\b|\bcollege\b/.test(t)) return 1;
	return 0;
}
function educationLabel(level) {
	return [
		"Not stated",
		"Some college / certificate",
		"Bachelor's",
		"Master's",
		"Doctorate"
	][level] ?? "Not stated";
}
function roleScore(resumeRoles, jobRoles) {
	if (!jobRoles.length) return resumeRoles.length ? 60 : 50;
	let best = 0;
	for (const job of jobRoles) for (const resume of resumeRoles) best = Math.max(best, roleSimilarity(resume, job));
	if (best >= .8) return 100;
	if (best >= .5) return 78;
	if (best >= .34) return 58;
	if (resumeRoles.length) return 30;
	return 0;
}
function roleSimilarity(a, b) {
	const left = expandRole(a);
	const right = expandRole(b);
	if (!left.size || !right.size) return 0;
	let inter = 0;
	for (const token of left) if (right.has(token)) inter += 1;
	return inter / Math.min(left.size, right.size);
}
function expandRole(role) {
	const out = /* @__PURE__ */ new Set();
	for (const raw of role.toLowerCase().split(/[^a-z0-9+#]+/)) {
		if (!raw || SENIORITY.has(raw) || raw.length < 2) continue;
		out.add(ROLE_SYNONYMS[raw] ?? raw);
	}
	return out;
}
function experienceScore(resumeYears, jobYears, resumeEdu, jobEdu) {
	let experience = 50;
	if (jobYears > 0) {
		if (resumeYears >= jobYears) experience = 100;
		else if (resumeYears >= jobYears * .7) experience = 80;
		else if (resumeYears >= jobYears * .5) experience = 60;
		else experience = Math.max(20, Math.round(resumeYears / jobYears * 40));
	} else experience = resumeYears > 0 ? 70 : 50;
	let education = 50;
	if (jobEdu > 0) {
		if (resumeEdu >= jobEdu) education = 100;
		else if (resumeEdu >= jobEdu - 1) education = 70;
		else education = Math.max(30, Math.round(resumeEdu / jobEdu * 50));
	} else education = resumeEdu > 0 ? 70 : 50;
	return Math.round((experience + education) / 2);
}
function topKeywords(text, limit) {
	return [...termFreq(text).entries()].filter(([term]) => !EXTRA_STOP.has(term) && term.length > 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([term]) => term);
}
function keywordScore(resumeKeywords, jobKeywords) {
	const job = jobKeywords.slice(0, 20);
	if (!job.length) return 0;
	const resume = new Set(resumeKeywords.slice(0, 30));
	const hit = job.filter((k) => resume.has(k)).length;
	return Math.round(hit / job.length * 100);
}
function termFreq(text, bigrams = true) {
	const freq = /* @__PURE__ */ new Map();
	const tokens = text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").split(/\s+/).map((token) => token.replace(/^\.+|\.+$/g, "")).filter((token) => token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
	for (const token of tokens) freq.set(token, (freq.get(token) ?? 0) + 1);
	if (!bigrams) return freq;
	for (let i = 0; i < tokens.length - 1; i += 1) {
		const bigram = `${tokens[i]} ${tokens[i + 1]}`;
		if (bigram.length < 7 || EXTRA_STOP.has(tokens[i]) || EXTRA_STOP.has(tokens[i + 1])) continue;
		freq.set(bigram, (freq.get(bigram) ?? 0) + 1);
	}
	return freq;
}
function cosineSimilarity(a, b) {
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
function joinList(items) {
	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} and ${items[1]}`;
	return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
function titleCase$1(value) {
	return value.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function skillByCategory(skills) {
	const map = /* @__PURE__ */ new Map();
	for (const skill of skills) {
		const list = map.get(skill.category) ?? [];
		list.push(skill);
		map.set(skill.category, list);
	}
	return [...map.entries()].map(([category, group]) => ({
		category,
		skills: group
	}));
}
var KEY = "lumen-history-v1";
function loadHistory() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
	} catch {
		return [];
	}
}
function saveHistory(entry) {
	const next = [entry, ...loadHistory().filter((item) => item.id !== entry.id)].slice(0, 8);
	window.localStorage.setItem(KEY, JSON.stringify(next));
	return next;
}
function removeHistory(id) {
	const next = loadHistory().filter((item) => item.id !== id);
	window.localStorage.setItem(KEY, JSON.stringify(next));
	return next;
}
function clearHistory() {
	window.localStorage.removeItem(KEY);
}
var SAMPLE_RESUME = `Asha Raman
asha.raman@email.com · +1 415 555 0148 · https://github.com/asharaman

Senior Software Engineer

Experience
Senior Software Engineer, Northwind Labs — 2021 – Present
- Built Flask and Django services in Python used by 40k monthly customers.
- Designed REST APIs and a PostgreSQL schema that cut p95 latency 28%.
- Shipped Docker images and GitHub Actions CI/CD for three production services.
- Mentored 4 engineers and led code reviews for the billing team.

Software Engineer, Harbor Systems — 2018 – 2021
- Developed internal tools with Python, pytest, and MySQL.
- Automated deploy steps with Git and Jenkins, reducing release time from 2 hours to 20 minutes.
- Worked on a data export used by finance each Monday.

Skills
Python, Flask, Django, REST APIs, PostgreSQL, MySQL, Git, Docker, pytest, Linux, JavaScript

Education
Bachelor of Science, Computer Science — State University, 2018
`;
var SAMPLE_SWITCH = `Rohan Iyer
rohan.iyer@email.com · +1 628 555 0190 · linkedin.com/in/rohaniyer

Marketing Manager

Experience
Marketing Manager, Fieldnote — 2020 – Present
- Responsible for campaign calendars across email and social.
- Helped with brand guidelines and a website refresh in Webflow.
- Increased newsletter open rate 12% over two quarters.

Content Specialist, Paperlane — 2017 – 2020
- Wrote blog posts and case studies for a B2B series.
- Assisted with SEO briefs and HubSpot workflows.

Skills
SEO, Google Analytics, HubSpot, copywriting, content strategy

Education
Bachelor of Arts, English — City College, 2017
`;
var SAMPLE_JOB = `We are looking for a skilled Python Developer to join our team. The ideal candidate will have experience with web development using Flask or Django, and proficiency in Python programming.

Requirements:
- 3+ years of experience in Python development
- Strong knowledge of web frameworks (Flask, Django)
- Experience with databases (PostgreSQL, MySQL)
- Familiarity with version control (Git)
- Knowledge of REST APIs and microservices
- Experience with testing frameworks (pytest, unittest)
- Bachelor's degree in Computer Science or a related field

Responsibilities:
- Develop and maintain web applications using Python
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Troubleshoot and debug applications

Nice to have:
- Experience with cloud platforms (AWS, Azure)
- Knowledge of containerization (Docker)
- Familiarity with CI/CD pipelines
`;
var SAMPLE_PRODUCT_JOB = `Product Manager, Growth

About the role
We need a product manager to own the activation funnel for a B2B analytics product. You will write PRDs, run A/B testing, and keep a public roadmap with engineering and design.

Requirements
- 5+ years of product management experience
- Hands-on SQL and comfort reading experiment results
- Stakeholder management across sales, design, and engineering
- Experience with OKRs and user research
- Bachelor's degree

Nice to have
- Figma for quick flows
- A/B testing platforms
- B2B SaaS background
`;
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function ScoreRing({ value, label }) {
	const [shown, setShown] = (0, import_react.useState)(0);
	const radius = 58;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference * (1 - Math.max(0, Math.min(100, shown)) / 100);
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => setShown(value));
		return () => cancelAnimationFrame(frame);
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid size-40 shrink-0 place-items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 140 140",
			className: "size-full -rotate-90",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "70",
				cy: "70",
				r: radius,
				fill: "none",
				stroke: "var(--color-line)",
				strokeWidth: "8"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "70",
				cy: "70",
				r: radius,
				fill: "none",
				stroke: "var(--color-accent)",
				strokeWidth: "8",
				strokeLinecap: "round",
				strokeDasharray: circumference,
				strokeDashoffset: offset,
				className: "score-arc"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-5xl leading-none tabular-nums",
				children: shown
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs tracking-wide text-muted uppercase",
				children: label
			})]
		})]
	});
}
var PRESETS = [
	{
		id: "classic",
		label: "Classic",
		weights: {
			skills: 50,
			role: 30,
			experience: 20
		}
	},
	{
		id: "skills",
		label: "Skills first",
		weights: {
			skills: 70,
			role: 15,
			experience: 15
		}
	},
	{
		id: "leadership",
		label: "Leadership",
		weights: {
			skills: 30,
			role: 45,
			experience: 25
		}
	}
];
function Studio() {
	const sharpen = useServerFn(coachWithGrok);
	const resultsRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const [resume, setResume] = (0, import_react.useState)("");
	const [job, setJob] = (0, import_react.useState)("");
	const [fileLabel, setFileLabel] = (0, import_react.useState)(null);
	const [weights, setWeights] = (0, import_react.useState)(PRESETS[0].weights);
	const [report, setReport] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [reading, setReading] = (0, import_react.useState)(false);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("gaps");
	const [coach, setCoach] = (0, import_react.useState)(null);
	const [coaching, setCoaching] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setHistory(loadHistory());
	}, []);
	const bars = (0, import_react.useMemo)(() => report ? [
		{
			name: "Skills",
			score: report.skill,
			weight: `${report.weights.skills}%`
		},
		{
			name: "Role",
			score: report.role,
			weight: `${report.weights.role}%`
		},
		{
			name: "Experience",
			score: report.experience,
			weight: `${report.weights.experience}%`
		}
	] : [], [report]);
	async function takeFile(file) {
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
		const entry = {
			id: `${Date.now()}`,
			at: Date.now(),
			label: fileLabel ?? firstLine(nextResume),
			overall: next.overall,
			verdict: next.verdict,
			resume: nextResume.slice(0, 2e4),
			job: nextJob.slice(0, 2e4),
			weights: next.weights
		};
		setHistory(saveHistory(entry));
		requestAnimationFrame(() => {
			resultsRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		});
	}
	function retune(key, value) {
		const clamped = Math.min(80, Math.max(10, value));
		const others = Object.keys(weights).filter((name) => name !== key);
		const rest = 100 - clamped;
		const base = others.reduce((sum, name) => sum + weights[name], 0) || 1;
		const next = {
			...weights,
			[key]: clamped
		};
		let used = clamped;
		others.forEach((name, index) => {
			if (index === others.length - 1) next[name] = Math.max(5, 100 - used);
			else {
				next[name] = Math.max(5, Math.round(rest * weights[name] / base));
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
			const result = await sharpen({ data: {
				resume: resume.slice(0, 8e3),
				job: job.slice(0, 8e3),
				missing: report.missingSkills.slice(0, 8).map((skill) => skill.label),
				role: report.targetRole
			} });
			setCoach(result);
			setTab("rewrite");
		} catch (err) {
			setCoach({
				ok: false,
				error: err instanceof Error ? err.message : "The rewrite didn't finish."
			});
		} finally {
			setCoaching(false);
		}
	}
	function openHistory(entry) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "liquid-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "no-print mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 place-items-center rounded-control border border-line bg-surface/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 rounded-full border-2 border-accent" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none tracking-tight",
						children: "Lumen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Resume fit, kept on this device"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setHistoryOpen((open) => !open),
					className: "inline-flex min-h-11 items-center gap-2 rounded-control border border-line bg-surface/70 px-3 text-sm text-fg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, {
							className: "size-4",
							"aria-hidden": "true"
						}),
						"History",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-muted",
							children: history.length
						})
					]
				})]
			}),
			historyOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-print mx-auto w-full max-w-6xl px-4 sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass mb-4 rounded-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Recent reads"
						}), history.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted underline-offset-4 hover:underline",
							onClick: () => {
								clearHistory();
								setHistory([]);
							},
							children: "Clear"
						}) : null]
					}), history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Scores you run stay in this browser. Nothing is sent until you ask for a rewrite."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-2",
						children: history.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 rounded-control bg-bg/40 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "min-h-11 min-w-0 flex-1 text-left",
									onClick: () => openHistory(entry),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm",
										children: entry.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: [
											entry.verdict,
											" · ",
											new Date(entry.at).toLocaleString()
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-2xl tabular-nums",
									children: entry.overall
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Remove saved read",
									className: "grid size-11 place-items-center text-muted",
									onClick: () => setHistory(removeHistory(entry.id)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						}, entry.id))
					})]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "no-print mb-6 max-w-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl leading-tight tracking-tight sm:text-5xl",
							children: "See the fit before you apply."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-xl text-base leading-relaxed text-muted",
							children: "Drop in a resume and a posting. Lumen scores skills, role, and experience, then shows the gaps worth fixing."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "no-print mb-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => {
									setResume(SAMPLE_RESUME);
									setJob(SAMPLE_JOB);
									setFileLabel("Sample · strong match");
									setError(null);
								},
								children: "Strong sample"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => {
									setResume(SAMPLE_SWITCH);
									setJob(SAMPLE_JOB);
									setFileLabel("Sample · career switch");
									setError(null);
								},
								children: "Stretch sample"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => {
									setJob(SAMPLE_PRODUCT_JOB);
									setError(null);
								},
								children: "Product posting"
							})
						]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "no-print mb-4 rounded-control border border-line bg-surface px-4 py-3 text-sm text-bad",
						role: "alert",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "no-print grid gap-4 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass rounded-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "flex items-center gap-2 font-display text-2xl",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {
											className: "size-5 text-accent",
											"aria-hidden": "true"
										}), "Resume"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-subtle tabular-nums",
										children: [resume.trim() ? resume.trim().split(/\s+/).length : 0, " words"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => fileRef.current?.click(),
									onDragOver: (event) => {
										event.preventDefault();
										setDragOver(true);
									},
									onDragLeave: () => setDragOver(false),
									onDrop: (event) => {
										event.preventDefault();
										setDragOver(false);
										const file = event.dataTransfer.files[0];
										if (file) takeFile(file);
									},
									className: cn("mb-3 flex min-h-24 w-full flex-col items-center justify-center rounded-control border border-dashed px-4 py-4 text-center", dragOver ? "border-accent bg-surface-2" : "border-line bg-bg/30"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: reading ? "Reading the file…" : "Drop a PDF, DOCX, or TXT"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 text-xs text-muted",
										children: "or click to browse · 8 MB max · text stays here"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: ".pdf,.docx,.txt,.md,application/pdf,text/plain",
									className: "sr-only",
									onChange: (event) => {
										const file = event.target.files?.[0];
										if (file) takeFile(file);
										event.target.value = "";
									}
								}),
								fileLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mb-2 flex items-center justify-between gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: fileLabel
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "inline-flex items-center gap-1",
										onClick: () => {
											setFileLabel(null);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											className: "size-3",
											"aria-hidden": "true"
										}), "Clear label"]
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: resume,
									onChange: (event) => setResume(event.target.value),
									placeholder: "Or paste the resume. Headings, bullets, and dates all help.",
									className: "min-h-64 w-full resize-y rounded-control border border-line bg-bg/40 p-4 text-sm leading-relaxed text-fg placeholder:text-subtle"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass rounded-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "flex items-center gap-2 font-display text-2xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, {
										className: "size-5 text-accent",
										"aria-hidden": "true"
									}), "Posting"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-subtle tabular-nums",
									children: [job.length, " characters"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: job,
								onChange: (event) => setJob(event.target.value),
								placeholder: "Paste the full job description: requirements, responsibilities, and nice-to-haves.",
								className: "min-h-80 w-full resize-y rounded-control border border-line bg-bg/40 p-4 text-sm leading-relaxed text-fg placeholder:text-subtle lg:min-h-[22rem]"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass no-print mt-4 rounded-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex flex-wrap items-end justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-2xl",
									children: "How to weigh the match"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Classic is the original 50 / 30 / 20 split. The three always add to 100."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setWeights(preset.weights),
										className: cn("min-h-11 rounded-full px-3 text-sm", sameWeights(weights, preset.weights) ? "bg-accent text-accent-fg" : "border border-line text-fg"),
										children: preset.label
									}, preset.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightSlider, {
										label: "Skills",
										value: weights.skills,
										onChange: (value) => retune("skills", value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightSlider, {
										label: "Role",
										value: weights.role,
										onChange: (value) => retune("role", value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightSlider, {
										label: "Experience",
										value: weights.experience,
										onChange: (value) => retune("experience", value)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => run(),
								className: "mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-control bg-accent px-4 text-base font-medium text-accent-fg sm:w-auto",
								children: "Read the fit"
							})
						]
					}),
					report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						ref: resultsRef,
						className: "mt-6 scroll-mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass rounded-card p-4 sm:p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-6 lg:flex-row lg:items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRing, {
										value: report.overall,
										label: report.verdict
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs tracking-wide text-muted uppercase",
												children: "Target"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "font-display text-3xl leading-tight",
												children: report.targetRole
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
												children: report.verdictNote
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 grid gap-3 sm:grid-cols-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
														label: "Semantic overlap",
														value: report.similarity,
														hint: "Wording, not just skills"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
														label: "ATS health",
														value: report.ats,
														hint: "Structure a parser can read"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
														label: "Keyword overlap",
														value: report.keyword,
														hint: "Outside the weighted score"
													})
												]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 h-48",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
										width: "100%",
										height: "100%",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
											data: bars,
											barSize: 28,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
													dataKey: "name",
													tick: {
														fill: "var(--color-muted)",
														fontSize: 12
													},
													axisLine: false,
													tickLine: false
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
													domain: [0, 100],
													hide: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
													cursor: { fill: "transparent" },
													contentStyle: {
														background: "var(--color-surface)",
														border: "1px solid var(--color-line)",
														borderRadius: 12,
														color: "var(--color-fg)"
													},
													formatter: (value, _name, item) => [`${value}`, `Score · weight ${item.payload.weight}`]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
													dataKey: "score",
													fill: "var(--color-accent)",
													radius: [
														8,
														8,
														4,
														4
													]
												})
											]
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "no-print mt-2 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Ghost, {
										onClick: () => void copyReport(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
											className: "size-4",
											"aria-hidden": "true"
										}), copied ? "Copied" : "Copy report"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Ghost, {
										onClick: () => window.print(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {
											className: "size-4",
											"aria-hidden": "true"
										}), "Print"]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							value: tab,
							onValueChange: setTab,
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
									className: "no-print flex gap-1 overflow-x-auto rounded-card bg-surface/80 p-1",
									children: [
										["gaps", "Gaps"],
										["health", "Health"],
										["rewrite", "Rewrite"],
										["letter", "Letter"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value,
										className: "min-h-11 shrink-0 rounded-control px-4 text-sm text-muted data-[state=active]:bg-bg data-[state=active]:text-fg",
										children: label
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
									value: "gaps",
									className: "mt-4 grid gap-4 lg:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
											title: "Missing from the resume",
											hint: "Ordered by how often the posting repeats them.",
											children: report.missingSkills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted",
												children: "Every detected posting skill shows up in the resume."
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillGroups, {
												skills: skillByCategory(report.missingSkills),
												tone: "miss"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
											title: "Already covered",
											children: report.matchedSkills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted",
												children: "No shared skills yet. Check that the posting names tools explicitly."
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillGroups, {
												skills: skillByCategory(report.matchedSkills),
												tone: "hit"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
											title: "Phrases to borrow",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
												items: report.missingKeywords,
												empty: "The wording already overlaps."
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
											title: "What to do next",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "grid gap-3",
												children: report.suggestions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "rounded-control bg-bg/40 p-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-xs tracking-wide text-muted uppercase",
															children: [
																item.priority,
																" · ",
																item.category
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-1 text-sm",
															children: item.suggestion
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-1 text-xs leading-relaxed text-muted",
															children: item.description
														})
													]
												}, item.suggestion))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
											title: "Read of the two texts",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
												className: "grid grid-cols-2 gap-3 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														label: "Resume years",
														value: report.resume.experienceYears ? `${report.resume.experienceYears}` : "Unclear"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														label: "Posting years",
														value: report.job.experienceYears ? `${report.job.experienceYears}+` : "Unstated"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														label: "Resume education",
														value: report.resume.educationLabel
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														label: "Posting education",
														value: report.job.educationLabel
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														label: "Resume roles",
														value: report.resume.roles[0] ? titleCase(report.resume.roles[0]) : "None detected"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														label: "Posting roles",
														value: report.job.roles[0] ? titleCase(report.job.roles[0]) : "None detected"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
											title: "Extra skills the posting never names",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
												items: report.extraSkills.map((skill) => skill.label),
												empty: "Nothing extra stood out."
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "health",
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
										title: "Parser and skim checks",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "grid gap-2",
											children: report.health.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex gap-3 rounded-control bg-bg/40 p-3",
												children: [check.pass ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
													className: "mt-0.5 size-4 shrink-0 text-good",
													"aria-hidden": "true"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
													className: "mt-0.5 size-4 shrink-0 text-warn",
													"aria-hidden": "true"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm",
													children: [check.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "ml-2 text-xs text-muted",
														children: check.pass ? "Pass" : "Fix"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs leading-relaxed text-muted",
													children: check.detail
												})] })]
											}, check.id))
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
									value: "rewrite",
									className: "mt-4 grid gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
										title: "On-device bullet pass",
										hint: "Weak openers are rewritten. Brackets are facts you still need to fill in.",
										children: report.bullets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "No bullet-length lines were found. Paste the experience section with line breaks."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "grid gap-3",
											children: report.bullets.map((bullet) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "grid gap-2 rounded-control bg-bg/40 p-3 text-sm sm:grid-cols-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted",
													children: bullet.original
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: bullet.rewrite })]
											}, bullet.original))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
										title: "Sharpen with Grok",
										hint: "Sends this resume and posting once. It will not invent employers or numbers.",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => void askCoach(),
												disabled: coaching,
												className: "inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60",
												children: coaching ? "Writing…" : "Ask for a grounded rewrite"
											}),
											coach && !coach.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-3 text-sm text-warn",
												children: coach.error
											}) : null,
											coach && coach.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 grid gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
													className: "grid gap-2",
													children: coach.bullets.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
														className: "rounded-control bg-bg/40 p-3 text-sm",
														children: line
													}, line))
												}), coach.cautions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs leading-relaxed text-muted",
													children: coach.cautions.join(" ")
												}) : null]
											}) : null
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "letter",
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
										title: "Draft note",
										hint: "Built from the overlap only. Edit the voice before you send it.",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "max-w-prose text-sm leading-relaxed",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: report.letter.greeting }), report.letter.paragraphs.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-3",
												children: paragraph
											}, paragraph))]
										}), coach && coach.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 border-t border-line pt-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs tracking-wide text-muted uppercase",
												children: "Grok draft"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 max-w-prose text-sm leading-relaxed whitespace-pre-wrap",
												children: coach.letter
											})]
										}) : null]
									})
								})
							]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "no-print mt-10 text-xs leading-relaxed text-subtle",
						children: "Files are read in the browser and are not stored on a server. History lives in this browser until you clear it. The live rewrite is the only step that leaves the device, and only when you ask."
					})
				]
			})
		]
	});
}
function Ghost({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/60 px-3 text-sm text-fg",
		children
	});
}
function WeightSlider({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mb-1 flex justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums text-muted",
				children: value
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 10,
			max: 80,
			value,
			onChange: (event) => onChange(Number(event.target.value))
		})]
	});
}
function Meter({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm tabular-nums text-muted",
				children: value
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 overflow-hidden rounded-full bg-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full bg-accent",
				style: { width: `${value}%` }
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: hint
		})
	] });
}
function Panel({ title, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass rounded-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: title
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-3 text-xs leading-relaxed text-muted",
				children: hint
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-3" }),
			children
		]
	});
}
function SkillGroups({ skills, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3",
		children: skills.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-xs tracking-wide text-subtle uppercase",
			children: group.category
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: group.skills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("rounded-full border px-2.5 py-1 text-xs", tone === "hit" ? "border-line text-good" : "border-line text-warn"),
				children: skill.label
			}, skill.id))
		})] }, group.category))
	});
}
function ChipRow({ items, empty }) {
	if (!items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-full border border-line px-2.5 py-1 text-xs text-fg",
			children: item
		}, item))
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-control bg-bg/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 text-sm",
			children: value
		})]
	});
}
function firstLine(text) {
	return (text.split("\n").map((part) => part.trim()).find(Boolean) ?? "Untitled resume").slice(0, 72);
}
function titleCase(value) {
	return value.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}
function sameWeights(a, b) {
	return a.skills === b.skills && a.role === b.role && a.experience === b.experience;
}
function toMarkdown(report) {
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
		...report.letter.paragraphs
	].join("\n");
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };

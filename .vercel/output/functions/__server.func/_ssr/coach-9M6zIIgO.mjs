import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, t as array } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coach-9M6zIIgO.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var coachWithGrok_createServerFn_handler = createServerRpc({
	id: "68fbf70e2302717b37e8c0b1cacfac63e89cbfa65b19267926e23b9ab22e712f",
	name: "coachWithGrok",
	filename: "src/lib/analyzer/coach.ts"
}, (opts) => coachWithGrok.__executeServer(opts));
var coachWithGrok = createServerFn({ method: "POST" }).validator((input) => {
	const parsed = inputSchema.safeParse(input);
	if (!parsed.success) throw new Error("Add a bit more resume and posting text before asking for a rewrite.");
	return parsed.data;
}).handler(coachWithGrok_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Live rewrite isn't available right now. The on-device notes still work."
	};
	const prompt = [
		"You tailor resumes. Use ONLY facts present in the resume text.",
		"Never invent employers, titles, dates, degrees, or metrics.",
		"If a number is missing, write [metric] as a placeholder.",
		"Missing skills may be mentioned only as optional study notes, not as claimed experience.",
		`Target role: ${data.role}`,
		`Missing skills: ${data.missing.join(", ") || "none"}`,
		"",
		"RESUME:",
		data.resume,
		"",
		"JOB:",
		data.job,
		"",
		"Return JSON only: {\"bullets\": string[4], \"letter\": string, \"cautions\": string[2]}",
		"bullets are rewritten resume lines. letter is under 130 words, no subject line."
	].join("\n");
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .3,
				max_tokens: 700,
				messages: [{
					role: "system",
					content: "You return compact JSON and refuse to fabricate career facts."
				}, {
					role: "user",
					content: prompt
				}]
			})
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => "");
			if (res.status === 403 || /spending-limit|credits/i.test(detail)) return {
				ok: false,
				error: "Live rewrite is paused because the AI quota is used up. The on-device notes still work."
			};
			return {
				ok: false,
				error: "The rewrite didn't go through. Try again once."
			};
		}
		const parsed = parseCoach((await res.json()).choices?.[0]?.message?.content?.trim() ?? "");
		if (!parsed) return {
			ok: false,
			error: "The rewrite came back in an unexpected shape. Try again."
		};
		return {
			ok: true,
			...parsed
		};
	} catch {
		return {
			ok: false,
			error: "The rewrite request didn't finish. Your on-device score is unchanged."
		};
	}
});
function parseCoach(raw) {
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		const json = JSON.parse(raw.slice(start, end + 1));
		const bullets = Array.isArray(json.bullets) ? json.bullets.filter((item) => typeof item === "string").slice(0, 4) : [];
		const letter = typeof json.letter === "string" ? json.letter.trim() : "";
		const cautions = Array.isArray(json.cautions) ? json.cautions.filter((item) => typeof item === "string").slice(0, 3) : [];
		if (!bullets.length || !letter) return null;
		return {
			bullets,
			letter,
			cautions
		};
	} catch {
		return null;
	}
}
//#endregion
export { coachWithGrok_createServerFn_handler };

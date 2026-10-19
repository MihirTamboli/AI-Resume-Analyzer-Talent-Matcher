export async function readResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Keep files under 8 MB.");
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return (await file.text()).trim();
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    const joined = (Array.isArray(text) ? text.join("\n") : String(text ?? "")).trim();
    if (joined.length < 40) {
      throw new Error("This PDF has almost no text. If it is a scan, paste the resume instead.");
    }
    return joined;
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    const value = result.value.trim();
    if (value.length < 40) throw new Error("That document didn't contain enough text.");
    return value;
  }
  throw new Error("Use a PDF, DOCX, or TXT file — or paste the text.");
}

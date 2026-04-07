// Gemini API client (BYOK, browser-side)
// Uses Google Generative Language API v1beta — gemini-2.5-* series (GA in 2026)

const GeminiClient = {
  async chat({ apiKey, model, systemInstruction, history, userMessage }) {
    if (!apiKey) throw new Error("缺少 API Key，請至右上角設定");
    if (!model) model = "gemini-2.5-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    // Build contents array (Gemini multi-turn format)
    const contents = [];
    for (const turn of history) {
      contents.push({
        role: turn.role === "ai" ? "model" : "user",
        parts: [{ text: turn.text }]
      });
    }
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const body = {
      contents,
      systemInstruction: systemInstruction
        ? { parts: [{ text: systemInstruction }] }
        : undefined,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API 錯誤 (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    if (!text) throw new Error("AI 回覆為空，可能是內容被過濾或模型異常");
    return text;
  }
};

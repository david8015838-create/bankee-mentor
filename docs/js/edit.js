// Bankee Mentor — edit page logic
(async function () {
  const $ = (id) => document.getElementById(id);

  // ── Load config + knowledge ─────────────────────────────────────────────
  let config, knowledge;
  try {
    config = await (await fetch("data/config.json")).json();
    knowledge = await (await fetch("data/knowledge.json")).json();
  } catch (e) {
    alert("無法載入：" + e.message);
    return;
  }

  // ── SHA-256 helper ──────────────────────────────────────────────────────
  async function sha256Hex(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // ── Login ───────────────────────────────────────────────────────────────
  const SESSION_KEY = "bankee_edit_session_v1";
  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "ok"; }
  function setLoggedIn() { sessionStorage.setItem(SESSION_KEY, "ok"); }
  function logout() { sessionStorage.removeItem(SESSION_KEY); location.reload(); }

  async function tryLogin(pw) {
    const hash = await sha256Hex(pw);
    return hash === config.edit_password_sha256;
  }

  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = $("password-input").value;
    if (await tryLogin(pw)) {
      setLoggedIn();
      showEditor();
    } else {
      $("login-error").classList.remove("hidden");
    }
  });

  // ── Editor ──────────────────────────────────────────────────────────────
  let selectedId = null;

  function showEditor() {
    $("login-section").classList.add("hidden");
    $("editor-section").classList.remove("hidden");
    renderDocList();
  }

  function renderDocList() {
    const ul = $("doc-list-ul");
    ul.innerHTML = "";
    knowledge.documents.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = `[${doc.id}] ${doc.title}`;
      if (doc.id === selectedId) li.classList.add("active");
      li.onclick = () => selectDoc(doc.id);
      ul.appendChild(li);
    });
  }

  function selectDoc(id) {
    selectedId = id;
    const doc = knowledge.documents.find(d => d.id === id);
    if (!doc) return;
    $("no-selection").classList.add("hidden");
    $("doc-form").classList.remove("hidden");
    $("doc-id").value = doc.id;
    $("doc-title").value = doc.title;
    $("doc-domain").value = doc.domain;
    $("doc-version").value = doc.version;
    $("doc-data-as-of").value = doc.data_as_of;
    $("doc-sources").value = (doc.sources || []).join("\n");
    $("doc-content").value = doc.content;
    renderDocList();
  }

  $("doc-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const idx = knowledge.documents.findIndex(d => d.id === selectedId);
    if (idx < 0) return;
    knowledge.documents[idx] = {
      id: $("doc-id").value.trim(),
      title: $("doc-title").value.trim(),
      domain: $("doc-domain").value.trim(),
      version: $("doc-version").value.trim(),
      data_as_of: $("doc-data-as-of").value,
      sources: $("doc-sources").value.split("\n").map(s => s.trim()).filter(Boolean),
      content: $("doc-content").value
    };
    selectedId = knowledge.documents[idx].id;
    knowledge.generated_at = new Date().toISOString().slice(0, 10);
    renderDocList();
    alert("✅ 已儲存到記憶體。記得點「匯出 knowledge.json」下載並上傳到 GitHub。");
  });

  $("delete-doc-btn").onclick = () => {
    if (!confirm("確定刪除這份文件？")) return;
    knowledge.documents = knowledge.documents.filter(d => d.id !== selectedId);
    selectedId = null;
    $("doc-form").classList.add("hidden");
    $("no-selection").classList.remove("hidden");
    renderDocList();
  };

  $("add-doc-btn").onclick = () => {
    const newId = "NEW-" + Date.now();
    knowledge.documents.push({
      id: newId,
      title: "新文件",
      domain: "knowledge/products",
      version: "0.5",
      data_as_of: new Date().toISOString().slice(0, 10),
      sources: [],
      content: "## 標題\n\n內容..."
    });
    selectDoc(newId);
  };

  // ── GitHub direct commit ────────────────────────────────────────────────
  const GH_TOKEN_KEY = "bankee_gh_token_v1";
  const getToken = () => localStorage.getItem(GH_TOKEN_KEY) || "";
  const setToken = (t) => localStorage.setItem(GH_TOKEN_KEY, t);
  const clearToken = () => localStorage.removeItem(GH_TOKEN_KEY);

  // UTF-8 safe base64 encoder
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin);
  }

  $("github-settings-btn").onclick = () => {
    $("gh-token-input").value = getToken();
    $("gh-modal").classList.remove("hidden");
  };
  $("gh-modal-close").onclick = () => $("gh-modal").classList.add("hidden");
  $("gh-token-save").onclick = () => {
    const t = $("gh-token-input").value.trim();
    if (!t) return alert("請貼上 token");
    setToken(t);
    $("gh-modal").classList.add("hidden");
    alert("✅ Token 已儲存");
  };
  $("gh-token-clear").onclick = () => {
    if (confirm("確定清除 token？")) {
      clearToken();
      $("gh-token-input").value = "";
      alert("已清除");
    }
  };

  $("commit-btn").onclick = async () => {
    const token = getToken();
    if (!token) {
      alert("請先設定 GitHub Token（按右上的 🔑 GitHub Token）");
      return;
    }
    const gh = config.github;
    if (!gh || !gh.owner || !gh.repo) {
      alert("config.json 缺少 github 設定");
      return;
    }

    const message = prompt("commit 訊息：", `更新知識庫 (${new Date().toISOString().slice(0,10)})`);
    if (!message) return;

    const btn = $("commit-btn");
    btn.disabled = true;
    btn.textContent = "上傳中…";

    try {
      const apiBase = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/${gh.knowledge_path}`;
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      };

      // 1. Get current file SHA
      const getRes = await fetch(`${apiBase}?ref=${gh.branch}`, { headers });
      if (!getRes.ok) throw new Error(`取得檔案失敗 (${getRes.status}): ${await getRes.text()}`);
      const fileInfo = await getRes.json();

      // 2. PUT new content
      knowledge.generated_at = new Date().toISOString().slice(0, 10);
      const newContent = JSON.stringify(knowledge, null, 2);

      const putRes = await fetch(apiBase, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          content: utf8ToBase64(newContent),
          sha: fileInfo.sha,
          branch: gh.branch
        })
      });
      if (!putRes.ok) throw new Error(`commit 失敗 (${putRes.status}): ${await putRes.text()}`);
      const result = await putRes.json();
      alert(`✅ 已 commit！\n\nCommit: ${result.commit.sha.slice(0,7)}\n\nGitHub Pages 約 1–2 分鐘後會自動更新網站。`);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "💾 儲存到 GitHub";
    }
  };

  $("export-btn").onclick = () => {
    const blob = new Blob([JSON.stringify(knowledge, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knowledge.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── AI 口語編輯 ─────────────────────────────────────────────────────────
  const SETTINGS_KEY_CHAT = "bankee_mentor_settings_v1";
  function getChatSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY_CHAT)) || {}; } catch { return {}; }
  }

  $("ai-apply-btn").onclick = async () => {
    if (!selectedId) return alert("請先選一份文件");
    const instruction = $("ai-instruction").value.trim();
    if (!instruction) return alert("請描述要修改什麼");

    const chatSettings = getChatSettings();
    if (!chatSettings.apiKey) {
      alert("請先到問答頁右上角設定 Gemini API Key");
      return;
    }

    // Snapshot current form state (使用者可能在編輯但還沒儲存)
    const currentDoc = {
      id: $("doc-id").value.trim(),
      title: $("doc-title").value.trim(),
      domain: $("doc-domain").value.trim(),
      version: $("doc-version").value.trim(),
      data_as_of: $("doc-data-as-of").value,
      sources: $("doc-sources").value.split("\n").map(s => s.trim()).filter(Boolean),
      content: $("doc-content").value
    };

    const btn = $("ai-apply-btn");
    btn.disabled = true;
    btn.textContent = "AI 修改中…";

    try {
      const systemPrompt = `你是文件編輯助理。使用者會給你一份 JSON 格式的知識庫文件，以及一段口語的修改指令。
你的任務是依照指令修改文件，並**只回傳完整的修改後 JSON**，不要包含任何說明文字、不要用 markdown code fence。

規則：
1. 嚴格保持 JSON 結構：必須含 id, title, domain, version, data_as_of, sources, content 七個欄位
2. 不修改 id（除非使用者明確要求）
3. content 為 markdown 字串，使用 \\n 換行
4. 若使用者要求新增/修改內容，請保持原有風格與格式
5. 若使用者要求改數字、改文字、加段落，只動需要動的部分
6. data_as_of 若內容有更新，也請更新為今天日期 ${new Date().toISOString().slice(0,10)}
7. 回傳必須是合法 JSON，可被 JSON.parse 解析`;

      const userMsg = `當前文件：
\`\`\`json
${JSON.stringify(currentDoc, null, 2)}
\`\`\`

修改指令：
${instruction}

請回傳修改後的完整 JSON。`;

      const reply = await GeminiClient.chat({
        apiKey: chatSettings.apiKey,
        model: chatSettings.model || "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        history: [],
        userMessage: userMsg
      });

      // Parse JSON (strip possible code fence)
      let cleaned = reply.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
      let updated;
      try {
        updated = JSON.parse(cleaned);
      } catch (e) {
        throw new Error("AI 回傳格式無法解析。原始回覆：\n\n" + reply.slice(0, 500));
      }

      // Validate required fields
      const required = ["id", "title", "domain", "version", "data_as_of", "content"];
      for (const f of required) {
        if (!(f in updated)) throw new Error(`AI 回傳缺少欄位：${f}`);
      }

      // Fill form (不直接存進 knowledge，讓使用者按「儲存變更」確認)
      $("doc-id").value = updated.id;
      $("doc-title").value = updated.title;
      $("doc-domain").value = updated.domain;
      $("doc-version").value = updated.version;
      $("doc-data-as-of").value = updated.data_as_of;
      $("doc-sources").value = (updated.sources || []).join("\n");
      $("doc-content").value = updated.content;
      $("ai-instruction").value = "";
      alert("✨ AI 已修改完成。請檢查內容後按「儲存變更」確認，再按「💾 儲存到 GitHub」上傳。");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "🪄 讓 AI 修改";
    }
  };

  $("logout-btn").onclick = logout;

  // Auto-resume session
  if (isLoggedIn()) showEditor();
})();

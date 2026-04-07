// Bankee Mentor — chat page logic
(async function () {
  const $ = (id) => document.getElementById(id);

  // ── Load config + knowledge base ────────────────────────────────────────
  let config, knowledge;
  try {
    config = await (await fetch("data/config.json")).json();
    knowledge = await (await fetch("data/knowledge.json")).json();
  } catch (e) {
    alert("無法載入知識庫或設定檔：" + e.message);
    return;
  }

  $("data-as-of").textContent = `📅 知識庫資料時效：${knowledge.data_as_of}　|　${knowledge.notice}`;

  // ── Settings (localStorage) ─────────────────────────────────────────────
  const SETTINGS_KEY = "bankee_mentor_settings_v1";
  function loadSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
  }
  function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

  let settings = loadSettings();
  if (!settings.provider) settings.provider = config.default_provider;
  if (!settings.model) settings.model = config.providers[settings.provider].default_model;

  // ── Settings modal ──────────────────────────────────────────────────────
  const providerSelect = $("provider-select");
  const modelSelect = $("model-select");
  const apikeyInput = $("apikey-input");
  const apikeyHint = $("apikey-hint");

  Object.entries(config.providers).forEach(([key, p]) => {
    const opt = document.createElement("option");
    opt.value = key; opt.textContent = p.label;
    providerSelect.appendChild(opt);
  });

  function refreshModelSelect() {
    const provider = config.providers[providerSelect.value];
    modelSelect.innerHTML = "";
    provider.available_models.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m; opt.textContent = m;
      modelSelect.appendChild(opt);
    });
    modelSelect.value = settings.model && provider.available_models.includes(settings.model)
      ? settings.model
      : provider.default_model;
    apikeyHint.innerHTML = `📖 申請 API Key：<a href="${provider.docs}" target="_blank">${provider.docs}</a>`;
  }

  function openSettings() {
    providerSelect.value = settings.provider;
    refreshModelSelect();
    apikeyInput.value = settings.apiKey || "";
    $("settings-modal").classList.remove("hidden");
  }
  function closeSettings() { $("settings-modal").classList.add("hidden"); }

  $("settings-btn").onclick = openSettings;
  $("settings-close").onclick = closeSettings;
  providerSelect.onchange = refreshModelSelect;
  $("settings-save").onclick = () => {
    settings = {
      provider: providerSelect.value,
      model: modelSelect.value,
      apiKey: apikeyInput.value.trim()
    };
    saveSettings(settings);
    closeSettings();
    addMessage("ai", "✅ 設定已儲存。可以開始問問題囉！");
  };

  // 初次使用提示
  if (!settings.apiKey) {
    setTimeout(openSettings, 500);
  }

  // ── Chat ────────────────────────────────────────────────────────────────
  const messagesEl = $("messages");
  const history = []; // {role: 'user'|'ai', text}

  function addMessage(role, text, sources) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = text;
    if (sources && sources.length) {
      const s = document.createElement("div");
      s.className = "sources";
      s.innerHTML = "📎 引用：" + sources.map(x => `<code>${x}</code>`).join("、");
      div.appendChild(s);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function buildSystemPrompt() {
    const docsText = knowledge.documents.map(d =>
      `### [${d.id}] ${d.title}\n領域：${d.domain}　版本：${d.version}　資料時效：${d.data_as_of}\n${d.content}\n`
    ).join("\n---\n");

    return `你是 Bankee 部門的「新人 mentor」AI 助理。你的角色是親切的學長姐，幫助新進職員了解工作流程與專業知識。

## 嚴格規則
1. **只根據以下知識庫回答**。找不到答案時，誠實說「目前知識庫沒有這個資訊，建議詢問你的直屬主管或撥打 Bankee 客服 0800-261-732」，**不要編造**。
2. **每個回答都要附引用來源**，格式為：「（引用：[文件 ID] 文件標題）」。
3. 涉及客戶個資、授信決策、法遵申報等敏感主題時，回答「此類問題請洽法遵 / 業務窗口，本助手不提供正式判斷」。
4. 用**繁體中文**回答，語氣專業但親切，像學長姐。
5. 步驟性內容用編號列表，方便對照執行。
6. 提到具體數字（利率、額度、費用）時，要附上資料時效（${knowledge.data_as_of}）並提醒「請以 Bankee 官網即時公告為準」。

## 知識庫（資料時效：${knowledge.data_as_of}）

${docsText}
`;
  }

  $("chat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = $("input");
    const text = input.value.trim();
    if (!text) return;

    if (!settings.apiKey) {
      addMessage("error", "請先到右上角「⚙ 設定」填入 API Key");
      openSettings();
      return;
    }

    addMessage("user", text);
    input.value = "";
    const sendBtn = $("send-btn");
    sendBtn.disabled = true;
    sendBtn.textContent = "思考中…";
    const thinking = addMessage("ai", "⏳ 思考中…");

    try {
      const reply = await GeminiClient.chat({
        apiKey: settings.apiKey,
        model: settings.model,
        systemInstruction: buildSystemPrompt(),
        history,
        userMessage: text
      });
      thinking.remove();
      addMessage("ai", reply);
      history.push({ role: "user", text });
      history.push({ role: "ai", text: reply });
    } catch (err) {
      thinking.remove();
      addMessage("error", "❌ " + err.message);
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "送出";
    }
  });
})();

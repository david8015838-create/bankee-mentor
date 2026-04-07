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

  $("export-btn").onclick = () => {
    const blob = new Blob([JSON.stringify(knowledge, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knowledge.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  $("logout-btn").onclick = logout;

  // Auto-resume session
  if (isLoggedIn()) showEditor();
})();

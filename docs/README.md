# Bankee 新人 Mentor — Web App

純靜態網頁，可直接部署到 GitHub Pages。

## 結構

```
docs/
├── index.html         ← 新人 mentor 對話頁
├── edit.html          ← 知識庫編輯頁（需密碼）
├── css/styles.css
├── js/
│   ├── gemini.js      ← Gemini API client
│   ├── app.js         ← 對話頁邏輯
│   └── edit.js        ← 編輯頁邏輯
└── data/
    ├── knowledge.json ← 知識庫（編輯頁會修改這份）
    └── config.json    ← 設定（密碼 hash、預設模型）
```

## 部署到 GitHub Pages

1. 把整個 `bankee-knowledge` 資料夾推到 GitHub repo（任意 repo 名）
2. 進入 GitHub repo 的 **Settings → Pages**
3. **Source** 選 `Deploy from a branch`
4. **Branch** 選 `main`，資料夾選 `/docs`
5. 儲存 → 等 1–2 分鐘
6. GitHub 會給你網址：`https://<你的帳號>.github.io/<repo名>/`

## 使用者第一次進入

1. 打開首頁，會自動跳出設定 modal
2. 點「📖 申請 API Key」連結 → 到 Google AI Studio 申請免費 Gemini API Key
3. 貼回設定 → 儲存
4. 開始問問題

API Key 存在使用者瀏覽器的 localStorage，**不會傳到任何伺服器**。

## 修改編輯密碼

預設密碼是 `changeme`，**務必修改**！

1. 用以下 Python（或任何工具）算 SHA-256：
   ```bash
   echo -n "你的新密碼" | shasum -a 256
   ```
   或在瀏覽器 console：
   ```js
   crypto.subtle.digest("SHA-256", new TextEncoder().encode("你的新密碼"))
     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("")));
   ```
2. 把 hash 貼到 `docs/data/config.json` 的 `edit_password_sha256` 欄位
3. commit + push

> ⚠️ **安全聲明**：因為是純靜態網站，密碼 hash 會被任何訪客下載到瀏覽器。
> 這個密碼只是「防止隨手亂改」，**不是真正的安全防護**。
> 真正的編輯保護應該透過 Git 權限控制（只有 repo collaborators 能 push）。

## 編輯知識庫的工作流

GitHub Pages 是純靜態，網頁無法直接寫入檔案。所以編輯流程是：

1. 進入 `edit.html`，輸入密碼登入
2. 編輯文件 → 儲存到記憶體
3. 點「⬇ 匯出 knowledge.json」下載新檔
4. 把下載的檔案取代 `docs/data/knowledge.json`
5. commit + push → GitHub Pages 自動更新

## 預設 AI 設定

- **預設服務商**：Google Gemini
- **預設模型**：`gemini-2.5-flash`（2026 GA 版本，速度快、免費額度友善）
- **可選模型**：`gemini-2.5-flash`、`gemini-2.5-pro`、`gemini-2.5-flash-lite`
- **API Key 申請**：https://ai.google.dev/gemini-api/docs

未來若要支援 Claude / OpenAI，只要在 `data/config.json` 的 `providers` 加新項目，並在 `js/` 加對應的 client 即可。

## 安全須知

- ✅ API Key 只存在使用者自己的瀏覽器（localStorage）
- ✅ 對話內容直接從瀏覽器送到 Google API，不經過任何中間伺服器
- ⚠️ 編輯密碼為前端驗證，僅防誤觸；真正權限控管請靠 Git
- ⚠️ 知識庫內容會被打包進 system prompt，**絕對不要放任何客戶 PII**

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

有兩種方式：

### 方法 A：直接 commit（推薦，需 GitHub Token）

#### 申請 fine-grained token（只能動本 repo，不會碰到其他 repo）

1. 進入 https://github.com/settings/tokens?type=beta
2. 點 **Generate new token**
3. 填寫：
   - **Token name**：`bankee-mentor-editor`
   - **Expiration**：建議 90 天
   - **Repository access** → 選 **Only select repositories** → 只勾 `bankee-mentor`
   - **Permissions** → **Repository permissions** → 找到 **Contents** → 設為 **Read and write**
   - 其他權限全部維持 **No access**
4. 點最下方 **Generate token** → 複製 `github_pat_...`

這個 token 的能力只有：
- ✅ 讀寫 `bankee-mentor` 的檔案
- ❌ 無法存取你任何其他 repo
- ❌ 無法改設定、刪 repo、管理協作者、動 issues / PRs / Actions

#### 使用

1. 進入 `edit.html` → 輸入密碼登入
2. 按右上「🔑 GitHub Token」貼上 token
3. 編輯文件 → 按「儲存變更」
4. 按「💾 儲存到 GitHub」→ 自動 commit
5. 等 1–2 分鐘 GitHub Pages 自動更新

> ⚠️ Token 存在瀏覽器 localStorage。即便範圍受限，仍建議：
> - 設定到期日（90 天）並定期更換
> - 多位編輯者請各自申請自己的 token，**不要共用**
> - 共用電腦使用後記得進編輯頁按 🔑 → 「清除」

### 方法 B：手動下載上傳

1. 編輯後按「⬇ 匯出 JSON」下載
2. 取代 repo 中的 `docs/data/knowledge.json`
3. commit + push

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

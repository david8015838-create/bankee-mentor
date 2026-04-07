# Bankee 新人 Mentor 知識庫

把腦中、對話中、文件中散落的工作流程與專業知識，逐步整理成結構化內容，
最終供「新人 mentor AI」使用 — 當新進職員不清楚流程或專業知識時，可以隨時問它。

**定位**：被動問答型 mentor。新人問才答，每次對話獨立（不記憶個人）。
**內容範圍**：各項工作 SOP + 銀行專業知識。不含文化眉角、人際地圖、心態建議。
**語氣目標**：像親切的學長姐，而非冷冰冰的查詢機。

---

## 怎麼用（給未來的自己）

### 1. 開始一個新的整理 session

打開 Claude Code，進入這個資料夾，跟 Claude 說：

> 繼續整理 bankee 知識庫

Claude 會讀 `_index.md` 接上脈絡。

### 2. 丟素材

想到什麼就丟，不用組織完整。形式不拘：

- 「我想到開戶要先看身分證，然後好像要建客戶代號⋯後面忘了」
- 貼一段 LINE 或 Email 對話
- 貼 PDF / Word 內容
- 「補充昨天說的：原來第二步是先建 CIF」

只要開頭簡單說一句「**這是關於 XX 的**」，剩下交給 Claude。

### 3. Claude 會自動做的事

- 判斷主題 → 找到（或建立）對應 `_drafts/[主題]/` 資料夾
- 把原始內容追加到 `fragments.md`（永不刪除）
- 標註信心度（高/中/低）與 Claude 的解讀
- 更新 `open_questions.md`（缺口清單）
- 更新 `_index.md`（總索引）
- 主動問你 1–3 個關鍵問題（不會一次轟炸）

### 4. 想看某個主題的進度

直接問 Claude：
> 開戶流程目前累積了什麼？

或用 Finder 打開 `_drafts/[主題]/` 資料夾看 markdown。

### 5. 整理成 SOP 草稿

當某主題碎片夠多，跟 Claude 說：
> 幫我把開戶流程整理成 draft

Claude 會產出 `draft.md`（v0.5），明確標示：
- ✅ 已確認（多來源佐證）
- (?) 需要確認（單一來源或邏輯跳躍）
- (缺) 完全沒資料的欄位

### 6. 找主管 review

跟 Claude 說：
> 產出開戶流程的 review request

Claude 會給你 `_review_request.md`：一份**只列待確認問題**的清單。
你拿去問主管 → 把回應丟回來 → Claude 升 v1.0 → 移到 `sops/`。

---

## 資料夾結構

```
bankee-knowledge/
├── README.md                  ← 你正在看的這份
├── _index.md                  ← 所有主題索引（自動維護）
├── _templates/
│   └── sop-template.md
├── _drafts/                   ← 還在累積中的主題
│   └── [主題名]/
│       ├── fragments.md       ← 原始碎片（append-only）
│       ├── open_questions.md  ← 缺口與待確認
│       ├── draft.md           ← 整理後的 SOP 草稿
│       └── _review_request.md ← 給主管看的問題清單
├── sops/                      ← 已 review 的正式版 (v1.0+)
│   ├── onboarding/
│   ├── account-opening/
│   ├── daily-ops/
│   └── faq/
└── _meta/
    └── change_log.md          ← 版本變更紀錄
```

---

## 鐵則

1. **不編造**：Claude 絕不為了「看起來完整」填空。缺資訊就標 `(缺)`。
2. **不刪碎片**：原始素材永遠保留在 `fragments.md`，修正用新碎片覆蓋。
3. **信心度透明**：每個碎片標 高/中/低，draft 中對應顯示 ✅ 或 `(?)`。
4. **主管才能升正式版**：v0.5 是草稿，v1.0 必須經人工 review。
5. **不放客戶資料**：知識庫只放流程，絕不放任何客戶 PII。

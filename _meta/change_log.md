# 變更紀錄

記錄所有主題的版本變更。

格式：
```
## YYYY-MM-DD — [主題] vX.Y → vX.Z
- 變更內容
- 原因
```

---

## 2026-04-07 — 知識庫初始化
- 建立資料夾骨架、模板、索引
- 啟用 git 版本控管

## 2026-04-07 — 首批 Bankee 公開資料填入（v0.5-draft）
- 新增 `sops/knowledge/products/001-台幣活存利率.md`
- 新增 `sops/knowledge/products/002-社群圈推薦機制.md`
- 新增 `sops/knowledge/products/003-跨行手續費優惠.md`
- 新增 `sops/knowledge/products/004-Bankee信用卡.md`
- 新增 `sops/knowledge/products/005-外幣與換匯.md`
- 新增 `sops/account-opening/001-個人開戶資格與流程.md`
- 新增 `sops/faq/001-客服與聯絡方式.md`
- **資料來源**：Bankee 官網（部分因 SSL 問題無法直接抓取）+ 第三方媒體交叉比對
- **狀態**：所有檔案皆為 v0.5-draft，明確標註資料時效（data_as_of: 2026-04-07）
- **已知矛盾**：跨行免手續費次數（5 vs 6 次）；待人工核對升 v1.0

## 2026-04-07 — 清理不確定內容
- 移除所有 (?) / (缺) / 待確認項目
- 跨行免手續費次數確認為 **6 次**（提款 6 次 + 轉帳 6 次）
- `003-跨行手續費優惠.md` 升 v1.0（使用者確認）
- 其他檔案保持 v0.5（內容已清理但仍待 owner 指派與正式 review）

## 2026-04-08 — 匯入芳瑜交接文件（數位通路 + 電支 + 內部流程）
從「交接.docx」與「交接.pptx」拆解出 12 份新文件：

### 數位通路夥伴 (sops/partnerships/)
- partner-cardu.md — 卡優新聞網（含 CDP 簡訊發送、季度回饋日程）
- partner-money101.md — Money101
- partner-syncace.md — 新愛世科技 / Alphaloan / Fincake
- partner-smartdaily.md — 智生活（含 888 任務金抽獎流程）
- partner-fetc-utaggo.md — ETC + UTagGO（共用窗口）
- partner-happygo.md — HAPPY GO

### 電子支付夥伴
- epayment-ipass.md — iPASS MONEY（含活動一 350 元 + 活動二 888 抽獎完整時程）
- epayment-others.md — 悠遊付 / 全支付 / LINE PAY

### 內部作業流程 (sops/daily-ops/)
- 數存請款流程.md
- 貸款請款流程.md（含 agg1~agg19 貸款代碼對照）
- 週報主管會議更新流程.md（含 KPI 月年目標）
- 投資網頁專案.md

### 處理原則
- 所有聯絡人標 contact_volatile: true，並加上「⚠️ 可能變動，使用前請再次確認」
- 每筆聯絡資料附取得日期 2026-04-08 與來源（芳瑜交接文件）
- frontmatter 加 keywords 欄位增加搜尋命中率（含中英文、人名、暱稱、需求單編號）
- knowledge.json 同步更新（共 19 份文件）

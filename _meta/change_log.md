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

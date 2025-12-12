# 🚀 部署指南

## 📋 檔案清單

確認你有以下檔案：
- ✅ index.html
- ✅ style.css
- ✅ script.js
- ✅ README.md
- ✅ DEBUG.md
- ✅ netlify.toml

## 🔐 部署前安全設定

### 重要！設定 API Key 限制

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 找到你的 API Key
3. 點擊「編輯」
4. 在「應用程式限制」選擇「HTTP 參照網址」
5. 新增允許的網址：
   ```
   https://你的網址.netlify.app/*
   https://你的網址.pages.dev/*
   localhost:*（用於本地測試）
   ```

## 🌐 部署方案

### 方案 1：Netlify（最簡單，推薦⭐）

#### 步驟 1：註冊 Netlify
1. 前往 [Netlify](https://www.netlify.com/)
2. 使用 GitHub/Google 帳號註冊（免費）

#### 步驟 2：拖放部署
1. 登入後，點擊「Add new site」→「Deploy manually」
2. 將整個專案資料夾拖放到網頁中
3. 等待部署完成（約 30 秒）
4. 完成！你會得到一個網址：`https://隨機名稱.netlify.app`

#### 步驟 3：自訂網域（可選）
1. 在 Site settings → Domain management
2. 點擊「Edit site name」
3. 改成你想要的名稱：`https://今天吃什麼.netlify.app`

### 方案 2：Vercel

#### 步驟 1：註冊 Vercel
1. 前往 [Vercel](https://vercel.com/)
2. 使用 GitHub 帳號註冊

#### 步驟 2：部署
1. 點擊「Add New」→「Project」
2. 選擇「Import Git Repository」或直接拖放
3. 點擊「Deploy」
4. 完成！網址：`https://專案名稱.vercel.app`

### 方案 3：GitHub Pages

#### 步驟 1：建立 GitHub Repository
1. 前往 [GitHub](https://github.com/)
2. 點擊「New repository」
3. 命名：`food-picker`
4. 勾選「Public」

#### 步驟 2：上傳檔案
```bash
# 在專案目錄執行
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的帳號/food-picker.git
git push -u origin main
```

#### 步驟 3：啟用 GitHub Pages
1. 前往 Repository → Settings → Pages
2. Source 選擇「main」分支
3. 點擊「Save」
4. 網址：`https://你的帳號.github.io/food-picker/`

### 方案 4：Cloudflare Pages

#### 步驟 1：註冊
1. 前往 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 註冊帳號

#### 步驟 2：部署
1. 點擊「Create a project」
2. 連接 GitHub 或直接上傳
3. 部署完成
4. 網址：`https://專案名稱.pages.dev`

## 🔧 部署後設定

### 1. 更新 API Key 限制
部署完成後，記得將你的網站網址加入 API Key 的 HTTP 參照網址限制中。

### 2. 測試功能
- ✅ 定位功能
- ✅ 手動輸入地點
- ✅ 搜尋餐廳
- ✅ 價位篩選
- ✅ 再抽一次

### 3. 檢查 Console
按 F12 開啟開發者工具，檢查是否有錯誤訊息。

## 📱 行動裝置測試

部署後記得在手機上測試：
- 響應式設計
- 定位權限
- 觸控操作

## 🔄 更新網站

### Netlify/Vercel
直接拖放新版本的檔案，會自動更新。

### GitHub Pages
```bash
git add .
git commit -m "更新描述"
git push
```

## 🎉 完成檢查清單

- [ ] API Key 已設定 HTTP 參照網址限制
- [ ] 網站已成功部署
- [ ] 定位功能正常運作
- [ ] 搜尋功能正常
- [ ] 手動輸入地點功能正常
- [ ] 在手機上測試過
- [ ] Console 沒有錯誤訊息

## 💡 常見問題

### Q: 部署後無法使用定位功能
A: 瀏覽器要求定位功能必須使用 HTTPS，確認你的網址是 https:// 開頭。

### Q: API Key 錯誤
A: 檢查 API Key 的 HTTP 參照網址限制是否包含你的網站網址。

### Q: 搜尋不到餐廳
A: 確認已啟用 Maps JavaScript API 和 Places API。

## 🌟 推薦設定

我個人推薦：
1. **Netlify** - 最簡單，拖放即可
2. 自訂網域名稱為有意義的名字
3. 設定 API Key 的 HTTP 參照網址限制

---

祝你部署順利！🎉

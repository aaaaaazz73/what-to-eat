# 🍽️ 今天吃什麼？- 智能美食選擇器

一個幫助使用者快速決定用餐地點的網頁小工具，解決「今天吃什麼」的選擇障礙問題。

## ✨ 核心功能

### 1. 自動定位
- 自動取得使用者目前位置
- 顯示目前位置座標
- 需要位置權限提示

### 2. 智能推薦
- 搜尋 1 公里內的餐廳
- 隨機挑選 2 個選項呈現給使用者
- 一鍵重新選擇（不滿意可以再抽）

### 3. 價位篩選
使用 Google Places API 的相對價位：
- **$ 銅板價** (price_level: 0-1) - 約 NT$ 0-150
- **$$ 小資族** (price_level: 2) - 約 NT$ 150-300
- **$$$ 好料的** (price_level: 3) - 約 NT$ 300-600
- **$$$$ 奢華饗宴** (price_level: 4) - 約 NT$ 600+
- 可複選多個價位範圍

### 4. 餐廳資訊顯示
每個推薦選項顯示：
- 餐廳名稱
- 評分（星級）與評論數量
- 距離（公尺）
- 價位等級
- Google Maps 導航按鈕

## 🚀 快速開始

### 步驟 1: 取得 Google Maps API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 **Maps JavaScript API** 和 **Places API**
4. 建立 API 金鑰（憑證）
5. 建議設定 API 金鑰限制（HTTP 參照網址限制）

### 步驟 2: 設定 API Key

開啟 `index.html` 檔案，找到以下這行：

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&language=zh-TW"></script>
```

將 `YOUR_API_KEY` 替換為你的實際 API 金鑰：

```html
<script src="https://maps.googleapis.com/maps/api/js?key=你的實際API金鑰&libraries=places&language=zh-TW"></script>
```

### 步驟 3: 啟動網頁

1. 使用本地伺服器開啟（推薦）：
   ```bash
   # 使用 Python
   python -m http.server 8000

   # 或使用 Node.js
   npx serve

   # 或使用 VS Code 的 Live Server 擴充功能
   ```

2. 在瀏覽器開啟 `http://localhost:8000`

3. 允許瀏覽器存取位置權限

## 📝 使用說明

1. **開啟網頁**：允許瀏覽器存取你的位置
2. **選擇預算**：勾選你想要的價位範圍
3. **開始選擇**：點擊「開始選擇」按鈕
4. **查看結果**：系統會隨機推薦 2 個餐廳
5. **重新選擇**：不滿意？點擊「再抽一次」
6. **導航前往**：點擊「Google Maps 導航」前往餐廳

## 🛠️ 技術架構

- **HTML5**: 語義化結構
- **CSS3**: 現代化樣式與動畫
- **JavaScript (ES6+)**: 核心邏輯
- **Google Maps JavaScript API**: 地圖服務
- **Google Places API**: 餐廳搜尋

## 📋 檔案結構

```
.
├── index.html      # 主頁面
├── style.css       # 樣式表
├── script.js       # 功能邏輯
└── README.md       # 說明文件
```

## ⚙️ 主要功能說明

### 定位功能
使用瀏覽器的 Geolocation API 取得使用者位置，需要使用者授權。

### 餐廳搜尋
使用 Google Places API 的 `nearbySearch` 方法，搜尋半徑 1000 公尺內的餐廳。

### 隨機演算法
從符合價位條件的餐廳中，使用 Fisher-Yates 洗牌演算法隨機選取 2 個選項。

### 距離計算
使用 Haversine 公式計算使用者位置與餐廳的實際距離。

## 🔒 隱私說明

- 位置資訊僅在瀏覽器中使用，不會上傳至任何伺服器
- 僅在使用者授權後才會取得位置
- 所有資料處理都在本地完成

## 💡 使用技巧

1. **擴大搜尋範圍**：如果找不到餐廳，可以修改 `script.js` 中的 `radius` 參數
2. **調整推薦數量**：修改 `chooseRandomRestaurants()` 函數中的數量
3. **自訂價位對應**：調整 `getPriceSymbols()` 函數的價位顯示

## 🐛 常見問題

### Q: 顯示「無法取得位置」
A: 請確認瀏覽器已允許位置存取權限，並使用 HTTPS 或 localhost。

### Q: 找不到任何餐廳
A: 可能該區域餐廳資料較少，請嘗試：
- 調整價位篩選範圍
- 確認 API 金鑰已正確設定
- 檢查 API 配額是否用盡

### Q: API 金鑰錯誤
A: 請確認：
- API 金鑰正確無誤
- 已啟用 Maps JavaScript API 和 Places API
- API 金鑰的限制設定正確

## 📜 授權

本專案僅供學習使用。

## 🙏 致謝

- Google Maps Platform
- Google Places API

---

**提示**：使用前請務必替換 API 金鑰，否則功能無法正常運作！

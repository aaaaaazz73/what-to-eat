# 🔍 除錯指南

如果搜尋功能無法正常運作，請按照以下步驟排查問題：

## 📋 快速檢查清單

### 1. 開啟瀏覽器開發者工具
- 按 `F12` 或 `Ctrl+Shift+I` (Windows/Linux)
- 或 `Cmd+Option+I` (Mac)
- 切換到 **Console** 標籤頁

### 2. 查看 Console 訊息

開啟網頁後，你應該會看到以下訊息：

✅ **正常情況：**
```
🚀 應用程式啟動
✅ Google Maps API 載入成功
📍 正在取得位置...
✅ 定位成功: {lat: XX.XXXX, lng: XX.XXXX}
🔍 預載入搜尋參數: ...
📡 預載入 API 回應狀態: OK
📋 原始搜尋結果: X 間餐廳
✅ 過濾後結果: X 間餐廳
✅ 預載入完成！找到 X 間餐廳
```

❌ **異常情況及解決方法：**

## 🚨 常見問題與解決方案

### 問題 1: Google Maps API 未載入
```
❌ Google Maps API 未載入，請檢查 API Key 是否正確設定
```

**解決方法：**
1. 開啟 `index.html`
2. 找到第 74 行左右的這段程式碼：
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&language=zh-TW"></script>
   ```
3. 將 `YOUR_API_KEY` 替換為你的實際 API 金鑰
4. 確認已在 Google Cloud Console 啟用：
   - Maps JavaScript API
   - Places API

### 問題 2: 位置權限被拒絕
```
❌ 使用者拒絕位置權限
```

**解決方法：**
1. 點擊瀏覽器網址列左側的鎖頭圖示
2. 找到「位置」權限
3. 選擇「允許」
4. 重新整理頁面

### 問題 3: API 請求被拒絕
```
❌ API 錯誤: REQUEST_DENIED
```

**可能原因：**
- API 金鑰錯誤
- API 金鑰的 HTTP 參照網址限制設定錯誤
- 未啟用必要的 API

**解決方法：**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 確認 API 金鑰有效
3. 檢查 API 限制設定
4. 確認已啟用 Maps JavaScript API 和 Places API

### 問題 4: API 配額用盡
```
❌ API 錯誤: OVER_QUERY_LIMIT
```

**解決方法：**
- 等待配額重置（通常是隔天）
- 或在 Google Cloud Console 增加配額

### 問題 5: 找不到餐廳
```
📋 找到 0 間餐廳（未過濾）
```

**可能原因：**
- 該區域可能沒有餐廳資料
- 網路連線問題

**解決方法：**
1. 確認網路連線正常
2. 嘗試在不同位置測試
3. 稍後再試

### 問題 6: 過濾後沒有餐廳
```
✅ 符合條件的餐廳: 0 間
💡 建議：勾選更多價位範圍
```

**解決方法：**
- 勾選更多價位範圍選項（例如：同時勾選銅板價、小資族、好料的）

## 🔧 進階除錯

### 測試 API 是否正常載入
在 Console 輸入：
```javascript
typeof google !== 'undefined' && typeof google.maps !== 'undefined'
```
應該返回 `true`

### 查看當前位置
在 Console 輸入：
```javascript
userLocation
```
應該顯示類似：`{lat: 25.0330, lng: 121.5654}`

### 查看搜尋結果
在 Console 輸入：
```javascript
allRestaurants
```
應該顯示餐廳陣列

### 查看快取狀態
在 Console 輸入：
```javascript
searchCache
```
可以查看快取的資料

## 📞 還是無法解決？

如果按照以上步驟仍無法解決問題，請：

1. **截圖 Console 的錯誤訊息**
2. **記錄完整的錯誤訊息**
3. **確認 API Key 已正確設定**

## 🎯 優化建議

### 提高搜尋成功率
目前程式已優化為：
- ✅ 搜尋半徑：2 公里（原本 1 公里）
- ✅ 沒有價位資訊的餐廳預設為銅板價
- ✅ 完整的錯誤訊息
- ✅ 自動快取機制（5 分鐘）
- ✅ 背景預載入
- ✅ 1 分鐘搜尋超時保護

### 如果找到的餐廳太少
可以在 `script.js` 中調整搜尋半徑：
```javascript
// 找到這一行並修改 radius 值
radius: 2000, // 改為 3000 或 5000
```

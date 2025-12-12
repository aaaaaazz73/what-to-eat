// 全域變數
let userLocation = null;
let allRestaurants = [];
let map = null;
let service = null;

// 快取相關
let searchCache = {
    data: null,
    timestamp: null,
    location: null,
    selectedPrices: null
};
const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘快取

// 搜尋狀態
let isSearching = false;
let searchCancelled = false;
let searchTimeoutId = null;
const SEARCH_TIMEOUT = 60 * 1000; // 1分鐘超時

// DOM 元素
const locationText = document.getElementById('locationText');
const chooseButton = document.getElementById('chooseButton');
const rerollButton = document.getElementById('rerollButton');
const resultsGrid = document.getElementById('resultsGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const manualButton = document.getElementById('manualButton');
const manualInputContainer = document.getElementById('manualInputContainer');
const manualLocationInput = document.getElementById('manualLocationInput');
const confirmLocationButton = document.getElementById('confirmLocationButton');
const cancelLocationButton = document.getElementById('cancelLocationButton');

// 追蹤事件監聽器是否已設定
let eventListenersSetup = false;

// Google Maps API 載入完成後的 callback（由 API 自動呼叫）
window.initApp = function() {
    console.log('🚀 應用程式啟動');
    console.log('✅ Google Maps API 載入成功');

    if (!eventListenersSetup) {
        setupEventListeners();
        eventListenersSetup = true;
    }
    getUserLocation();
};

// 頁面載入時先設定事件監聽器並禁用按鈕
document.addEventListener('DOMContentLoaded', () => {
    if (!eventListenersSetup) {
        setupEventListeners();
        eventListenersSetup = true;
    }
    // 禁用按鈕直到 Google Maps API 載入完成
    if (chooseButton) {
        chooseButton.disabled = true;
        chooseButton.style.opacity = '0.6';
        chooseButton.querySelector('span').textContent = '⏳ 載入中...';
    }

    // 設定 10 秒超時檢查：如果 Google Maps API 還沒載入，顯示錯誤
    setTimeout(() => {
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            console.error('❌ Google Maps API 載入超時');
            showError('Google Maps API 載入失敗，請檢查網路連線或重新整理頁面');
            locationText.textContent = 'API 載入失敗';
            if (chooseButton) {
                chooseButton.querySelector('span').textContent = '❌ 載入失敗';
            }
        }
    }, 10000); // 10 秒超時
});

// 設定事件監聽器
function setupEventListeners() {
    chooseButton.addEventListener('click', handleChooseButtonClick);
    rerollButton.addEventListener('click', chooseRandomRestaurants);

    // 監聽價位篩選變更
    const priceCheckboxes = document.querySelectorAll('.price-option input[type="checkbox"]');
    priceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // 價位改變時，顯示「開始選擇」按鈕，隱藏「再抽一次」按鈕
            if (resultsGrid.innerHTML !== '') {
                chooseButton.style.display = 'block';
                rerollButton.style.display = 'none';
            }
        });
    });

    // 手動輸入地點相關事件
    manualButton.addEventListener('click', showManualInput);
    confirmLocationButton.addEventListener('click', confirmManualLocation);
    cancelLocationButton.addEventListener('click', hideManualInput);
    manualLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmManualLocation();
        }
    });
}

// 處理「開始選擇」按鈕點擊
function handleChooseButtonClick() {
    if (isSearching) {
        // 如果正在搜尋，則取消搜尋
        cancelSearch();
    } else {
        // 否則開始搜尋
        searchAndChooseRestaurants();
    }
}

// 取消搜尋
function cancelSearch() {
    searchCancelled = true;
    isSearching = false;
    showLoading(false);
    updateChooseButton('開始選擇', false);
    chooseButton.style.display = 'block';

    // 清除超時計時器
    if (searchTimeoutId) {
        clearTimeout(searchTimeoutId);
        searchTimeoutId = null;
    }

    showError('已取消搜尋');
}

// 取得使用者位置
function getUserLocation() {
    if (!navigator.geolocation) {
        const errorMsg = '您的瀏覽器不支援定位功能';
        showError(errorMsg);
        console.error('❌ ' + errorMsg);
        return;
    }

    console.log('📍 正在取得位置...');
    locationText.textContent = '正在取得位置...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log('✅ 定位成功:', userLocation);
            locationText.textContent = `已定位：${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
            initializeGoogleMaps();
        },
        (error) => {
            let errorMsg = '無法取得位置';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '請允許位置存取權限或使用手動輸入';
                    console.error('❌ 使用者拒絕位置權限');
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '位置資訊無法取得，請使用手動輸入';
                    console.error('❌ 位置資訊不可用');
                    break;
                case error.TIMEOUT:
                    errorMsg = '定位請求逾時，請使用手動輸入';
                    console.error('❌ 定位請求逾時');
                    break;
            }
            showError(errorMsg);
            locationText.textContent = errorMsg;

            // 即使定位失敗，仍然啟用按鈕（用戶可以手動輸入地點）
            if (chooseButton && service) {
                chooseButton.disabled = false;
                chooseButton.style.opacity = '1';
                chooseButton.querySelector('span').textContent = '🎲 開始選擇';
            }
        }
    );
}

// 初始化 Google Maps
function initializeGoogleMaps() {
    // 創建一個隱藏的地圖元素來使用 Places API
    const mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);

    map = new google.maps.Map(mapDiv, {
        center: userLocation,
        zoom: 15
    });

    service = new google.maps.places.PlacesService(map);

    // 啟用「開始選擇」按鈕
    if (chooseButton) {
        chooseButton.disabled = false;
        chooseButton.style.opacity = '1';
        chooseButton.querySelector('span').textContent = '🎲 開始選擇';
    }

    // 預載入餐廳資料（使用預設的價位篩選）
    preloadRestaurants();
}

// 預載入餐廳資料
function preloadRestaurants() {
    const selectedPrices = getSelectedPrices();

    if (selectedPrices.length === 0) {
        return; // 如果沒有選擇價位，不預載入
    }

    console.log('預載入餐廳資料...');

    // 預載入也設定 1 分鐘超時
    let preloadTimeoutId = setTimeout(() => {
        console.log('預載入超時（1分鐘）');
    }, SEARCH_TIMEOUT);

    const request = {
        location: userLocation,
        radius: 2000, // 增加到 2 公里
        type: 'restaurant'
    };

    console.log('🔍 預載入搜尋參數:', request);

    service.nearbySearch(request, (results, status) => {
        // 清除超時計時器
        if (preloadTimeoutId) {
            clearTimeout(preloadTimeoutId);
            preloadTimeoutId = null;
        }

        console.log('📡 預載入 API 回應狀態:', status);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log(`📋 原始搜尋結果: ${results.length} 間餐廳`);

            // 放寬過濾條件：如果餐廳沒有價位資訊，也接受它
            const filteredRestaurants = results.filter(place => {
                const priceLevel = place.price_level !== undefined ? place.price_level : 0;
                return selectedPrices.includes(priceLevel);
            });

            console.log(`✅ 過濾後結果: ${filteredRestaurants.length} 間餐廳`);

            // 儲存到快取
            searchCache = {
                data: filteredRestaurants,
                timestamp: Date.now(),
                location: { ...userLocation },
                selectedPrices: [...selectedPrices]
            };

            console.log(`✅ 預載入完成！找到 ${filteredRestaurants.length} 間餐廳`);
        } else {
            console.error('❌ 預載入失敗:', status);
            console.error('可能原因：API Key 錯誤、配額用盡、或網路問題');
        }
    });
}

// 搜尋並選擇餐廳
function searchAndChooseRestaurants() {
    if (!userLocation) {
        showError('請先允許位置存取權限');
        return;
    }

    if (!service) {
        showError('Google Maps 尚未載入完成，請稍候再試');
        return;
    }

    hideError();
    resultsGrid.innerHTML = '';
    rerollButton.style.display = 'none';

    // 取得選中的價位範圍
    const selectedPrices = getSelectedPrices();

    if (selectedPrices.length === 0) {
        showError('請至少選擇一個價位範圍');
        return;
    }

    // 檢查是否可以使用快取
    if (canUseCache(selectedPrices)) {
        console.log('使用快取資料');
        allRestaurants = searchCache.data;
        chooseRandomRestaurants();
        return;
    }

    // 需要重新搜尋
    console.log('🔍 開始搜尋餐廳...');
    console.log('📍 搜尋位置:', userLocation);
    console.log('💰 選擇的價位:', selectedPrices);

    isSearching = true;
    searchCancelled = false;
    showLoading(true);
    updateChooseButton('暫停搜尋', false);

    // 設定 1 分鐘超時
    searchTimeoutId = setTimeout(() => {
        if (isSearching) {
            console.error('⏰ 搜尋超時（1分鐘）');
            isSearching = false;
            searchCancelled = true;
            showLoading(false);
            updateChooseButton('開始選擇', false);
            showError('搜尋逾時，請稍後再試或調整搜尋條件');
        }
    }, SEARCH_TIMEOUT);

    const request = {
        location: userLocation,
        radius: 2000, // 增加到 2 公里提高成功率
        type: 'restaurant'
    };

    console.log('🔍 搜尋參數:', request);

    service.nearbySearch(request, (results, status) => {
        // 清除超時計時器
        if (searchTimeoutId) {
            clearTimeout(searchTimeoutId);
            searchTimeoutId = null;
        }

        console.log('📡 API 回應狀態:', status);

        // 檢查是否已取消
        if (searchCancelled) {
            console.log('⚠️ 搜尋已被使用者取消');
            searchCancelled = false;
            return;
        }

        isSearching = false;
        showLoading(false);
        updateChooseButton('開始選擇', false);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log(`📋 找到 ${results.length} 間餐廳（未過濾）`);

            // 放寬過濾條件：沒有價位資訊的餐廳預設為銅板價
            const filteredRestaurants = results.filter(place => {
                const priceLevel = place.price_level !== undefined ? place.price_level : 0;
                const match = selectedPrices.includes(priceLevel);
                if (!match) {
                    console.log(`❌ 過濾掉: ${place.name} (價位: ${priceLevel})`);
                }
                return match;
            });

            console.log(`✅ 符合條件的餐廳: ${filteredRestaurants.length} 間`);

            if (filteredRestaurants.length === 0) {
                showError('附近沒有符合條件的餐廳，請調整價位範圍或搜尋條件');
                console.error('❌ 沒有符合條件的餐廳');
                console.log('💡 建議：勾選更多價位範圍');
                return;
            }

            // 儲存到快取
            searchCache = {
                data: filteredRestaurants,
                timestamp: Date.now(),
                location: { ...userLocation },
                selectedPrices: [...selectedPrices]
            };

            allRestaurants = filteredRestaurants;
            chooseRandomRestaurants();
        } else {
            const errorMessages = {
                'ZERO_RESULTS': '附近沒有找到餐廳，請稍後再試',
                'OVER_QUERY_LIMIT': 'API 配額已用盡，請稍後再試',
                'REQUEST_DENIED': 'API 請求被拒絕，請檢查 API Key 設定',
                'INVALID_REQUEST': '搜尋參數錯誤',
                'UNKNOWN_ERROR': '發生未知錯誤，請重新整理頁面'
            };
            const errorMsg = errorMessages[status] || '搜尋餐廳時發生錯誤，請稍後再試';
            showError(errorMsg);
            console.error('❌ API 錯誤:', status);
            console.error('錯誤訊息:', errorMsg);
        }
    });
}

// 檢查是否可以使用快取
function canUseCache(selectedPrices) {
    if (!searchCache.data || !searchCache.timestamp) {
        return false;
    }

    // 檢查快取是否過期
    const now = Date.now();
    if (now - searchCache.timestamp > CACHE_DURATION) {
        return false;
    }

    // 檢查位置是否改變
    if (!searchCache.location ||
        searchCache.location.lat !== userLocation.lat ||
        searchCache.location.lng !== userLocation.lng) {
        return false;
    }

    // 檢查價位篩選是否相同
    if (!searchCache.selectedPrices ||
        JSON.stringify(searchCache.selectedPrices.sort()) !== JSON.stringify(selectedPrices.sort())) {
        return false;
    }

    return true;
}

// 取得選中的價位
function getSelectedPrices() {
    const checkboxes = document.querySelectorAll('.price-option input[type="checkbox"]:checked');
    const prices = [];

    checkboxes.forEach(checkbox => {
        const values = checkbox.value.split(',').map(v => parseInt(v));
        prices.push(...values);
    });

    return [...new Set(prices)]; // 去重
}

// 隨機選擇餐廳
function chooseRandomRestaurants() {
    if (allRestaurants.length === 0) {
        showError('請先搜尋餐廳');
        console.error('❌ 沒有可用的餐廳資料');
        return;
    }

    console.log(`🎲 從 ${allRestaurants.length} 間餐廳中隨機選擇...`);
    resultsGrid.innerHTML = '';

    // 隨機選擇最多 2 個餐廳
    const count = Math.min(2, allRestaurants.length);
    const selectedRestaurants = getRandomItems(allRestaurants, count);

    console.log(`✅ 已選擇 ${selectedRestaurants.length} 間餐廳:`);
    selectedRestaurants.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name}`);
        displayRestaurant(restaurant);
    });

    // 顯示「再抽一次」按鈕，隱藏「開始選擇」按鈕
    rerollButton.style.display = 'block';
    chooseButton.style.display = 'none';
}

// 隨機選取指定數量的項目
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 顯示餐廳卡片
function displayRestaurant(place) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';

    const priceSymbols = getPriceSymbols(place.price_level);
    const rating = place.rating ? place.rating.toFixed(1) : '無評分';
    const distance = calculateDistance(userLocation, place.geometry.location);

    card.innerHTML = `
        <div class="restaurant-name">
            <span>${place.name}</span>
        </div>
        <div class="restaurant-info">
            <div class="info-item">
                <span class="info-icon">⭐</span>
                <span class="rating">${rating}</span>
                ${place.user_ratings_total ? `<span style="color: #999; font-size: 0.85rem;">(${place.user_ratings_total} 則評論)</span>` : ''}
            </div>
            <div class="info-item">
                <span class="info-icon">📍</span>
                <span class="distance">${distance} 公尺</span>
            </div>
            <div class="info-item">
                <span class="info-icon">💰</span>
                <span class="price-level">${priceSymbols}</span>
            </div>
        </div>
        <button class="navigate-button" onclick="openGoogleMaps(${place.geometry.location.lat()}, ${place.geometry.location.lng()}, '${place.name.replace(/'/g, "\\'")}')">
            <span>🗺️</span>
            <span>Google Maps 導航</span>
        </button>
    `;

    resultsGrid.appendChild(card);
}

// 轉換價位等級為符號
function getPriceSymbols(priceLevel) {
    if (priceLevel === undefined || priceLevel === null) {
        return '$ 銅板價';
    }

    const levels = {
        0: '$ 銅板價',
        1: '$ 銅板價',
        2: '$$ 小資族',
        3: '$$$ 好料的',
        4: '$$$$ 奢華饗宴'
    };

    return levels[priceLevel] || '$ 銅板價';
}

// 計算距離（公尺）
function calculateDistance(pos1, pos2) {
    const R = 6371000; // 地球半徑（公尺）
    const lat1 = pos1.lat * Math.PI / 180;
    const lat2 = pos2.lat() * Math.PI / 180;
    const deltaLat = (pos2.lat() - pos1.lat) * Math.PI / 180;
    const deltaLng = (pos2.lng() - pos1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c;
    return Math.round(distance);
}

// 開啟 Google Maps 導航
function openGoogleMaps(lat, lng, name) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
}

// 顯示/隱藏載入中
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// 顯示錯誤訊息
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        hideError();
    }, 5000);
}

// 隱藏錯誤訊息
function hideError() {
    errorMessage.style.display = 'none';
}

// 更新「開始選擇」按鈕
function updateChooseButton(text, disabled) {
    chooseButton.querySelector('span').textContent = text;
    chooseButton.disabled = disabled;

    if (disabled) {
        chooseButton.style.opacity = '0.6';
        chooseButton.style.cursor = 'not-allowed';
    } else {
        chooseButton.style.opacity = '1';
        chooseButton.style.cursor = 'pointer';
    }
}

// 顯示手動輸入
function showManualInput() {
    manualInputContainer.style.display = 'flex';
    manualLocationInput.value = '';
    manualLocationInput.focus();
    console.log('💡 切換到手動輸入模式');
}

// 隱藏手動輸入
function hideManualInput() {
    manualInputContainer.style.display = 'none';
    manualLocationInput.value = '';
}

// 確認手動輸入的地點
function confirmManualLocation() {
    const address = manualLocationInput.value.trim();

    if (!address) {
        showError('請輸入地點');
        return;
    }

    console.log('🔍 地理編碼搜尋:', address);
    locationText.textContent = '正在搜尋地點...';

    // 使用 Google Geocoding API
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: address, region: 'TW' }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            userLocation = {
                lat: location.lat(),
                lng: location.lng()
            };

            console.log('✅ 地點找到:', userLocation);
            locationText.textContent = results[0].formatted_address;

            // 清除快取（因為位置改變了）
            searchCache = {
                data: null,
                timestamp: null,
                location: null,
                selectedPrices: null
            };

            // 隱藏手動輸入
            hideManualInput();

            // 重新初始化地圖服務
            if (map) {
                map.setCenter(userLocation);
            } else {
                // 如果地圖還沒初始化，現在初始化它
                initializeGoogleMaps();
            }

            showError('地點已更新，請重新搜尋餐廳');
        } else {
            console.error('❌ 地理編碼失敗:', status);
            locationText.textContent = '位置搜尋失敗';
            showError('找不到該地點，請重新輸入');
        }
    });
}

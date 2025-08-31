let map;

// --- 💡 FIX 1: 지도 스타일 '객체'를 미리 정의합니다 ---

const lightMapStyleObject = {
    version: 8,
    sources: {
        'vworld-source': {
            type: 'raster',
            tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${config.apikey}/Base/{z}/{y}/{x}.png`],
            tileSize: 256,
            attribution: '© <a href="https://www.vworld.kr/">V-World</a>'
        }
    },
    layers: [{'id': 'vworld-layer', 'type': 'raster', 'source': 'vworld-source'}]
};

const darkMapStyleObject = {
    version: 8,
    sources: {
        'vworld-source': {
            type: 'raster',
            tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${config.apikey}/midnight/{z}/{y}/{x}.png`],
            tileSize: 256,
            attribution: '© <a href="https://www.vworld.kr/">V-World</a>'
        }
    },
    layers: [{'id': 'vworld-layer', 'type': 'raster', 'source': 'vworld-source'}]
};


document.addEventListener('DOMContentLoaded', function () {
    const curvedRouteCoordinates = [
        [127.0447, 37.7741], // 양주역
        [127.0343, 37.7619], // 경민대학교
        [127.1032, 37.4004], // 판교테크노밸리
        [127.1287, 37.4113]  // 야탑역
    ];
    let zoomLevel = null;
    const mapContainer = document.getElementById('mapContainer');
    const mapDiv = document.getElementById('map');
    const historyItems = document.querySelectorAll('.work-item:not(.current)');
    const toggleMapBtn = document.getElementById('toggleMapBtn');
    let mapInitializedFlag = false;
    let activePopup = null;

    initializeMap();

    function updateMapStyle(newTheme) {
        if (!map) return;

        // --- 💡 FIX 2: 테마에 맞는 '객체'를 선택합니다 ---
        const newMapStyleObject = (newTheme === 'dark') ? darkMapStyleObject : lightMapStyleObject;

        // 맵 스타일 변경 시 URL이 아닌 객체를 전달합니다.
        map.setStyle(newMapStyleObject);

        map.once('styledata', function () {
            visualizeRoute(historyItems);
        });
    }

    const themeToggleButton = document.getElementById('darkModeToggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateMapStyle(newTheme);
        });
    }

    function initializeMap() {
        // --- 💡 FIX 3: 초기 테마에 맞는 '객체'를 선택합니다 ---
        const savedTheme = localStorage.getItem('theme');
        const initialMapStyle = (savedTheme === 'dark') ? darkMapStyleObject : lightMapStyleObject;
        document.documentElement.setAttribute('data-theme', savedTheme);

        map = new maplibregl.Map({
            container: 'map',
            style: initialMapStyle, // 👈 URL 대신 Style 객체를 사용합니다.
            center: [127.0017, 37.5665],
            zoom: 10
        });

        map.on('load', function () {
            visualizeRoute(historyItems);
            mapInitializedFlag = true;
        });

        map.on('click', function (e) {
            if (e.originalEvent.target.closest('.work-item-marker')) return;
            if (activePopup) {
                activePopup.remove();
                activePopup = null;
            }
        });
    }

    function visualizeRoute(items) {
        // 이 함수는 기존 로직 그대로 유지됩니다.
        if (!map.isStyleLoaded()) {
            // 스타일이 로드되지 않았으면 잠시 후 다시 시도
            setTimeout(() => visualizeRoute(items), 100);
            return;
        }

        if (map.getLayer('history-route-line')) map.removeLayer('history-route-line');
        if (map.getSource('history-route')) map.removeSource('history-route');
        document.querySelectorAll('.maplibregl-marker').forEach(marker => marker.remove());

        // ... (이하 visualizeRoute 함수 내용은 그대로 유지) ...
        const placeNames = ["양주역", "경민대학교", "판교 테크노밸리", "야탑역"];
        curvedRouteCoordinates.forEach((coord, index) => {
            const placeName = placeNames[index % placeNames.length];
            const el = document.createElement('div');
            el.className = 'vertex-marker';
            el.innerHTML = `<div class="marker-pin"></div><div class="marker-text">${placeName}</div>`;
            new maplibregl.Marker({element: el, anchor: 'bottom'}).setLngLat(coord).addTo(map);
        });

        items.forEach((item, i) => {
            const ratio = (i + 1) / (items.length + 1);
            const coords = GeoPort.getPointAtRatio(curvedRouteCoordinates, ratio);

            const workItemTitle = item.querySelector('h3').textContent;
            const workItemPeriod = item.querySelector('p:first-of-type') ? item.querySelector('p:first-of-type').textContent : '';
            const workItemDescription = item.querySelector('p:nth-of-type(2)') ? item.querySelector('p:nth-of-type(2)').textContent : '';
            const workItemResult = item.querySelector('.result') ? item.querySelector('.result').textContent : '';

            const popupContent = `<div class="marker-popup-content"><h4>${workItemTitle}</h4><p>${workItemPeriod}</p><p>${workItemDescription}</p>${workItemResult ? `<p class="result-text">${workItemResult}</p>` : ''}</div>`;
            const popup = new maplibregl.Popup({offset: 15, closeButton: true, closeOnClick: false}).setHTML(popupContent);
            const elWork = document.createElement('div');
            elWork.className = 'work-item-marker';
            const marker = new maplibregl.Marker({element: elWork, anchor: 'center'}).setLngLat(coords).setPopup(popup).addTo(map);
            elWork.addEventListener('click', (e) => {
                e.preventDefault()
                if (activePopup) activePopup.remove();
                // marker.togglePopup();
                activePopup = marker.getPopup();

            });
        });

        const bounds = new maplibregl.LngLatBounds();
        for (const coord of curvedRouteCoordinates) {
            bounds.extend(coord);
        }
        const padding = {top: 50, bottom: 50, left: 50, right: 50};
        zoomLevel = map.cameraForBounds(bounds, {padding: padding}).zoom;
        map.flyTo({center: bounds.getCenter(), zoom: zoomLevel, speed: 1.5});

        map.addSource('history-route', {
            type: 'geojson',
            data: {type: 'Feature', geometry: {type: 'LineString', coordinates: curvedRouteCoordinates}}
        });
        map.addLayer({
            id: 'history-route-line',
            type: 'line',
            source: 'history-route',
            layout: {'line-join': 'round', 'line-cap': 'round'},
            paint: {'line-color': '#3887be', 'line-width': 5, 'line-opacity': 0.7}
        });
    }

    // ... (이하 토글 버튼, 스크롤 이벤트 리스너 등은 그대로 유지) ...
    toggleMapBtn.addEventListener('click', function () {
        if (mapContainer.style.zIndex == -1 || mapDiv.style.opacity == 0.3) {
            mapContainer.style.zIndex = 999;
            mapDiv.style.opacity = 1;
            toggleMapBtn.textContent = '🗺️';
            if (!mapInitializedFlag) {
                initializeMap();
            } else {
                setTimeout(() => {
                    map.resize();
                    if (zoomLevel) {
                        map.flyTo({center: map.getCenter(), zoom: zoomLevel, speed: 1.2});
                    }
                }, 100);
            }
        } else {
            toggleMapBtn.textContent = '📄';
            mapContainer.style.zIndex = -1;
            mapDiv.style.opacity = 0.3;
        }
    });

    historyItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function () {
            const ratio = (index + 1) / (historyItems.length + 1);
            const coords = GeoPort.getPointAtRatio(curvedRouteCoordinates, ratio);
            if (map && coords) {
                map.flyTo({center: coords, zoom: zoomLevel + 1.5, speed: 1.5, essential: true});
            }
            const targetMarkerElement = document.querySelectorAll('.work-item-marker')[index];
            if (targetMarkerElement) targetMarkerElement.click();
        });
    });

    const observerOptions = {root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0};
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetItem = entry.target;
                const itemsArray = Array.from(historyItems);
                const index = itemsArray.indexOf(targetItem);
                if (index > -1) {
                    const targetMarker = document.querySelectorAll('.work-item-marker')[index];
                    if (targetMarker) targetMarker.click();
                }
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    historyItems.forEach(item => {
        observer.observe(item);
    });
});
let map;
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
    let mapInitializedFlag = false; // 맵 초기화 여부 플래그
    let activePopup = null;

    // 초기 테마에 맞는 스타일 URL 설정
    const savedTheme = localStorage.getItem('theme');
    let mapstyle = (savedTheme === 'dark')
        ? "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
        : "https://tiles.stadiamaps.com/styles/alidade_smooth.json";

    initializeMap(); // 맵 초기화
    function updateMapStyle(newTheme) {
        if (!map) return;

        // 새로운 테마에 맞는 스타일 URL 결정
        const newMapStyle = (newTheme === 'dark')
            ? "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
            : "https://tiles.stadiamaps.com/styles/alidade_smooth.json";

        // 맵 스타일 변경
        map.setStyle(newMapStyle);

        // 중요: 스타일이 완전히 로드된 후, 기존에 그렸던 경로와 마커를 다시 추가
        map.once('styledata', function () {
            // 이 시점에서는 스타일만 바뀐 상태이므로,
            // visualizeRoute 함수를 호출해 소스와 레이어를 다시 그려줍니다.
            visualizeRoute(historyItems);
        });
    }
    // ====================================================================
    // 테마 변경을 감지하고 맵 스타일을 업데이트하는 함수
    // ====================================================================


    const themeToggleButton = document.getElementById('darkModeToggle');

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // 현재 테마를 확인하고 새 테마를 결정하는 로직 (프로젝트에 맞게 수정)
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            // 실제 테마 변경 로직 (예: class나 attribute 변경)
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // 맵 스타일 업데이트 함수 호출!
            updateMapStyle(newTheme);
        });
    }


    function initializeMap() {
        maplibregl.accessToken = 'YOUR_MAPLIBRE_API_KEY'; // 여기에 실제 API 키를 넣어주세요
        map = new maplibregl.Map({
            container: 'map',
            style: mapstyle,
            center: [127.0017, 37.5665],
            zoom: 10
        });

        map.on('load', function () {
            visualizeRoute(historyItems);
            mapInitializedFlag = true;
        });

        // 맵 클릭 시 모든 팝업 닫기 (활성화된 마커 초기화)
        map.on('click', function (e) {
            // 클릭한 위치에 마커가 있으면 아무것도 하지 않음
            if (e.originalEvent.target.closest('.work-item-marker')) {
                return;
            }
            // 열려있는 팝업(activePopup)이 있으면 닫기
            if (activePopup) {
                activePopup.remove();
                activePopup = null;
            }
        });
    }

    function visualizeRoute(items) {
        if (!map) return;

        // 기존 레이어, 소스, 마커 모두 제거
        if (map.getLayer('history-route-line')) map.removeLayer('history-route-line');
        if (map.getSource('history-route')) map.removeSource('history-route');
        document.querySelectorAll('.maplibregl-marker').forEach(marker => marker.remove());

        // ====================================================================
        // 1. 주요 지점 (꼭짓점) 마커 생성
        // ====================================================================
        const placeNames = ["양주역", "경민대학교", "판교 테크노밸리", "야탑역"];
        curvedRouteCoordinates.forEach((coord, index) => {
            const placeName = placeNames[index % placeNames.length];

            const el = document.createElement('div');
            el.className = 'vertex-marker'; // 주요 지점 마커용 클래스
            el.innerHTML = `<div class="marker-pin"></div><div class="marker-text">${placeName}</div>`;

            new maplibregl.Marker({
                element: el,
                anchor: 'bottom'
            })
                .setLngLat(coord)
                .addTo(map);
        });

        // ====================================================================
        // 2. 업무 경험 (work-item) 마커와 팝업 생성
        // ====================================================================
        items.forEach((item, i) => {
            // GeoPort를 이용해 경로상 비율에 맞는 좌표 계산
            const ratio = (i + 1) / (items.length + 1);
            const coords = GeoPort.getPointAtRatio(curvedRouteCoordinates, ratio);

            // 팝업에 들어갈 내용 추출
            const workItemTitle = item.querySelector('h3').textContent;
            const workItemPeriod = item.querySelector('p:first-of-type') ? item.querySelector('p:first-of-type').textContent : '';
            const workItemDescription = item.querySelector('p:nth-of-type(2)') ? item.querySelector('p:nth-of-type(2)').textContent : '';
            const workItemResult = item.querySelector('.result') ? item.querySelector('.result').textContent : '';

            // 팝업 HTML 컨텐츠
            const popupContent = `
            <div class="marker-popup-content">
                <h4>${workItemTitle}</h4>
                <p>${workItemPeriod}</p>
                <p>${workItemDescription}</p>
                ${workItemResult ? `<p class="result-text">${workItemResult}</p>` : ''}
            </div>
        `;

            const popup = new maplibregl.Popup({
                offset: 15,
                closeButton: true,
                closeOnClick: false
            }).setHTML(popupContent);

            // 업무 경험 마커용 엘리먼트 생성
            const elWork = document.createElement('div');
            elWork.className = 'work-item-marker'; // 업무 경험 마커용 클래스

            const marker = new maplibregl.Marker({
                element: elWork,
                anchor: 'center'
            })
                .setLngLat(coords)
                .setPopup(popup)
                .addTo(map);

            elWork.addEventListener('click', (e) => {
                if (activePopup) {
                    activePopup.remove();
                }
                marker.togglePopup();
                activePopup = marker.getPopup();
            });
        });

        // ====================================================================
        // 3. 경로 라인 그리기 및 화면 맞춤
        // ====================================================================
        const bounds = new maplibregl.LngLatBounds();
        for (const coord of curvedRouteCoordinates) {
            bounds.extend(coord);
        }
        const padding = {top: 50, bottom: 50, left: 50, right: 50};
        zoomLevel = map.cameraForBounds(bounds, {padding: padding}).zoom;

        map.flyTo({
            center: bounds.getCenter(),
            zoom: zoomLevel,
            speed: 1.5
        });

        map.addSource('history-route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: curvedRouteCoordinates
                }
            }
        });
        map.addLayer({
            id: 'history-route-line',
            type: 'line',
            source: 'history-route',
            layout: {'line-join': 'round', 'line-cap': 'round'},
            paint: {'line-color': '#3887be', 'line-width': 5, 'line-opacity': 0.7}
        });
    }

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
                        map.flyTo({
                            center: map.getCenter(),
                            zoom: zoomLevel,
                            speed: 1.2
                        });
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
        item.addEventListener('click', function () {
            const targetMarkerElement = document.querySelectorAll('.work-item-marker')[index];
            if (targetMarkerElement) {
                targetMarkerElement.click();
            }
        });

        item.addEventListener('mouseenter', function () {
            const ratio = (index + 1) / (historyItems.length + 1);
            const coords = GeoPort.getPointAtRatio(curvedRouteCoordinates, ratio);
            if (map && coords) {
                map.flyTo({
                    center: coords,
                    zoom: zoomLevel + 1.5,
                    speed: 1.5,
                    essential: true
                });
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetItem = entry.target;
                const itemsArray = Array.from(historyItems);
                const index = itemsArray.indexOf(targetItem);
                if (index > -1) {
                    const targetMarker = document.querySelectorAll('.work-item-marker')[index];
                    if (targetMarker) {
                        targetMarker.click();
                    }
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    historyItems.forEach(item => {
        observer.observe(item);
    });
});
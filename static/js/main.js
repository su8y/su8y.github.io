import {darkMapStyleObject, lightMapStyleObject} from "./layer.js";
import {fontSizeChangeEventListener, themeChangeEventListener, mapToggleEventListener} from './theme.js'
import * as Constant from './constant.js';

(() => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const fontSizeSelect = document.getElementById('font-size-select');
    const mapToggleButton = document.getElementById('map-toggle-btn');
    const body = document.body;


    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        fontSizeSelect.value = savedFontSize;
    }

    themeToggleButton.addEventListener('click', themeChangeEventListener);
    fontSizeSelect.addEventListener('change', fontSizeChangeEventListener);
    mapToggleButton.addEventListener('click', mapToggleEventListener);

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
    let mapInitializedFlag = false;
    let activePopup = null;

    initializeMap();



    function initializeMap() {
        const savedTheme = localStorage.getItem('theme');
        const initialMapStyle = (savedTheme === 'dark') ? Constant.dark.mapLayer : Constant.light.mapLayer;

        window.map = new maplibregl.Map({
            container: 'map',
            style: initialMapStyle, // 👈 URL 대신 Style 객체를 사용합니다.
            center: [127.0017, 37.5665],
            zoom: 10
        });

        function updateMapStyle(newTheme) {
            if (!window.map) return;

            const newMapStyleObject = (newTheme === Constant.dark.text) ? darkMapStyleObject : lightMapStyleObject;

            window.map.setStyle(newMapStyleObject);

            window.map.once('styledata', function () {
                visualizeRoute(historyItems);
            });
        }

        const mapLoadEventListener = () => {
            visualizeRoute(historyItems);
            mapInitializedFlag = true;

        }

        const clearPopupEventListener = (e) => {
            if (e.originalEvent.target.closest('.work-item-marker')) return;
            if (activePopup) {
                activePopup.remove();
                activePopup = null;
            }
        }

        window.map.on('load', mapLoadEventListener);
        window.map.on('click', clearPopupEventListener);
        window.map.updateStyle = updateMapStyle;
    }

    function visualizeRoute(items) {
        if (!window.map.isStyleLoaded()) {
            setTimeout(() => visualizeRoute(items), 100);
            return;
        }

        if (window.map.getLayer('history-route-line')) window.map.removeLayer('history-route-line');
        if (window.map.getSource('history-route')) window.map.removeSource('history-route');
        document.querySelectorAll('.maplibregl-marker').forEach(marker => marker.remove());

        const placeNames = ["양주역", "경민대학교", "판교 테크노밸리", "야탑역"];
        curvedRouteCoordinates.forEach((coord, index) => {
            const placeName = placeNames[index % placeNames.length];
            const el = document.createElement('div');
            el.className = 'vertex-marker';
            el.innerHTML = `<div class="marker-pin"></div><div class="marker-text">${placeName}</div>`;
            new maplibregl.Marker({element: el, anchor: 'bottom'}).setLngLat(coord).addTo(window.map);
        });

        items.forEach((item, i) => {
            const ratio = (i + 1) / (items.length + 1);
            const coords = GeoPort.getPointAtRatio(curvedRouteCoordinates, ratio);

            const workItemTitle = item.querySelector('h3').textContent;
            const workItemPeriod = item.querySelector('p:first-of-type') ? item.querySelector('p:first-of-type').textContent : '';
            const workItemDescription = item.querySelector('p:nth-of-type(2)') ? item.querySelector('p:nth-of-type(2)').textContent : '';
            const workItemResult = item.querySelector('.result') ? item.querySelector('.result').textContent : '';

            const popupContent = `<div class="marker-popup-content"><h4>${workItemTitle}</h4><p>${workItemPeriod}</p><p>${workItemDescription}</p>${workItemResult ? `<p class="result-text">${workItemResult}</p>` : ''}</div>`;
            const popup = new maplibregl.Popup({
                offset: 15,
                closeButton: true,
                closeOnClick: false
            }).setHTML(popupContent);
            const elWork = document.createElement('div');
            elWork.className = 'work-item-marker';
            const marker = new maplibregl.Marker({
                element: elWork,
                anchor: 'center'
            }).setLngLat(coords).setPopup(popup).addTo(window.map);
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
        zoomLevel = window.map.cameraForBounds(bounds, {padding: padding}).zoom;
        window.map.flyTo({center: bounds.getCenter(), zoom: zoomLevel, speed: 1.5});

        window.map.addSource('history-route', {
            type: 'geojson',
            data: {type: 'Feature', geometry: {type: 'LineString', coordinates: curvedRouteCoordinates}}
        });
        window.map.addLayer({
            id: 'history-route-line',
            type: 'line',
            source: 'history-route',
            layout: {'line-join': 'round', 'line-cap': 'round'},
            paint: {'line-color': '#3887be', 'line-width': 5, 'line-opacity': 0.7}
        });
    }

    historyItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function () {
            const ratio = (index + 1) / (historyItems.length + 1);
            const coords = GeoPort.getPointAtRatio(curvedRouteCoordinates, ratio);
            if (window.map && coords) {
                window.map.flyTo({center: coords, zoom: zoomLevel + 1.5, speed: 1.5, essential: true});
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
})();
import * as Constant from './constant.js'
import {darkMapStyleObject, lightMapStyleObject} from "./layer.js";

const themeToggleButton = document.getElementById('theme-toggle-btn');
const body = document.body;
const mapContainer = document.getElementById('mapContainer');
const mapDiv = document.getElementById('map');



export const themeChangeEventListener = (e) => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        document.getElementById('github-icon').src = Constant.dark.githubIcon;
        localStorage.setItem('theme', Constant.dark.text);
        themeToggleButton.textContent = Constant.dark.themeToggle;
        if(window.map) window.map.updateStyle(Constant.dark.text);
    } else {
        localStorage.setItem('theme', Constant.light.text);
        document.getElementById('github-icon').src = Constant.light.githubIcon;
        themeToggleButton.textContent = Constant.light.themeToggle;
        if(window.map) window.map.updateStyle(Constant.light.text);
    }
}

export const fontSizeChangeEventListener = (event) => {
    const selectedSize = event.target.value;
    document.documentElement.style.setProperty('--base-font-size', `${selectedSize}px`);
    document.documentElement.style.fontSize = `${selectedSize}px`;
    localStorage.setItem('fontSize', selectedSize);
}
export const mapToggleEventListener = (event) => {
    if (event.target.textContent === '📄') {
        mapContainer.style.zIndex = '999';
        mapDiv.style.opacity = '1';
        event.target.textContent = '🗺️';
    } else {
        mapContainer.style.zIndex = '-1';
        mapDiv.style.opacity = '0.3';
        event.target.textContent = '📄';
    }
}

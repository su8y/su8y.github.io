// script.js
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const body = document.body;
    // Load saved settings from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        document.getElementById('github-icon').src='assets/images/github-mark-white.svg'
        darkModeToggle.textContent = '🌙'; // Set moon icon for dark mode
    }
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.setProperty('--base-font-size', `${savedFontSize}px`);
        fontSizeSelect.value = savedFontSize;
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        // Save the setting to localStorage
        if (body.classList.contains('dark-mode')) {
            document.getElementById('github-icon').src='assets/images/github-mark-white.svg'
            localStorage.setItem('theme', 'dark');
            darkModeToggle.textContent = '🌙'; // Set moon icon for dark mode
        } else {
            localStorage.setItem('theme', 'light');
            document.getElementById('github-icon').src='assets/images/github-mark.svg'
            darkModeToggle.textContent = '☀️'; // Set sun icon for light mode
        }
    });

    fontSizeSelect.addEventListener('change', (event) => {
        const selectedSize = event.target.value;
        document.documentElement.style.setProperty('--base-font-size', `${selectedSize}px`);
        localStorage.setItem('fontSize', selectedSize);
    });

});
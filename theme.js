// Theme Toggle - Light/Dark Mode
// Persists user preference in localStorage

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme on page load
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Use saved preference, otherwise default to light
    const theme = savedTheme || 'light';

    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Initialize immediately (before DOM loads for instant theme)
initTheme();

// Also listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

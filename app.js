// News Analytics Platform - Main Application
// Loads events data and renders event cards

const DATA_PATH = 'data/events.json';

// Global state
let allEvents = [];
let currentSort = 'trending';
let currentCategory = 'all';
let currentQuery = '';

// Category labels (no icons)
const CATEGORY_LABELS = {
    'ev': 'EV',
    'steel': 'Steel',
    'hydrogen': 'H2',
    'other': 'Other',
    'default': ''
};

// Sorting functions
function sortEvents(events, sortType) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sorted = [...events];

    switch (sortType) {
        case 'trending':
            // Most articles in the past month
            sorted.sort((a, b) => {
                const aDate = new Date(a.last_article_date || 0);
                const bDate = new Date(b.last_article_date || 0);
                const aRecent = aDate >= oneMonthAgo ? a.article_count : 0;
                const bRecent = bDate >= oneMonthAgo ? b.article_count : 0;
                // If both have recent activity, sort by article count
                if (aRecent > 0 && bRecent > 0) {
                    return bRecent - aRecent;
                }
                // Recent activity takes priority
                if (aRecent !== bRecent) {
                    return bRecent - aRecent;
                }
                // Fall back to recency
                return bDate - aDate;
            });
            break;

        case 'popular':
            // Most articles all time
            sorted.sort((a, b) => (b.article_count || 0) - (a.article_count || 0));
            break;

        case 'newest':
            // Most recent article date
            sorted.sort((a, b) => {
                const aDate = new Date(a.last_article_date || 0);
                const bDate = new Date(b.last_article_date || 0);
                return bDate - aDate;
            });
            break;

        default:
            break;
    }

    return sorted;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Get sentiment class
function getSentimentClass(score) {
    if (score === null || score === undefined) return 'neutral';
    if (score > 0.15) return 'positive';
    if (score < -0.15) return 'negative';
    return 'neutral';
}

// Get sentiment label
function getSentimentLabel(score) {
    if (score === null || score === undefined) return 'Mixed';
    if (score > 0.3) return 'Positive';
    if (score > 0.15) return 'Slightly Positive';
    if (score < -0.3) return 'Negative';
    if (score < -0.15) return 'Slightly Negative';
    return 'Neutral';
}

// Create event card HTML
function createEventCard(event) {
    const label = CATEGORY_LABELS[event.category] || CATEGORY_LABELS['default'];
    const sentimentClass = getSentimentClass(event.avg_sentiment);
    const sentimentLabel = getSentimentLabel(event.avg_sentiment);

    // Truncate title if too long
    const title = event.title.length > 100
        ? event.title.substring(0, 100) + '...'
        : event.title;

    const categoryBadge = label ? `<span class="category-badge">${label}</span> ` : '';

    // Format last updated as relative time
    const formatLastUpdated = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const lastUpdated = formatLastUpdated(event.last_updated);

    return `
        <div class="glass-card event-card" onclick="window.location.href='dashboard.html?id=${event.id}'">
            <div class="event-title">${categoryBadge}${title}</div>
            <div class="event-meta">
                <span>${formatDate(event.last_article_date)}</span>
                ${lastUpdated ? `<span class="last-updated">Updated ${lastUpdated}</span>` : ''}
            </div>
            ${event.top_companies && event.top_companies.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <span style="font-size: 0.75rem; color: var(--gray-500);">Companies: </span>
                    <span style="font-size: 0.875rem; color: var(--gray-700);">${event.top_companies.slice(0, 3).join(', ')}</span>
                </div>
            ` : ''}
            <div class="event-stats">
                <div class="stat-item">
                    <div class="stat-value">${event.article_count || 0}</div>
                    <div class="stat-label">Articles</div>
                </div>
                <div class="stat-item">
                    <span class="sentiment-badge sentiment-${sentimentClass}">${sentimentLabel}</span>
                </div>
            </div>
        </div>
    `;
}

// Render events
function renderEvents(events) {
    const container = document.getElementById('eventsContainer');

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="glass-card-static" style="text-align: center; padding: 3rem;">
                <h3>No events found</h3>
                <p style="color: var(--gray-500); margin-top: 0.5rem;">
                    Run the data pipeline to fetch articles and generate events.
                </p>
                <code style="display: block; margin-top: 1rem; padding: 0.5rem; background: var(--gray-100); border-radius: var(--radius-md);">
                    python backend/run_pipeline.py
                </code>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="events-grid">
            ${events.map(event => createEventCard(event)).join('')}
        </div>
    `;
}

// Filter events by category
function filterByCategory(events, category) {
    if (category === 'all') return events;
    return events.filter(e => e.category === category);
}

// Search events by query
function searchEvents(events, query) {
    if (!query || query.trim() === '') return events;

    const searchTerms = query.toLowerCase().trim().split(/\s+/);

    return events.filter(event => {
        // Build searchable string from event data
        const searchable = [
            event.title || '',
            event.summary || '',
            ...(event.top_companies || []),
            ...(event.top_politicians || []),
            ...(event.top_organizations || []),
            event.category || ''
        ].join(' ').toLowerCase();

        // All search terms must be found
        return searchTerms.every(term => searchable.includes(term));
    });
}

// Combined filter, search, and sort
function applyFilters() {
    let filtered = filterByCategory(allEvents, currentCategory);
    filtered = searchEvents(filtered, currentQuery);
    filtered = sortEvents(filtered, currentSort);
    return filtered;
}

// Re-render with current filters
function updateDisplay() {
    const filtered = applyFilters();
    renderEvents(filtered);
}

// Initialize category navigation
function initCategoryNav() {
    const nav = document.getElementById('categoryNav');
    const tabs = nav.querySelectorAll('.category-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            updateDisplay();
        });
    });
}

// Initialize search with debouncing
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentQuery = searchInput.value;
            updateDisplay();
        }, 150);
    });
}

// Initialize sort controls
function initSortControls() {
    const sortControls = document.getElementById('sortControls');
    if (!sortControls) return;

    const buttons = sortControls.querySelectorAll('.sort-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            updateDisplay();
        });
    });
}

// Load data and initialize
async function init() {
    try {
        const response = await fetch(DATA_PATH);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        allEvents = data.events || [];

        // Initial render with default sort (trending)
        updateDisplay();

        // Initialize all controls
        initCategoryNav();
        initSearch();
        initSortControls();

    } catch (error) {
        console.error('Failed to load events:', error);

        const container = document.getElementById('eventsContainer');
        container.innerHTML = `
            <div class="glass-card-static" style="text-align: center; padding: 3rem;">
                <h3>No Data Available</h3>
                <p style="color: var(--gray-500); margin-top: 0.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                    The data files haven't been generated yet. Run the pipeline to fetch articles and generate the JSON data.
                </p>
                <div style="margin-top: 1.5rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">1. Navigate to the backend folder:</p>
                    <code style="display: block; padding: 0.5rem; background: var(--gray-100); border-radius: var(--radius-md); margin-bottom: 1rem;">
                        cd backend
                    </code>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">2. Run the pipeline (test mode):</p>
                    <code style="display: block; padding: 0.5rem; background: var(--gray-100); border-radius: var(--radius-md);">
                        python run_pipeline.py --test
                    </code>
                </div>
            </div>
        `;
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);

// Dashboard Page - Event Detail View
// Loads event data and renders charts and metrics

// Global state for filtering
let allQuotes = [];
let allArticles = [];
let currentQuotesFilter = 'all';
let currentArticlesFilter = 'all';

// Get event ID from URL
function getEventId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Format currency
function formatCurrency(amount, currency = 'EUR') {
    if (!amount) return '-';

    // Handle very large numbers
    if (amount >= 1e12) {
        return `${(amount / 1e12).toFixed(1)}T ${currency}`;
    } else if (amount >= 1e9) {
        return `${(amount / 1e9).toFixed(1)}B ${currency}`;
    } else if (amount >= 1e6) {
        return `${(amount / 1e6).toFixed(1)}M ${currency}`;
    } else if (amount >= 1e3) {
        return `${(amount / 1e3).toFixed(1)}K ${currency}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
}

// Sentiment color
function getSentimentColor(score) {
    if (score > 0.15) return '#10B981'; // positive
    if (score < -0.15) return '#EF4444'; // negative
    return '#6B7280'; // neutral
}

// Render metric cards
function renderMetrics(stats) {
    document.getElementById('totalArticles').textContent = stats.total_articles || 0;
    document.getElementById('totalSources').textContent = stats.sources || 0;
    document.getElementById('totalQuotes').textContent = stats.total_quotes || 0;
    document.getElementById('financialCount').textContent = stats.total_financial_mentions || 0;
}

// Render executive brief
function renderExecutiveBrief(brief) {
    const section = document.getElementById('executiveBriefSection');
    const content = document.getElementById('executiveBriefContent');

    if (!brief) {
        section.style.display = 'none';
        return;
    }

    // Convert newlines to paragraphs
    const paragraphs = brief.split('\n\n').filter(p => p.trim());
    content.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    section.style.display = 'block';
}

// Render key arguments
function renderKeyArguments(args) {
    const section = document.getElementById('keyArgumentsSection');
    const forList = document.getElementById('argumentsFor');
    const againstList = document.getElementById('argumentsAgainst');

    if (!args || (!args.for?.length && !args.against?.length)) {
        section.style.display = 'none';
        return;
    }

    forList.innerHTML = (args.for || []).map(arg => `<li>${arg}</li>`).join('');
    againstList.innerHTML = (args.against || []).map(arg => `<li>${arg}</li>`).join('');
    section.style.display = 'block';
}

// Render popularity chart
function renderPopularityChart(trendData) {
    const ctx = document.getElementById('popularityChart').getContext('2d');

    if (!trendData || trendData.length === 0) {
        ctx.canvas.parentElement.innerHTML = '<p style="color: var(--gray-500); text-align: center;">No trend data available</p>';
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendData.map(d => formatDate(d.date)),
            datasets: [{
                label: 'Articles Published',
                data: trendData.map(d => d.count),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Render sentiment chart
function renderSentimentChart(trendData) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');

    if (!trendData || trendData.length === 0) {
        ctx.canvas.parentElement.innerHTML = '<p style="color: var(--gray-500); text-align: center;">No sentiment data available</p>';
        return;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.map(d => formatDate(d.date)),
            datasets: [{
                label: 'Average Sentiment',
                data: trendData.map(d => d.avg_sentiment),
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: trendData.map(d => getSentimentColor(d.avg_sentiment)),
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    ticks: {
                        callback: function (value) {
                            if (value === 1) return 'Positive';
                            if (value === 0) return 'Neutral';
                            if (value === -1) return 'Negative';
                            return '';
                        }
                    }
                }
            }
        }
    });
}

// Render entity tags
function renderEntities(entities) {
    const companiesContainer = document.getElementById('companiesTags');
    const politiciansContainer = document.getElementById('politiciansTags');
    const organizationsContainer = document.getElementById('organizationsTags');

    // Companies
    const companies = entities.companies || [];
    if (companies.length > 0) {
        companiesContainer.innerHTML = companies.slice(0, 10).map(c =>
            `<span class="entity-tag company">${c.name} <span class="count">${c.count}</span></span>`
        ).join('');
    } else {
        companiesContainer.innerHTML = '<span style="color: var(--gray-400); font-size: 0.875rem;">No companies mentioned</span>';
    }

    // Politicians
    const politicians = entities.politicians || [];
    if (politicians.length > 0) {
        politiciansContainer.innerHTML = politicians.slice(0, 10).map(p =>
            `<span class="entity-tag politician">${p.name} <span class="count">${p.count}</span></span>`
        ).join('');
    } else {
        politiciansContainer.innerHTML = '<span style="color: var(--gray-400); font-size: 0.875rem;">No politicians mentioned</span>';
    }

    // Organizations
    const organizations = entities.organizations || [];
    if (organizations.length > 0) {
        organizationsContainer.innerHTML = organizations.slice(0, 10).map(o =>
            `<span class="entity-tag">${o.name} <span class="count">${o.count}</span></span>`
        ).join('');
    } else {
        organizationsContainer.innerHTML = '<span style="color: var(--gray-400); font-size: 0.875rem;">No organizations mentioned</span>';
    }
}

// Render financial mentions as compact 3-column grid with collapse
function renderFinancial(financial) {
    const container = document.getElementById('financialList');
    const amounts = financial.amounts || [];

    if (amounts.length === 0) {
        document.getElementById('financialSection').style.display = 'none';
        return;
    }

    // Deduplicate amounts with same value, currency, and context
    const seen = new Set();
    const uniqueAmounts = amounts.filter(item => {
        const key = `${item.amount}|${item.currency}|${item.context}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    const COLLAPSE_THRESHOLD = 30;
    const needsCollapse = uniqueAmounts.length > COLLAPSE_THRESHOLD;
    const visibleAmounts = needsCollapse ? uniqueAmounts.slice(0, COLLAPSE_THRESHOLD) : uniqueAmounts;
    const hiddenAmounts = needsCollapse ? uniqueAmounts.slice(COLLAPSE_THRESHOLD) : [];

    // Build compact 3-column grid - value + context visible at once
    container.innerHTML = `
        <div class="financial-grid">
            ${visibleAmounts.map(item => `
                <div class="financial-item">
                    <span class="fi-value">${formatCurrency(item.amount, item.currency)}</span>
                    <span class="fi-context">${item.context || 'No context'}</span>
                </div>
            `).join('')}
        </div>
        ${needsCollapse ? `
            <div class="collapsible-section collapsed" id="financialHidden">
                <div class="financial-grid">
                    ${hiddenAmounts.map(item => `
                        <div class="financial-item">
                            <span class="fi-value">${formatCurrency(item.amount, item.currency)}</span>
                            <span class="fi-context">${item.context || 'No context'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="expand-btn" onclick="toggleCollapse('financialHidden', this)">
                Show ${hiddenAmounts.length} more ▼
            </button>
        ` : ''}
    `;
}

// Toggle collapse/expand for sections
function toggleCollapse(sectionId, button) {
    const section = document.getElementById(sectionId);
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('▼', '▲');
    } else {
        section.classList.add('collapsed');
        button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('▲', '▼');
    }
}

// Render quotes with collapse and filtering
function renderQuotes(quotes, filter = 'all') {
    const container = document.getElementById('quotesContainer');

    // Normalize stance values (AI sometimes returns negative/positive instead of oppose/support)
    const normalizeStance = (stance) => {
        if (!stance) return 'neutral';
        const s = stance.toLowerCase();
        if (s === 'negative' || s === 'oppose') return 'oppose';
        if (s === 'positive' || s === 'support') return 'support';
        return 'neutral';
    };

    // Apply filter
    const filteredQuotes = quotes.filter(q => {
        if (filter === 'all') return true;
        return normalizeStance(q.stance) === filter;
    });

    if (filteredQuotes.length === 0) {
        container.innerHTML = `<p style="color: var(--gray-500);">No ${filter === 'all' ? '' : filter + ' '}quotes found.</p>`;
        return;
    }

    const COLLAPSE_THRESHOLD = 5;
    const needsCollapse = filteredQuotes.length > COLLAPSE_THRESHOLD;
    const visibleQuotes = needsCollapse ? filteredQuotes.slice(0, COLLAPSE_THRESHOLD) : filteredQuotes;
    const hiddenQuotes = needsCollapse ? filteredQuotes.slice(COLLAPSE_THRESHOLD) : [];

    const renderQuote = q => {
        const stance = normalizeStance(q.stance);
        return `
            <div class="quote-card">
                <div class="quote-text">"${q.quote_text}"</div>
                <div class="quote-attribution">
                    <strong>${q.speaker || 'Unknown'}</strong>
                    ${q.speaker_role ? `, ${q.speaker_role}` : ''}
                    ${stance ? ` <span class="sentiment-badge sentiment-${stance === 'support' ? 'positive' : stance === 'oppose' ? 'negative' : 'neutral'}">${stance}</span>` : ''}
                </div>
            </div>
        `;
    };

    container.innerHTML = `
        ${visibleQuotes.map(renderQuote).join('')}
        ${needsCollapse ? `
            <div class="collapsible-section collapsed" id="quotesHidden">
                ${hiddenQuotes.map(renderQuote).join('')}
            </div>
            <button class="expand-btn" onclick="toggleCollapse('quotesHidden', this)">
                Show ${hiddenQuotes.length} more ▼
            </button>
        ` : ''}
    `;
}

// Render articles list with collapse and filtering
function renderArticles(articles, filter = 'all') {
    const container = document.getElementById('articlesList');

    // Determine sentiment type from label
    const getSentimentType = (label, score) => {
        if (!label) return 'neutral';
        const l = label.toLowerCase();
        if (l.includes('positive')) return 'positive';
        if (l.includes('negative')) return 'negative';
        // Fallback to score if label doesn't help
        if (score > 0.15) return 'positive';
        if (score < -0.15) return 'negative';
        return 'neutral';
    };

    // Apply filter
    const filteredArticles = articles.filter(article => {
        if (filter === 'all') return true;
        return getSentimentType(article.sentiment_label, article.sentiment_score) === filter;
    });

    if (filteredArticles.length === 0) {
        container.innerHTML = `<li style="color: var(--gray-500);">No ${filter === 'all' ? '' : filter + ' '}articles found.</li>`;
        return;
    }

    const COLLAPSE_THRESHOLD = 10;
    const needsCollapse = filteredArticles.length > COLLAPSE_THRESHOLD;
    const visibleArticles = needsCollapse ? filteredArticles.slice(0, COLLAPSE_THRESHOLD) : filteredArticles;
    const hiddenArticles = needsCollapse ? filteredArticles.slice(COLLAPSE_THRESHOLD) : [];

    const renderArticle = article => `
        <li class="article-item">
            <div>
                <div class="article-title">
                    <a href="${article.source_url || '#'}" target="_blank" rel="noopener">${article.title || 'Untitled'}</a>
                </div>
                <div class="article-meta">
                    ${article.source_name || 'Unknown source'} • ${formatDate(article.published_date)}
                </div>
            </div>
            ${article.sentiment_label ? `
                <span class="sentiment-badge sentiment-${getSentimentType(article.sentiment_label, article.sentiment_score)}">
                    ${article.sentiment_label}
                </span>
            ` : ''}
        </li>
    `;

    container.innerHTML = `
        ${visibleArticles.map(renderArticle).join('')}
        ${needsCollapse ? `
            <div class="collapsible-section collapsed" id="articlesHidden">
                ${hiddenArticles.map(renderArticle).join('')}
            </div>
            <button class="expand-btn" onclick="toggleCollapse('articlesHidden', this)">
                Show ${hiddenArticles.length} more ▼
            </button>
        ` : ''}
    `;
}

// Load and render dashboard
async function init() {
    const eventId = getEventId();

    if (!eventId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`data/event_${eventId}.json`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Store data globally for filtering
        allQuotes = data.quotes || [];
        allArticles = data.articles || [];

        // Update header
        document.getElementById('eventTitle').textContent = data.event.title || 'Event Dashboard';
        document.getElementById('eventSummary').textContent = data.event.summary || '';
        document.title = `${data.event.title} - Industrial Policy Analytics`;

        // Render executive brief (if available)
        renderExecutiveBrief(data.executive_brief);

        // Render key arguments (if available)
        renderKeyArguments(data.key_arguments);

        // Render all sections
        renderMetrics(data.summary_stats || {});
        renderPopularityChart(data.popularity_trend);
        renderSentimentChart(data.sentiment_trend);
        renderEntities(data.entities || {});
        renderFinancial(data.financial || {});
        renderQuotes(allQuotes, currentQuotesFilter);
        renderArticles(allArticles, currentArticlesFilter);

        // Set up filter button event listeners
        setupFilterListeners();

    } catch (error) {
        console.error('Failed to load event data:', error);

        document.getElementById('eventTitle').textContent = 'Event Not Found';
        document.querySelector('.dashboard-grid').innerHTML = `
            <div class="glass-card-static" style="grid-column: span 12; text-align: center; padding: 3rem;">
                <h3>📁 Event Data Not Found</h3>
                <p style="color: var(--gray-500); margin-top: 0.5rem;">
                    The data for this event hasn't been generated yet. Run the pipeline first.
                </p>
                <a href="index.html" style="display: inline-block; margin-top: 1rem; color: var(--primary-600);">
                    ← Back to Events
                </a>
            </div>
        `;
    }
}

// Set up filter button event listeners
function setupFilterListeners() {
    // Quotes filter buttons
    document.querySelectorAll('#quotesFilter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('#quotesFilter .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            currentQuotesFilter = btn.dataset.filter;
            renderQuotes(allQuotes, currentQuotesFilter);
        });
    });

    // Articles filter buttons
    document.querySelectorAll('#articlesFilter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('#articlesFilter .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            currentArticlesFilter = btn.dataset.filter;
            renderArticles(allArticles, currentArticlesFilter);
        });
    });

    // Update counts
    updateFilterCounts();
}

// Update filter button counts
function updateFilterCounts() {
    // Normalize stance for quotes
    const normalizeStance = (stance) => {
        if (!stance) return 'neutral';
        const s = stance.toLowerCase();
        if (s === 'negative' || s === 'oppose') return 'oppose';
        if (s === 'positive' || s === 'support') return 'support';
        return 'neutral';
    };

    // Get sentiment type for articles
    const getSentimentType = (label, score) => {
        if (!label) return 'neutral';
        const l = label.toLowerCase();
        if (l.includes('positive')) return 'positive';
        if (l.includes('negative')) return 'negative';
        if (score > 0.15) return 'positive';
        if (score < -0.15) return 'negative';
        return 'neutral';
    };

    // Count quotes by stance
    const quoteCounts = { all: allQuotes.length, support: 0, neutral: 0, oppose: 0 };
    allQuotes.forEach(q => {
        const stance = normalizeStance(q.stance);
        quoteCounts[stance]++;
    });

    // Count articles by sentiment
    const articleCounts = { all: allArticles.length, positive: 0, neutral: 0, negative: 0 };
    allArticles.forEach(a => {
        const sentiment = getSentimentType(a.sentiment_label, a.sentiment_score);
        articleCounts[sentiment]++;
    });

    // Update quote filter buttons
    document.querySelectorAll('#quotesFilter .filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        const count = quoteCounts[filter] || 0;
        const countSpan = btn.querySelector('.count');
        if (countSpan) {
            countSpan.textContent = `(${count})`;
        }
    });

    // Update article filter buttons
    document.querySelectorAll('#articlesFilter .filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        const count = articleCounts[filter] || 0;
        const countSpan = btn.querySelector('.count');
        if (countSpan) {
            countSpan.textContent = `(${count})`;
        }
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);

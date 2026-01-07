# Industrial Policy News Tracker

A real-time news analytics dashboard for tracking industrial policy developments across Europe and beyond. Built to monitor key sectors including Electric Vehicles, Steel Industry, and Hydrogen policy discussions.

## Features

- **Real-time News Aggregation** - Tracks news events from multiple sources
- **Sentiment Analysis** - AI-powered sentiment scoring for each article and event
- **Interactive Charts** - Popularity trends and sentiment visualization over time
- **AI Executive Brief** - AI-generated analytical summary for each event
- **What's at Stake** - Winners, losers, risks and opportunities analysis
- **Quote Network** - Visual insights showing Top Speakers, Controversial entities (mixed reactions), and Consensus entities (agreement)
- **Source Coverage Bias** - Grouped view of sources by sentiment (positive/neutral/negative) with expandable lists
- **Key Quotes Extraction** - Color-coded by stance (support/neutral/oppose) with speaker filtering
- **Financial Mentions** - Tracks monetary amounts mentioned in policy discussions
- **Entity Recognition** - Identifies companies, politicians, and organizations

## Design

- **Glassmorphism UI** - Modern glass-effect cards with subtle transparency
- **Animated Gradient Background** - Dynamic blue-to-purple gradient animation
- **Consistent Card Styling** - Unified design with colored left borders and subtle backgrounds
- **Responsive Grids** - Adaptive layouts that adjust based on content availability
- **Color-coded Stances** - Green (support), Red (oppose), Gray (neutral) throughout

## Categories

| Category | Description |
|----------|-------------|
| Electric Vehicles | EV policy, combustion engine bans, charging infrastructure |
| Steel Industry | Steel production, tariffs, green steel initiatives |
| Hydrogen | Green hydrogen projects, infrastructure, partnerships |
| Other | General industrial policy news |

## Live Demo

Visit the live dashboard: https://news.jianz.dev/

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom glassmorphism design with CSS variables
- **Charts**: Chart.js for data visualization
- **AI**: Gemini API for analysis and argument extraction
- **Data**: Static JSON files (pre-processed from backend pipeline)

## Usage

### Viewing the Dashboard

1. Visit the live site
2. Browse events by category using the tabs
3. Sort by Trending, Popular, or Newest
4. Click any event card to see detailed analytics

### Event Details Include

- AI-generated executive brief and What's at Stake analysis
- Quote Network with speaker insights and controversial/consensus entities
- Source Coverage Bias showing media sentiment distribution
- Key quotes from stakeholders (color-coded by stance, filterable by speaker)
- Financial amounts mentioned
- Sentiment trend and popularity charts
- Top entities (companies, politicians, organizations)
- Source articles with sentiment indicators (filterable by source)

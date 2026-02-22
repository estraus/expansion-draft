

# NBA Expansion Draft Simulator & AI Assistant

## Overview
An internal dashboard for basketball front offices to simulate roster protection scenarios during an expansion draft. Features a dark, analytics-grade aesthetic inspired by Bloomberg Terminal meets sports data.

## Design & Theme
- Dark mode by default with a sleek, data-dense aesthetic
- Monospace/sans-serif typography for a "terminal" feel
- Accent colors using NBA-inspired tones (blues, oranges) against dark backgrounds
- Clean data tables with subtle row highlights and hover states

## Layout (Three-Panel Design)

### 1. Left Sidebar — Team Navigation
- List of all 30 NBA teams with logos/icons
- Clicking a team highlights it and updates the main view
- Collapsible sidebar with mini icon mode
- Visual indicator showing which teams have been configured (e.g., checkmark or badge showing protected count)

### 2. Main View — Roster Table & Protection Controls
- **Protection Progress Bar** at the top: "Protected: X / 8" with a visual progress indicator
- **Data Table** with columns:
  - Player Name
  - Age
  - Position
  - Contract Value (formatted as currency)
  - AI Value Score (1–100, with color-coded badges: green for high, yellow for mid, red for low)
  - Protect Toggle (switch that disables once 8 players are protected)
- Sortable columns for quick analysis
- Row styling changes when a player is protected (subtle highlight)

### 3. Right Panel — AI GM Assistant
- **Auto-generated recommendation summary** that updates per team, suggesting which 8 players to protect based on contract efficiency and age
- Bullet-point reasoning for each recommended player
- **Chat input** at the bottom for asking questions about the roster (responses will be mock/hardcoded for now)
- Chat history displayed in a scrollable area above the input

## Data
- Mock JSON data for 3 teams (Bulls, Nuggets, Knicks) with 15 players each
- Realistic player names, ages, positions, and contract values
- Pre-generated AI Value Scores and recommendation text
- Remaining 27 teams shown in sidebar but display a "No data available" state

## Key Interactions
- Toggle protection on/off per player, hard-capped at 8
- Switching teams preserves protection state per team
- Chat input accepts text and displays mock AI responses
- Progress bar updates in real-time as toggles change

## No Backend Required
- All data is client-side mock JSON
- AI recommendations and chat responses are hardcoded
- State managed with React state (no database needed for this version)


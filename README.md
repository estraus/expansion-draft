# NBA Expansion Draft Simulator & AI Assistant

## Overview

This project is a high-fidelity, minimum viable AI product (MVP) built to help NBA front offices simulate roster protection scenarios and execute strategic planning for an upcoming league expansion (e.g., Seattle and Las Vegas). 

Designed with a dark-mode, analytics-grade aesthetic, the dashboard bridges the gap between complex basketball operations data and actionable executive decision-making. It integrates conceptual machine learning models (predicting asset value) and generative AI (summarizing insights and acting as a GM assistant).

## Key Features

* **Dual-Mode Simulation Engine:**
    * **Protection Mode:** Navigate through all 30 NBA franchises and toggle up to 8 "Protected" players per team to shield them from the expansion draft.
    * **Expansion Draft Mode:** Switch to the Seattle or Las Vegas front offices to draft a 15-man roster from the remaining pool of unprotected players across the league.
* **Explainable AI & Predictive ML (PSV):**
    * Instead of a black-box rating, the tool introduces **Projected Surplus Value (PSV)**, a metric evaluating a player's on-court efficiency against their age trajectory and contract AAV.
    * Features an "AI Methodology" modal to provide complete transparency into the math driving the forecasting.
    * Includes "Scouting TL;DR" tooltips simulating batch-processed LLM summaries of unstructured scouting reports.
* **Generative AI GM Assistant:**
    * A built-in chat interface that ingests the active, live state of the drafted rosters as context.
    * Simulates a Retrieval-Augmented Generation (RAG) workflow to answer complex, cap-compliant queries (e.g., "Build the best 5-man roster while spending under $100M").
* **Data Governance & Operational Workflows:**
    * **Export to CSV:** Download official protection lists with a single click to support front-office workflows.
    * **State Management:** Save and load different forecasting scenarios locally to compare strategic models.

---

## Technical Stack & Lovable Info

**URL**: https://expansion-draft.lovable.app

### What technologies are used for this project?

This project is built with:

* Vite
* TypeScript
* React
* shadcn-ui
* Tailwind CSS
* *(Designed for future integration with Python/scikit-learn backends and OpenAI/Gemini LLM APIs)*

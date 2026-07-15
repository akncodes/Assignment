# MarketPulse Product Requirements Document (PRD)

## 1. Executive Summary
MarketPulse is a lightweight, zero-auth, high-fidelity Indian Portfolio Simulator. It enables retail investors and stock market enthusiasts to test hypothetical allocations of Indian equities (NSE) and Mutual Funds, analyzing performance metrics over a rolling 1-year timeline against the **NIFTY 50** index.

---

## 2. Problem Statement
Many Indian investors hold assets across multiple brokers, mutual fund houses, and platforms. Simulating a consolidated portfolio or testing "what-if" allocations historically is often locked behind complex sign-up walls or premium paid services. MarketPulse provides a clean, instant, visually rich sandbox requiring no login or credential exchange.

---

## 3. Product Goals
- **Instant Usability**: Zero friction. Users can add positions immediately.
- **Accurate Benchmarking**: Contrast holdings against NIFTY 50 using actual historical quote intervals.
- **Visual Analytics**: Interactive, responsive charts showing performance, diversification, and individual asset returns.
- **Data Alignment**: Ensure clean data computations, handling stock market holidays and AMFI mutual fund reporting lags.

---

## 4. Target Audience
- Retail investors tracking both stocks and mutual funds.
- Financial students testing mock allocations.
- Long-term investors evaluating historical outperformance relative to passive indexing.

---

## 5. Core Feature Specifications

### 5.1. Portfolio Configuration
- **Add Position**: Search and select from supported NSE equities and mutual funds.
- **Input parameters**: Validates Share/Unit Quantity (positive value), purchase price, and purchase date (non-future).
- **Position Persistence**: Position lists must be saved to the client state and persist across browser reloads.
- **Delete Position**: Remove active positions immediately, triggering an automated recalculated state.

### 5.2. Unified Dashboard
- **Valuation Cards**:
  - *Portfolio Value*: Current aggregated valuation of all holdings.
  - *Amount Invested*: Total capital deployed.
  - *Today's Gain*: Absolute and percentage change compared to the previous trading day.
  - *Overall Return*: Aggregated lifetime absolute return and percentage return.
  - *Benchmark Return*: Performance of the NIFTY 50 index since the earliest purchase.
  - *Outperformance*: Difference between the portfolio return and the NIFTY 50 return.
- **Performance Chart**: A responsive line chart illustrating the 1-year trend comparing the portfolio value, total investment value, and NIFTY 50 benchmark value.
- **Asset Allocation**: A radial donut chart highlighting the breakdown of sectors/categories.
- **Asset Performance Bar Chart**: A clean bar chart showing relative returns for each asset.
- **Insights Feed**: Generates context-based text summaries highlighting diversification risks, high performers, and current data freshness flags.

### 5.3. API and Performance Processing
- Parallel request loading to reduce fetch times.
- **LOCF (Last Observation Carried Forward)** implementation for missing dates.
- Graceful error states and retry prompts when third-party feeds fail.

---

## 6. Non-Functional & Technical Requirements
- **Performance**: Dashboard loads and completes API calculations under 2 seconds.
- **Privacy & Security**: Zero server-side persistence of personal holdings. All portfolio configurations reside in the client's local browser storage.
- **Responsive Layout**: Designed first for desktop dashboards but scales gracefully down to mobile devices (using CSS flex/grid layouts and wrapping mechanisms).
- **Branding and Theme**: Modern dark mode backdrop (`#0B1220`) using vibrant gradient borders and accents.

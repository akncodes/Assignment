# MarketPulse — Indian Portfolio Simulator

MarketPulse is a modern, high-fidelity Indian Investment Portfolio Simulator. It allows retail investors and mock portfolio builders to simulate holding allocations across **NSE Stocks** and **AMFI Mutual Funds**, tracking performance over a rolling 1-year window against the **NIFTY 50** index.

---

## ✨ Features

- **Live Market Pricing**: Automated quote fetching for NSE equities (via Yahoo Finance API) and Mutual Funds NAVs (via AMFI MFAPI).
- **Benchmark Comparison**: Real-time outperformance tracking against the NIFTY 50 index (`^NSEI`).
- **Data Alignment (LOCF)**: Automatically applies Last Observation Carried Forward (LOCF) alignment to bridge trading holidays and weekend pricing gaps.
- **Visual Analytics**: Interactive, animated dashboard built with Recharts including:
  - 1-Year valuation timeline.
  - Interactive sector and asset distribution donut chart.
  - Holding returns comparison bar charts.
- **Privacy First (Zero Auth)**: Uses client-side Zustand store with local storage synchronization. All holdings remain stored in the browser's sandbox.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand.
- **Charts**: Recharts.
- **Validation**: React Hook Form, Zod.
- **APIs & Feeds**: Yahoo Finance API, public AMFI MFAPI service.

---

## 📂 Project Structure

```
├── public/                 # Static assets & icons
├── src/
│   ├── app/                # Next.js App Router Page components
│   │   ├── api/            # API endpoints (portfolio analysis & instruments lookup)
│   │   ├── add/            # Add position/holding route
│   │   ├── globals.css     # Global styles & Tailwind directives
│   │   ├── layout.tsx      # Root page layout wrapper
│   │   └── page.tsx        # Main portfolio dashboard
│   ├── components/         # Reusable React components
│   │   ├── charts/         # Area, Donut, and Bar chart wrappers
│   │   └── ui/             # Core design system elements
│   ├── hooks/              # Custom stores and state hydration hooks
│   ├── lib/                # Mathematical calculation engines & utility functions
│   ├── services/           # External API request handler services
│   └── types/              # TypeScript typings
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.x or later) and **npm** installed.

### Installation

1. Clone or download the repository to your local directory.
2. Open terminal in the directory and run:
   ```bash
   npm install
   ```

### Development Server

Launch the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

### Build and Production Deployment

To build the production bundle:
```bash
npm run build
```

And to start the production server:
```bash
npm start
```
# Assignment

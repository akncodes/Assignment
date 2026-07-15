# MarketPulse Tech Stack

MarketPulse is built using a modern, fast, and light web stack designed for real-time charting, local persistence, and parallel data parsing.

---

## 💻 Frontend Core
- **Framework**: **Next.js 16 (App Router)**
  - Utilizing React 19 Server and Client components.
- **Styling**: **Tailwind CSS v4**
  - Modular utility styling with custom design tokens for color styling, fonts, and dark mode theme.
- **State Management**: **Zustand**
  - Persistent state middleware (`persist`) synchronized to `localStorage` for zero-auth data retention.
- **Charts**: **Recharts**
  - Customizable, responsive SVG charts (`ResponsiveContainer`, `AreaChart`, `PieChart`, `BarChart`).
- **Icons**: **Lucide React**
  - Modern, minimalist outline icons.
- **Form Handling & Validation**:
  - **React Hook Form**: Lightweight, uncontrolled form rendering.
  - **Zod**: Declarative schema validation (parsing numeric bounds, date boundaries, and required fields).

---

## ⚙️ Backend Layer
- **Environment**: **Next.js Route Handlers**
  - Node.js environment handling REST calls for portfolio analysis and metadata search.
- **API Clients**:
  - **Yahoo Finance (`yahoo-finance2` NPM)**: Fetches historical quotes and live values for NSE equities and indices.
  - **Axios**: HTTP client requesting AMFI data.

---

## 🔌 Data Feeds & External APIs
1. **NSE Stocks & NIFTY 50 Index**:
   - **Source**: Yahoo Finance API.
   - **Symbols**: `.NS` suffix (e.g., `RELIANCE.NS`, `TCS.NS`) for Indian stock markets.
   - **Benchmark Index**: `^NSEI` (NIFTY 50).
2. **Mutual Funds**:
   - **Source**: MFAPI AMFI Open API (`https://api.mfapi.in/mf/...`).
   - **Identifiers**: 6-digit AMFI scheme codes (e.g., `120847`).

---

## 🛠️ Tooling & Infrastructure
- **Language**: **TypeScript 5**
- **Linters & Formatters**: ESLint, Prettier configuration.
- **Deployment & Server**: Next.js dev server.

# 🔮 MonadScope - Smart Portfolio Analyzer for Monad

**MonadScope** is a decentralized portfolio analyzer that gives you deep insights into your wallet assets on the Monad testnet. It’s not just another balance viewer — it provides **token-level risk scores**, **technical & fundamental recommendations**, and **portfolio analytics** to help you make smarter crypto decisions.

> Built for the [Monad Hackathon](https://monad.xyz), MonadScope brings portfolio intelligence to the next generation of performant blockchains.

---

## 🚀 Features

### 🔗 Wallet Integration
- Connect your EVM-compatible wallet via MetaMask.
- Fetch all tokens (MON & ERC-20) on the Monad testnet.

### 📊 Token Portfolio Dashboard
- Token list with:
  - ✅ Symbol, Name, Logo
  - ✅ Balance + USD value (mock/testnet pricing)
  - ✅ Token share in portfolio
  - ✅ 24h price movement
  - ✅ Category (Stablecoin, DeFi, L2, Meme, etc.)

### 🛡️ Risk Analysis Engine
- ✅ Holder concentration (whale risk)
- ✅ Contract age & liquidity signals
- ✅ Audit & verification status
- ✅ Token volatility & age
- (Optional off-chain risk integrations)

### 📈 Recommendation Engine
- Buy / Hold / Sell suggestions based on:
  - RSI, Moving Averages (mocked via TradingView logic)
  - Token distribution & ownership
  - Portfolio overexposure

### 📉 Analytics
- ✅ Portfolio pie chart
- ✅ Risk heatmap
- ✅ Correlation matrix
- ✅ (Coming soon) Price graph over time

### 🖥️ UI/UX
- Beautiful, responsive React UI
- Built with TailwindCSS + ShadCN
- Dark mode ready
- TradingView-style widgets & charts

---

## 🧪 Tech Stack

| Layer       | Tech                         |
|-------------|------------------------------|
| Frontend    | React + Tailwind + ShadCN UI |
| Wallets     | MetaMask, Wagmi, Ethers.js   |
| Chain       | Monad Testnet                |
| Charts      | TradingView Widget, Recharts |
| Risk Logic  | On-chain heuristics + mock APIs |
| Deployment  | Vercel / Static Hosting      |

---

## 🛠️ Setup Instructions

### 1. Clone the repo

```bash

# 🚀 MonadPay+

The UPI for crypto payments — on the Monad blockchain.

Create payment links, scan dynamic QR codes, pay in any ERC20 token (USDC, DAI, PEPE), and earn loyalty NFTs — all with near-zero fees and instant confirmation on Monad.

---

## ✨ Features

✅ **Create Payment Links:**  
Enter recipient, amount, token, and optional features like recurring payments or loyalty NFTs.

✅ **Dynamic QR Codes:**  
Share links as scannable QR codes for instant checkout from any EVM wallet.

✅ **Confirm & Pay:**  
Users review payment details and process payments on-chain via our smart contracts.

✅ **Permanent Receive QR:**  
Like your personal UPI QR — anyone can scan to pay you instantly.

✅ **Loyalty NFTs:**  
Reward customers by minting unique ERC721 tokens on successful payments.

✅ **Full History & Explorer Links:**  
Track past transactions and view details on Monad block explorer.

---

## 🏗️ Tech Stack

| Layer            | Technologies & Notes                                      |
| ---------------- | --------------------------------------------------------- |
| Frontend         | Next.js, TailwindCSS, TypeScript                          |
| Wallet / Web3    | Wagmi, RainbowKit, Viem for EVM wallet support            |
| Smart Contracts  | Solidity, Hardhat, deployed on Monad Testnet              |
| Blockchain       | Monad (EVM-compatible, high throughput, low fees)         |
| QR & Links       | `qrcode.react` for live QR code generation                |
| AI Tools         | GPT-4, Claude, Cursor IDE for rapid prototyping           |
| Styling & Anim   | Custom Tailwind theme, soft scale/glow, confetti effects  |

---

## 🚀 Quick Start

Clone this repo, install dependencies, run the local blockchain and start your frontend:

```bash
git clone https://github.com/yourusername/monadpay.git
cd monadpay

# Install dependencies
yarn install

# Start local blockchain
yarn chain

# Deploy contracts to local chain
yarn deploy

# Start Next.js app
yarn start

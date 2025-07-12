https://web3-smart-contract.vercel.app/

# 📦 Web3 Smart Contract DApp — Number Storage

> A beginner-friendly full-stack Web3 application built with Solidity, Hardhat, ethers.js, and plain HTML/JS.  
> It lets users connect their wallet, set a number on-chain, and view the stored value live — all on the Sepolia Ethereum testnet.

---

## 🚀 Live Demo

🌐 [Try it on Vercel](https://web3-smart-contract.vercel.app/)  
🦊 Requires MetaMask + Sepolia ETH

---

## 🎯 Project Pitch

This project demonstrates a complete end-to-end Web3 flow:

- ✅ Smart contract written in Solidity
- ✅ Deployed to Sepolia testnet using Hardhat
- ✅ Integrated with ethers.js in a custom HTML/JS frontend
- ✅ Live wallet connection, contract interaction, and real-time feedback
- ✅ Hosted and deployed via Vercel

The goal was to gain hands-on experience building a real decentralized app from scratch — starting from smart contract authoring to frontend integration and live deployment.

---

## 🛠️ Tech Stack

- **Solidity** — Smart contract development
- **Hardhat** — Development environment & contract deployment
- **ethers.js** — Web3 interaction from frontend
- **HTML/CSS/JS** — Simple custom frontend
- **MetaMask** — Wallet connection and transaction signing
- **Vercel** — Frontend deployment

---

## 🧾 Smart Contract Overview

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedNumber;

    function setNumber(uint256 _num) public {
        storedNumber = _num;
    }

    function getNumber() public view returns (uint256) {
        return storedNumber;
    }
}

"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi as nftAbi } from "../contracts/MyNFT.json";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
} from "../../components/ui/resizable-navbar";
import WalletButton from "../../components/WalletButton";

const MONAD_TESTNET_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual Monad testnet token address
const NFT_CONTRACT_ADDRESS = ""; // Optionally, allow user to input or fetch deployed NFT contract address

const WalletPage = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [nfts, setNfts] = useState<string[]>([]);
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Features", link: "/features" },
    { name: "Mint NFT", link: "/mint" },
    { name: "Wallet", link: "/wallet" },
  ];

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // Fetch Monad testnet token balance (ETH balance)
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));

      // Fetch NFT tokens (ERC721)
      // If contract address is known, fetch tokens owned by user
      if (NFT_CONTRACT_ADDRESS) {
        const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, provider);
        try {
          const balanceOf = await nftContract.balanceOf(address);
          const tokens: string[] = [];
          for (let i = 0; i < Number(balanceOf); i++) {
            const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
            tokens.push(tokenId.toString());
          }
          setNfts(tokens);
        } catch (err) {
          setNfts([]);
        }
      }
    };
    fetchWalletInfo();
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <WalletButton />
        </NavBody>
      </Navbar>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4 pt-10">
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
            Wallet Overview
          </h1>
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Connected Account:</span>
              <div className="break-all text-indigo-400">{account || "Not connected"}</div>
            </div>
            <div>
              <span className="font-semibold">Monad Testnet Balance:</span>
              <div className="text-green-400">{balance} ETH</div>
            </div>
            <div>
              <span className="font-semibold">NFTs Owned:</span>
              {NFT_CONTRACT_ADDRESS ? (
                nfts.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {nfts.map((id) => (
                      <li key={id}>Token ID: {id}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No NFTs found.</div>
                )
              ) : (
                <div className="text-gray-400">No NFT contract address set.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;

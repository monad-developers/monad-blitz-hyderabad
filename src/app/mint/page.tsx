"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { toast } from "react-hot-toast";
import { abi, bytecode } from "../contracts/MyNFT.json";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
} from "../../components/ui/resizable-navbar";
import WalletButton from "../../components/WalletButton";


declare global {
  interface Window {
    ethereum?: any;
  }
}

const PINATA_API_KEY = "f164ad740faf39d06063";
const PINATA_SECRET_API_KEY =
  "afe43af5fb321a57110b09e52332eec2344d18b62bb7ee83049ff324da08c3f9";

const MintPage = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [attributes, setAttributes] = useState("");
  const [supply, setSupply] = useState(1);
  const [price, setPrice] = useState("0"); // in ETH, for display only
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [minting, setMinting] = useState(false);
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Features", link: "/features" },
    { name: "Mint NFT", link: "/mint" },
    { name: "Wallet", link: "/wallet" },
  ];

  const handleUploadImage = async () => {
    if (!imageFile) throw new Error("No image selected");

    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    const cid = res.data.IpfsHash;
    return {
      cid,
      uri: `https://gateway.pinata.cloud/ipfs/${cid}`,
    };
  };

  const uploadMetadata = async (imageUri: string) => {
    const metadata = {
      name,
      description,
      creator,
      price, // for information purposes
      attributes: attributes.split(",").map((attr) => attr.trim()),
      image: imageUri,
    };

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    const cid = res.data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  const deployAndMint = async () => {
    if (!name || !symbol || !description || !imageFile) {
      toast.error("Please fill all fields and select an image");
      return;
    }

    try {
      setDeploying(true);
      toast("Uploading image to IPFS…");
      const { uri: imageUri } = await handleUploadImage();

      toast("Uploading metadata to IPFS…");
      const metadataUri = await uploadMetadata(imageUri);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      toast("Deploying ERC721 contract…");
      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      const contract = (await factory.deploy(
        name,
        symbol
      )) as ethers.Contract & {
        mintNFT: (recipient: string, tokenURI: string) => Promise<ethers.ContractTransactionResponse>;
      };
      await contract.waitForDeployment();

      const addr = await contract.getAddress();
      setContractAddress(addr);
      toast.success(`Contract deployed at ${addr}`);

      setMinting(true);

      const recipient = await signer.getAddress();
      for (let i = 0; i < supply; i++) {
        toast(`Minting NFT ${i + 1}/${supply}…`);
        const tx = await contract.mintNFT(recipient, metadataUri);
        await tx.wait();
      }

      toast.success(`Minted ${supply} NFT${supply > 1 ? "s" : ""}!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error during deployment/mint");
    } finally {
      setDeploying(false);
      setMinting(false);
    }
  };

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
    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
        Mint Your NFT Collection
      </h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Collection Name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Symbol"
          className="input"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="input h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Creator Name"
          className="input"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
        />
        <input
          type="text"
          placeholder="Attributes (comma-separated)"
          className="input"
          value={attributes}
          onChange={(e) => setAttributes(e.target.value)}
        />

        <div className="flex gap-4">
          <input
            type="number"
            min="1"
            placeholder="Supply"
            className="input w-1/2"
            value={supply}
            onChange={(e) => setSupply(Number(e.target.value))}
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Price per NFT (ETH)"
            className="input w-1/2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <label className="flex flex-col items-center px-4 py-6 bg-indigo-50 text-indigo-700 rounded-lg shadow cursor-pointer hover:bg-indigo-100">
          <span className="font-semibold">Choose an Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <span className="text-xs mt-1">
            {imageFile ? imageFile.name : "No file chosen"}
          </span>
        </label>

        <button
          className={`w-full py-3 rounded-lg text-white font-bold transition ${
            deploying || minting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
          }`}
          disabled={deploying || minting}
          onClick={deployAndMint}
        >
          {deploying
            ? "Deploying…"
            : minting
            ? "Minting…"
            : "🚀 Deploy & Mint NFT"}
        </button>

        {contractAddress && (
          <p className="mt-4 text-center text-sm">
            Deployed Contract:{" "}
            <a
              href={`https://monadscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 underline"
            >
              {contractAddress}
            </a>
          </p>
        )}
      </div>
    </div>
  </div>
  </div>
);
};

export default MintPage;

"use client";
import { NavbarButton } from "../components/ui/resizable-navbar";
import { useWallet } from "../hooks/wallet-context";

const WalletButton = () => {
  const { account, connect, disconnect } = useWallet();

  if (!account) {
    return (
      <NavbarButton as="button" onClick={connect}>
        Connect Wallet
      </NavbarButton>
    );
  }

  return (
    <NavbarButton
      as="button"
      onClick={disconnect}
      variant="secondary"
      className="text-xs px-2 py-1"
    >
      {account.slice(0, 6)}...{account.slice(-4)}
    </NavbarButton>
  );
};

export default WalletButton;

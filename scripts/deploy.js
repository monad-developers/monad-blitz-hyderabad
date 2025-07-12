const hre = require("hardhat");

// Ethers v6: get formatEther directly from hre.ethers
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(
    "Account balance:",
    hre.ethers.formatEther(balance), // ✅ v6: .formatEther is at root, not utils
    "ETH"
  );

  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();

  await certificateNFT.waitForDeployment(); // ✅ v6

  console.log("CertificateNFT deployed to:", certificateNFT.target); // ✅ v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

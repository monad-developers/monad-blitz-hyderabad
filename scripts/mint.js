const hre = require("hardhat");

async function main() {
  const contractAddress = "0xD771193A8722bEe6d9Edeb2b1cd01a87Dc8C6897"; // your deployed contract address

  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const certificateNFT = CertificateNFT.attach(contractAddress);

  // Replace with actual values
  const studentWallet = "0xStudentWalletAddressHere";
  const studentName = "Alice Johnson";
  const courseName = "Artificial Intelligence Basics";
  const issueDate = "2025-07-12";
  const grade = "A+";
  const ipfsHash = "QmExampleIPFSHash";

  const tx = await certificateNFT.mintCertificate(
    studentWallet,
    studentName,
    courseName,
    issueDate,
    grade,
    ipfsHash
  );

  console.log("Mint transaction sent, waiting for confirmation...");
  await tx.wait();

  console.log(`NFT certificate minted successfully for ${studentName} to wallet ${studentWallet}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

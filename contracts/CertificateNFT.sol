// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    struct CertificateData {
        string studentName;
        string courseName;
        string issueDate;
        string grade;
        string ipfsHash;
    }

    mapping(uint256 => CertificateData) private certificateData;

    constructor() ERC721("EduProofCertificate", "EDUPROOF") Ownable(msg.sender) {}

    function mintCertificate(
        address studentWallet,
        string memory studentName,
        string memory courseName,
        string memory issueDate,
        string memory grade,
        string memory ipfsHash
    ) public onlyOwner {
        uint256 tokenId = nextTokenId;
        _safeMint(studentWallet, tokenId);
        certificateData[tokenId] = CertificateData(
            studentName,
            courseName,
            issueDate,
            grade,
            ipfsHash
        );
        nextTokenId++;
    }

    function getCertificateData(uint256 tokenId)
        public
        view
        returns (CertificateData memory)
    {
        require(tokenId < nextTokenId, "Certificate does not exist");
        return certificateData[tokenId];
    }
}

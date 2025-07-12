// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

interface IPVerseCompany {
    struct Company {
        bytes32 registrationNumber;
        address createdBy;
        string name;
        string contactEmail;
        string[] legalDocs;
        uint256 createdAt;
    }

    function getCompany(bytes32 registrationNumber) external view returns (Company memory);
    function registrationNumberExists(bytes32 registrationNumber) external view returns (bool);
    function createCompany(
        bytes32 registrationNumber,
        address createdBy,
        string memory name,
        string memory contactEmail,
        string[] memory legalDocs,
        uint256 createdAt
    ) external returns (bytes32);
}

interface IPVerseAssets {
    struct ProjectInput {
        address company;
        string title;
        uint8 category;
        uint8 ipType;
        uint256 totalTokens;
        uint256 tokenPrice;
        string[] documents;
    }

    function createProject(ProjectInput memory input) external returns (uint256);
}

contract IPVerseFactory is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");

    IPVerseCompany public companyContract;
    IPVerseAssets public assetsContract;

    struct ProjectInput {
        bytes32 registrationNumber;
        string title;
        uint8 category;
        uint8 ipType;
        uint256 totalTokens;
        uint256 tokenPrice;
        string[] documents;
    }

    struct CompanyInput {
        bytes32 registrationNumber;
        address createdBy;
        string name;
        string contactEmail;
        string[] legalDocs;
        uint256 createdAt;
    }

    mapping(bytes32 => uint256[]) public companyProjects;

    event CompanyRegistered(bytes32 indexed registrationNumber, string name, address createdBy);
    event ProjectCreated(bytes32 indexed registrationNumber, uint256 indexed projectId, string title);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);
    event ContractUpgraded(address indexed newImplementation);

    error InvalidInput(string message);
    error Unauthorized(string message);
    error CompanyNotFound(bytes32 registrationNumber);
    error InvalidContractAddress(address contractAddress);

    function initialize(address _companyContract, address _assetsContract) public initializer {
        if (_companyContract == address(0) || _assetsContract == address(0))
            revert InvalidContractAddress(address(0));

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __Ownable_init(msg.sender);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        companyContract = IPVerseCompany(_companyContract);
        assetsContract = IPVerseAssets(_assetsContract);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        emit ContractUpgraded(newImplementation);
    }

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert Unauthorized("Caller is not an admin");
        _;
    }

    modifier onlyCompany(bytes32 registrationNumber) {
        IPVerseCompany.Company memory company = companyContract.getCompany(registrationNumber);
        if (!hasRole(COMPANY_ROLE, msg.sender) || msg.sender != company.createdBy)
            revert Unauthorized("Caller is not an authorized company");
        _;
    }
function registerCompany(CompanyInput memory input) public onlyAdmin whenNotPaused returns (bytes32) {
    console.log("registerCompany called by:", msg.sender);
    console.log("Company name:", input.name);
    console.log("Contact email:", input.contactEmail);
    console.log("Legal docs count:", input.legalDocs.length);
    console.log("Created at timestamp:", input.createdAt);

    bytes32 regNum = companyContract.createCompany(
        input.registrationNumber,
        msg.sender,
        input.name,
        input.contactEmail,
        input.legalDocs,
        input.createdAt
    );

    
    console.log("Company created successfully.");

    _grantRole(COMPANY_ROLE, msg.sender);
    console.log("COMPANY_ROLE granted to:", msg.sender);

    emit CompanyRegistered(regNum, input.name, msg.sender);
    console.log("CompanyRegistered event emitted.");

    return regNum;
}


    function createProject(ProjectInput memory input) public onlyCompany(input.registrationNumber) whenNotPaused returns (uint256) {
    console.log("createProject called by:", msg.sender);
    console.log("Title:", input.title);
    console.log("Category:", input.category);
    console.log("IP Type:", input.ipType);
    console.log("Documents count:", input.documents.length);
    console.log("Total Tokens:", input.totalTokens);
    console.log("Token Price:", input.tokenPrice);

    if (!companyContract.registrationNumberExists(input.registrationNumber)) 
        revert CompanyNotFound(input.registrationNumber);

    if (input.category > 7) revert InvalidInput("Invalid category");
    if (input.ipType > 4) revert InvalidInput("Invalid IP type");
    if (input.documents.length > 10) revert InvalidInput("Too many documents");

    IPVerseCompany.Company memory company = companyContract.getCompany(input.registrationNumber);
    console.log("Company loaded. Created by:", company.createdBy);

    IPVerseAssets.ProjectInput memory projectInput = IPVerseAssets.ProjectInput({
        company: company.createdBy,
        title: input.title,
        category: input.category,
        ipType: input.ipType,
        totalTokens: input.totalTokens,
        tokenPrice: input.tokenPrice,
        documents: input.documents
    });

    uint256 projectId = assetsContract.createProject(projectInput);
    console.log("New Project ID returned:", projectId);

    companyProjects[input.registrationNumber].push(projectId);
    console.log("Project ID added to companyProjects mapping.");

    emit ProjectCreated(input.registrationNumber, projectId, input.title);
    return projectId;
}


    function getCompanyProjects(bytes32 registrationNumber)
        public
        view
        returns (uint256[] memory)
    {
        if (!companyContract.registrationNumberExists(registrationNumber)) 
            revert CompanyNotFound(registrationNumber);
        return companyProjects[registrationNumber];
    }

    function pause() public onlyAdmin {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() public onlyAdmin {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
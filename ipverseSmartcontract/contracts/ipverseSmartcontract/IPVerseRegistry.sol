// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

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
}

interface IPVerseAssets {
    struct Project {
        uint256 projectId;
        address company;
        string title;
        uint8 category;
        uint8 ipType;
        uint256 totalTokens;
        uint256 tokenPrice;
        uint8 status;
        string[] documents;
        address createdBy;
        bytes32 fingerprint;
    }

    function getProject(uint256 projectId) external view returns (Project memory);
}

contract IPVerseRegistry is
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

    struct Company {
        bytes32 registrationNumber;
        address createdBy;
        string name;
        string contactEmail;
        string[] legalDocs;
        uint256 createdAt;
        bytes32 fingerprint;
    }

    struct Project {
        uint256 projectId;
        bytes32 registrationNumber;
        address company;
        string title;
        uint8 category;
        uint8 ipType;
        uint256 totalTokens;
        uint256 tokenPrice;
        uint8 status;
        string[] documents;
        address createdBy;
        bytes32 fingerprint;
    }

    struct CompanyInput {
        bytes32 registrationNumber;
        string name;
        string contactEmail;
        string[] legalDocs;
    }

    mapping(bytes32 => Company) public companies;
    mapping(uint256 => bool) public projectExists;
    mapping(bytes32 => uint256[]) public companyProjects;
    mapping(bytes32 => bool) public registrationNumberExists;

    event CompanyRegistered(bytes32 indexed registrationNumber, string name, bytes32 fingerprint);
    event CompanyUpdated(bytes32 indexed registrationNumber, string name, bytes32 fingerprint);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);
    event ContractUpgraded(address indexed newImplementation);

    error InvalidInput(string message);
    error Unauthorized(string message);
    error CompanyNotFound(bytes32 registrationNumber);
    error ProjectNotFound(uint256 projectId);
    error InvalidIPFSCID(string cid);
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

    function registerCompany(CompanyInput memory input) public onlyAdmin whenNotPaused returns (bytes32) {
        bytes32 regNum = input.registrationNumber;
        if (registrationNumberExists[regNum]) revert InvalidInput("Registration number exists");
        _validateCompanyInput(input);

        bytes32 fingerprint = keccak256(abi.encodePacked(
            regNum, input.name, input.contactEmail
        ));

        companies[regNum] = Company({
            registrationNumber: regNum,
            createdBy: msg.sender,
            name: input.name,
            contactEmail: input.contactEmail,
            legalDocs: input.legalDocs,
            createdAt: block.timestamp,
            fingerprint: fingerprint
        });

        registrationNumberExists[regNum] = true;
        _grantRole(COMPANY_ROLE, msg.sender);

        emit CompanyRegistered(regNum, input.name, fingerprint);
        return regNum;
    }

    function updateCompany(CompanyInput memory input) public onlyAdmin whenNotPaused {
        bytes32 regNum = input.registrationNumber;
        if (!registrationNumberExists[regNum]) revert CompanyNotFound(regNum);
        _validateCompanyInput(input);

        bytes32 fingerprint = keccak256(abi.encodePacked(
            regNum, input.name, input.contactEmail
        ));

        Company storage company = companies[regNum];
        company.name = input.name;
        company.contactEmail = input.contactEmail;
        company.legalDocs = input.legalDocs;
        company.fingerprint = fingerprint;

        emit CompanyUpdated(regNum, input.name, fingerprint);
    }

    function getCompany(bytes32 registrationNumber) public view returns (
        bytes32 regNumber,
        address createdBy,
        string memory name,
        string memory contactEmail,
        string[] memory legalDocs,
        uint256 createdAt
    ) {
        if (!registrationNumberExists[registrationNumber]) revert CompanyNotFound(registrationNumber);
        Company storage company = companies[registrationNumber];
        return (
            company.registrationNumber,
            company.createdBy,
            company.name,
            company.contactEmail,
            company.legalDocs,
            company.createdAt
        );
    }

    function getProject(uint256 projectId) public view returns (Project memory) {
        if (!projectExists[projectId]) revert ProjectNotFound(projectId);
        IPVerseAssets.Project memory assetProject = assetsContract.getProject(projectId);
        
        // Derive registrationNumber from company address
        bytes32 registrationNumber;
        try companyContract.getCompany(keccak256(abi.encodePacked(assetProject.company))) returns (
            IPVerseCompany.Company memory company
        ) {
            registrationNumber = company.registrationNumber;
        } catch {
            revert CompanyNotFound(keccak256(abi.encodePacked(assetProject.company)));
        }

        bytes32 fingerprint = keccak256(abi.encode(
            projectId,
            registrationNumber,
            assetProject.company,
            assetProject.title,
            assetProject.category,
            assetProject.ipType,
            assetProject.totalTokens,
            assetProject.tokenPrice,
            assetProject.status
        ));

        return Project({
            projectId: assetProject.projectId,
            registrationNumber: registrationNumber,
            company: assetProject.company,
            title: assetProject.title,
            category: assetProject.category,
            ipType: assetProject.ipType,
            totalTokens: assetProject.totalTokens,
            tokenPrice: assetProject.tokenPrice,
            status: assetProject.status,
            documents: assetProject.documents,
            createdBy: assetProject.createdBy,
            fingerprint: fingerprint
        });
    }

    function getCompanyProjects(bytes32 registrationNumber) public view returns (uint256[] memory) {
        if (!registrationNumberExists[registrationNumber]) revert CompanyNotFound(registrationNumber);
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

    function _validateCompanyInput(CompanyInput memory input) private pure {
        if (bytes32(input.registrationNumber).length == 0) revert InvalidInput("Registration number is required");
        if (bytes(input.name).length == 0 || bytes(input.name).length > 100)
            revert InvalidInput("Name must be 1-100 characters");
        if (bytes(input.contactEmail).length == 0 || !_isValidEmail(input.contactEmail))
            revert InvalidInput("Invalid contact email");
        for (uint256 i = 0; i < input.legalDocs.length; i++) {
            if (bytes(input.legalDocs[i]).length > 0 && !_isValidIPFSCID(input.legalDocs[i]))
                revert InvalidIPFSCID(input.legalDocs[i]);
        }
    }

    function _isValidEmail(string memory email) private pure returns (bool) {
        bytes memory emailBytes = bytes(email);
        bool hasAt = false;
        bool hasDot = false;
        uint256 atIndex = 0;

        for (uint256 i = 0; i < emailBytes.length; i++) {
            if (emailBytes[i] == "@") {
                if (hasAt || i == 0 || i == emailBytes.length - 1) return false;
                hasAt = true;
                atIndex = i;
            } else if (emailBytes[i] == "." && hasAt && i > atIndex + 1 && i < emailBytes.length - 1) {
                hasDot = true;
            }
        }
        return hasAt && hasDot;
    }

    function _isValidIPFSCID(string memory cid) private pure returns (bool) {
        bytes memory cidBytes = bytes(cid);
        if (cidBytes.length < 46 || cidBytes.length > 59) return false;
        if (
            (cidBytes[0] == "Q" && cidBytes[1] == "m") ||
            (cidBytes[0] == "b" && cidBytes[1] == "a" && cidBytes[2] == "f" && cidBytes[3] == "y")
        ) {
            for (uint256 i = 0; i < cidBytes.length; i++) {
                bytes1 char = cidBytes[i];
                if (
                    !(char >= "0" && char <= "9") &&
                    !(char >= "A" && char <= "Z") &&
                    !(char >= "a" && char <= "z")
                ) {
                    return false;
                }
            }
            return true;
        }
        return false;
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
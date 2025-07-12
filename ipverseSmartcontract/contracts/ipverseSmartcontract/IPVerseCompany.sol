// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract IPVerseCompany is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Company {
        bytes32 registrationNumber;
        address createdBy;
        string name;
        string contactEmail;
        string[] legalDocs;
        uint256 createdAt;
    }

    struct CompanyInput {
        bytes32 registrationNumber;
        address createdBy;
        string name;
        string contactEmail;
        string[] legalDocs;
        uint256 createdAt;
    }

    mapping(bytes32 => Company) public companies;
    mapping(bytes32 => bool) public registrationNumberExists;

    event CompanyCreated(bytes32 indexed registrationNumber, string name, address createdBy);
    event CompanyUpdated(bytes32 indexed registrationNumber, string name, uint256 updatedAt);
    event LegalDocsAdded(bytes32 indexed registrationNumber, string[] legalDocs);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);
    event ContractUpgraded(address indexed newImplementation);

    error InvalidInput(string message);
    error Unauthorized(string message);
    error RegistrationNumberExists(bytes32 registrationNumber);
    error CompanyNotFound(bytes32 registrationNumber);
    error InvalidIPFSCID(string cid);

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __Ownable_init(msg.sender);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        emit ContractUpgraded(newImplementation);
    }

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert Unauthorized("Caller is not an admin");
        _;
    }

    function createCompany(CompanyInput memory input) public onlyAdmin whenNotPaused returns (bytes32) {
        bytes32 regNum = keccak256(abi.encodePacked(input.registrationNumber));
        if (registrationNumberExists[regNum]) revert RegistrationNumberExists(regNum);
        _validateCompanyInput(input);

        Company storage company = companies[regNum];
        company.registrationNumber = regNum;
        company.createdBy = msg.sender;
        company.name = input.name;
        company.contactEmail = input.contactEmail;
        company.legalDocs = new string[](input.legalDocs.length);
        for (uint256 i = 0; i < input.legalDocs.length; i++) {
            company.legalDocs[i] = input.legalDocs[i];
        }
        company.createdAt = block.timestamp;

        registrationNumberExists[regNum] = true;

        emit CompanyCreated(regNum, input.name, msg.sender);
        if (input.legalDocs.length > 0) {
            emit LegalDocsAdded(regNum, input.legalDocs);
        }
        return regNum;
    }

    function updateCompany(CompanyInput memory input) public onlyAdmin whenNotPaused {
        bytes32 regNum = keccak256(abi.encodePacked(input.registrationNumber));
        if (!registrationNumberExists[regNum]) revert CompanyNotFound(regNum);
        _validateCompanyInput(input);

        Company storage company = companies[regNum];
        company.name = input.name;
        company.contactEmail = input.contactEmail;
        company.legalDocs = new string[](input.legalDocs.length);
        for (uint256 i = 0; i < input.legalDocs.length; i++) {
            company.legalDocs[i] = input.legalDocs[i];
        }
        company.createdAt = input.createdAt;

        emit CompanyUpdated(regNum, input.name, block.timestamp);
        if (input.legalDocs.length > 0) {
            emit LegalDocsAdded(regNum, input.legalDocs);
        }
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

    function addLegalDocs(bytes32 registrationNumber, string[] memory legalDocs)
        public
        onlyAdmin
        whenNotPaused
    {
        if (!registrationNumberExists[registrationNumber]) revert CompanyNotFound(registrationNumber);
        for (uint256 i = 0; i < legalDocs.length; i++) {
            if (bytes(legalDocs[i]).length > 0 && !_isValidIPFSCID(legalDocs[i])) revert InvalidIPFSCID(legalDocs[i]);
        }

        Company storage company = companies[registrationNumber];
        for (uint256 i = 0; i < legalDocs.length; i++) {
            if (bytes(legalDocs[i]).length > 0) {
                company.legalDocs.push(legalDocs[i]);
            }
        }
        company.createdAt = block.timestamp;

        emit LegalDocsAdded(registrationNumber, legalDocs);
        emit CompanyUpdated(registrationNumber, company.name, block.timestamp);
    }

    function getCompany(bytes32 registrationNumber) public view returns (Company memory) {
        if (!registrationNumberExists[registrationNumber]) revert CompanyNotFound(registrationNumber);
        return companies[registrationNumber];
    }

    function pause() public onlyAdmin {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() public onlyAdmin {
        _unpause();
        emit ContractUnpaused(msg.sender);
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
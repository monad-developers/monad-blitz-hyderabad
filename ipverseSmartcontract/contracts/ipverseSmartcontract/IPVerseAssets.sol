// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract IPVerseAssets is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    enum Category { Music, Games, Characters, Art, Patents, Culture, Technology, Antiques }
    enum IPType { UtilityPatent, DesignPatent, Trademark, Copyright, TradeSecret }
    enum Status { Draft, Active, Funded, Closed, Cancelled }

    struct ProjectInput {
        address company;
        string title;
        uint8 category;
        uint8 ipType;
        uint256 totalTokens;
        uint256 tokenPrice;
        string[] documents;
    }

    struct Project {
        uint256 projectId;
        address company;
        string title;
        Category category;
        IPType ipType;
        uint256 totalTokens;
        uint256 tokenPrice;
        Status status;
        string[] documents;
        address createdBy;
        bytes32 fingerprint;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    string public contractVersion;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed company,
        string title,
        bytes32 fingerprint
    );
    event TokensPurchased(
        uint256 indexed projectId,
        address indexed buyer,
        uint256 amount,
        uint256 cost
    );
    event ProjectStatusUpdated(uint256 indexed projectId, Status status);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);
    event ContractUpgraded(address indexed newImplementation);

    error InvalidInput(string message);
    error Unauthorized(string message);
    error ProjectNotFound(uint256 projectId);
    error InsufficientFunds(uint256 required, uint256 provided);

    function initialize() public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __Ownable_init(msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        contractVersion = "1.0.0";
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {
        emit ContractUpgraded(newImplementation);
    }

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert Unauthorized("Caller is not an admin");
        _;
    }

    modifier onlyCompany(uint256 projectId) {
        if (!hasRole(COMPANY_ROLE, msg.sender) || projects[projectId].company != msg.sender)
            revert Unauthorized("Caller is not the project company");
        _;
    }

    modifier whenNotPausedOrClosed(uint256 projectId) {
        if (paused()) revert InvalidInput("Contract is paused");
        if (projects[projectId].status == Status.Closed || projects[projectId].status == Status.Cancelled)
            revert InvalidInput("Project is closed or cancelled");
        _;
    }

    function createProject(ProjectInput calldata input) public onlyAdmin whenNotPaused returns (uint256) {
        projectCount++;
        uint256 projectId = projectCount;

        Project storage project = projects[projectId];
        project.projectId = projectId;
        project.company = input.company;
        project.title = input.title;
        project.status = Status.Draft;
        project.category = Category(input.category);
        project.ipType = IPType(input.ipType);
        project.totalTokens = input.totalTokens;
        project.tokenPrice = input.tokenPrice;
        project.createdBy = msg.sender;

        // Manually copy documents array to avoid calldata to storage issue
        project.documents = new string[](input.documents.length);
        for (uint256 i = 0; i < input.documents.length; i++) {
            project.documents[i] = input.documents[i];
        }

        _validateProjectInput(input);
        project.fingerprint = _calculateProjectFingerprint(projectId);

        _grantRole(COMPANY_ROLE, input.company);

        emit ProjectCreated(projectId, input.company, input.title, project.fingerprint);

        return projectId;
    }

    function _validateProjectInput(ProjectInput calldata input) private pure {
        if (input.company == address(0)) revert InvalidInput("Invalid company address");
        if (input.category > uint8(Category.Antiques)) revert InvalidInput("Invalid category");
        if (input.ipType > uint8(IPType.TradeSecret)) revert InvalidInput("Invalid IP type");
        if (bytes(input.title).length == 0 || bytes(input.title).length > 100)
            revert InvalidInput("Title must be 1-100 characters");
        if (input.totalTokens == 0) revert InvalidInput("Must have at least 1 token");
        if (input.tokenPrice < 0.01 ether) revert InvalidInput("Token price must be at least 0.01 ETH");

        if (input.documents.length > 10) revert InvalidInput("Too many documents");
        for (uint256 i = 0; i < input.documents.length; i++) {
            if (bytes(input.documents[i]).length > 0 && !_isValidIPFSCID(input.documents[i]))
                revert InvalidInput("Invalid document CID");
        }
    }

    function _calculateProjectFingerprint(uint256 projectId) private view returns (bytes32) {
        Project storage project = projects[projectId];
        return keccak256(
            abi.encode(
                projectId,
                project.company,
                project.title,
                project.category,
                project.ipType,
                project.totalTokens,
                project.tokenPrice
            )
        );
    }

    function buyTokens(uint256 projectId, uint256 amount)
        public
        payable
        nonReentrant
        whenNotPausedOrClosed(projectId)
    {
        Project storage project = projects[projectId];
        if (project.projectId == 0) revert ProjectNotFound(projectId);
        if (project.status != Status.Active) revert InvalidInput("Project is not active");
        if (amount == 0) revert InvalidInput("Must purchase at least 1 token");

        uint256 cost = amount * project.tokenPrice;
        if (msg.value < cost) revert InsufficientFunds(cost, msg.value);

        _mint(msg.sender, projectId, amount, "");

        emit TokensPurchased(projectId, msg.sender, amount, cost);

        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    function getProject(uint256 projectId) public view returns (Project memory) {
        if (projects[projectId].projectId == 0) revert ProjectNotFound(projectId);
        return projects[projectId];
    }

    function getProjectBasics(uint256 projectId)
        public
        view
        returns (
            uint256 projectId_,
            address company,
            string memory title,
            uint8 category,
            uint8 ipType
        )
    {
        Project storage project = projects[projectId];
        if (project.projectId == 0) revert ProjectNotFound(projectId);
        return (
            project.projectId,
            project.company,
            project.title,
            uint8(project.category),
            uint8(project.ipType)
        );
    }

    function updateProjectStatus(uint256 projectId, Status status) public onlyAdmin whenNotPaused {
        if (projects[projectId].projectId == 0) revert ProjectNotFound(projectId);
        projects[projectId].status = status;
        emit ProjectStatusUpdated(projectId, status);
    }

    function pause() public onlyAdmin {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() public onlyAdmin {
        _unpause();
        emit ContractUnpaused(msg.sender);
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
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function version() public view returns (string memory) {
        return contractVersion;
    }
}
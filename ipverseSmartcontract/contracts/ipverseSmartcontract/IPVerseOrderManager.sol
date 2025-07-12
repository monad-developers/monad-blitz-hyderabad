// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

interface IPVerseRegistry {
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

    function getCompany(bytes32 registrationNumber) external view returns (
        bytes32 regNumber, // Renamed to avoid conflict with input parameter
        address createdBy,
        string memory logoUrl,
        string memory name,
        string memory description,
        string memory address_,
        string memory contactEmail,
        string memory contactPhone,
        uint256 projectId,
        string[] memory legalDocs,
        uint256 createdAt,
        uint256 updatedAt
    );
    function getProject(uint256 projectId) external view returns (Project memory);
    function registrationNumberExists(bytes32 registrationNumber) external view returns (bool);
}

contract IPVerseOrderManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");

    IPVerseRegistry public registerContract;
    IERC1155Upgradeable public assetsContract;

    enum OrderType { Buy, Sell }
    enum OrderStatus { Open, Executed, Cancelled, Expired }

    struct OrderInput {
        bytes32 registrationNumber;
        uint256 projectId;
        OrderType orderType;
        uint256 tokenAmount;
        uint256 pricePerToken;
        uint256 deadline;
    }

    struct Order {
        uint256 orderId;
        address creator;
        bytes32 registrationNumber;
        uint256 projectId;
        OrderType orderType;
        OrderStatus status;
        uint256 tokenAmount;
        uint256 pricePerToken;
        uint256 totalPrice;
        uint256 deadline;
        bytes32 fingerprint;
    }

    uint256 public orderCount;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => uint256) public escrowEther;
    mapping(uint256 => uint256) public escrowTokens;
    mapping(address => mapping(uint256 => uint256)) public userTokenBalances;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed creator,
        bytes32 indexed registrationNumber,
        uint256 projectId,
        OrderType orderType,
        uint256 tokenAmount,
        uint256 totalPrice,
        uint256 deadline,
        bytes32 fingerprint
    );
    event OrderExecuted(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 tokenAmount,
        uint256 totalPrice
    );
    event OrderCancelled(uint256 indexed orderId, address indexed creator);
    event OrderExpired(uint256 indexed orderId);
    event EscrowDeposited(uint256 indexed orderId, address indexed depositor, uint256 amount, bool isEther);
    event EscrowReleased(uint256 indexed orderId, address indexed recipient, uint256 amount, bool isEther);
    event EscrowRefunded(uint256 indexed orderId, address indexed recipient, uint256 amount, bool isEther);
    event TokensTransferred(
        uint256 indexed projectId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);
    event ContractUpgraded(address indexed newImplementation);

    error InvalidInput(string message);
    error Unauthorized(string message);
    error OrderNotFound(uint256 orderId);
    error OrderNotOpen(uint256 orderId);
    error InsufficientBalance(uint256 projectId, uint256 required, uint256 available);
    error InsufficientFunds(uint256 required, uint256 provided);
    error InvalidContractAddress(address contractAddress);
    error DeadlineExpired(uint256 orderId);
    error EscrowNotFound(uint256 orderId);
    error ProjectNotFound(uint256 projectId);
    error ProjectNotActive(uint256 projectId);

    function initialize(address _registerContract, address _assetsContract) public initializer {
        if (_registerContract == address(0) || _assetsContract == address(0))
            revert InvalidContractAddress(address(0));

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __Ownable_init(msg.sender);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        registerContract = IPVerseRegistry(_registerContract);
        assetsContract = IERC1155Upgradeable(_assetsContract);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        emit ContractUpgraded(newImplementation);
    }

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert Unauthorized("Caller is not an admin");
        _;
    }

    modifier onlyCompany(bytes32 registrationNumber) {
        (bytes32 regNum, address createdBy,,,,,,,,,,) = registerContract.getCompany(registrationNumber);
        if (!hasRole(COMPANY_ROLE, msg.sender) || msg.sender != createdBy || regNum != registrationNumber)
            revert Unauthorized("Caller is not an authorized company");
        _;
    }

    function createOrder(OrderInput memory input) public payable whenNotPaused nonReentrant returns (uint256) {
        if (!registerContract.registrationNumberExists(input.registrationNumber))
            revert InvalidInput("Company not found");

        IPVerseRegistry.Project memory project = registerContract.getProject(input.projectId);
        if (project.projectId == 0) revert ProjectNotFound(input.projectId);
        if (project.registrationNumber != input.registrationNumber)
            revert InvalidInput("Project does not belong to company");
        if (project.status != 1) // Assuming 1 is Status.Active
            revert ProjectNotActive(input.projectId);
        if (input.tokenAmount == 0 || input.tokenAmount > project.totalTokens)
            revert InvalidInput("Invalid token amount");
        if (input.pricePerToken < project.tokenPrice)
            revert InvalidInput("Price per token below project minimum");
        if (input.deadline <= block.timestamp)
            revert InvalidInput("Deadline must be in the future");

        orderCount++;
        uint256 orderId = orderCount;
        uint256 totalPrice = input.tokenAmount * input.pricePerToken;

        Order memory newOrder = Order({
            orderId: orderId,
            creator: msg.sender,
            registrationNumber: input.registrationNumber,
            projectId: input.projectId,
            orderType: input.orderType,
            status: OrderStatus.Open,
            tokenAmount: input.tokenAmount,
            pricePerToken: input.pricePerToken,
            totalPrice: totalPrice,
            deadline: input.deadline,
            fingerprint: bytes32(0)
        });

        newOrder.fingerprint = keccak256(abi.encode(
            newOrder.creator,
            newOrder.registrationNumber,
            newOrder.projectId,
            newOrder.orderType,
            newOrder.tokenAmount,
            newOrder.pricePerToken,
            newOrder.deadline
        ));

        if (input.orderType == OrderType.Sell) {
            uint256 balance = assetsContract.balanceOf(msg.sender, input.projectId);
            if (balance < input.tokenAmount) revert InsufficientBalance(input.projectId, input.tokenAmount, balance);
            if (!assetsContract.isApprovedForAll(msg.sender, address(this)))
                revert Unauthorized("Contract not approved to transfer tokens");
            assetsContract.safeTransferFrom(msg.sender, address(this), input.projectId, input.tokenAmount, "");
            escrowTokens[orderId] = input.tokenAmount;
            emit EscrowDeposited(orderId, msg.sender, input.tokenAmount, false);
        } else {
            if (msg.value < totalPrice) revert InsufficientFunds(totalPrice, msg.value);
            escrowEther[orderId] = totalPrice;
            emit EscrowDeposited(orderId, msg.sender, totalPrice, true);
        }

        orders[orderId] = newOrder;

        emit OrderCreated(
            orderId,
            msg.sender,
            input.registrationNumber,
            input.projectId,
            input.orderType,
            input.tokenAmount,
            totalPrice,
            input.deadline,
            newOrder.fingerprint
        );

        if (input.orderType == OrderType.Buy && msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        return orderId;
    }

    function executeOrder(uint256 orderId) public payable whenNotPaused nonReentrant {
        Order storage order = orders[orderId];
        if (order.orderId == 0) revert OrderNotFound(orderId);
        if (order.status != OrderStatus.Open) revert OrderNotOpen(orderId);
        if (order.deadline < block.timestamp) {
            order.status = OrderStatus.Expired;
            emit OrderExpired(orderId);
            revert DeadlineExpired(orderId);
        }

        IPVerseRegistry.Project memory project = registerContract.getProject(order.projectId);
        if (project.projectId == 0) revert ProjectNotFound(order.projectId);
        if (project.status != 1) revert ProjectNotActive(order.projectId);
        if (project.registrationNumber != order.registrationNumber)
            revert InvalidInput("Project does not belong to company");

        if (order.orderType == OrderType.Buy) {
            uint256 balance = assetsContract.balanceOf(msg.sender, order.projectId);
            if (balance < order.tokenAmount) revert InsufficientBalance(order.projectId, order.tokenAmount, balance);
            if (escrowEther[orderId] == 0) revert EscrowNotFound(orderId);
            if (!assetsContract.isApprovedForAll(msg.sender, address(this)))
                revert Unauthorized("Contract not approved to transfer tokens");

            order.status = OrderStatus.Executed;
            assetsContract.safeTransferFrom(msg.sender, order.creator, order.projectId, order.tokenAmount, "");
            payable(msg.sender).transfer(escrowEther[orderId]);
            emit EscrowReleased(orderId, msg.sender, escrowEther[orderId], true);
            emit OrderExecuted(orderId, order.creator, msg.sender, order.tokenAmount, order.totalPrice);
            emit TokensTransferred(order.projectId, msg.sender, order.creator, order.tokenAmount);

            escrowEther[orderId] = 0;
        } else {
            if (msg.value < order.totalPrice) revert InsufficientFunds(order.totalPrice, msg.value);
            if (escrowTokens[orderId] == 0) revert EscrowNotFound(orderId);

            order.status = OrderStatus.Executed;
            assetsContract.safeTransferFrom(address(this), msg.sender, order.projectId, order.tokenAmount, "");
            payable(order.creator).transfer(order.totalPrice);
            emit EscrowReleased(orderId, msg.sender, order.tokenAmount, false);
            emit EscrowReleased(orderId, order.creator, order.totalPrice, true);
            emit OrderExecuted(orderId, msg.sender, order.creator, order.tokenAmount, order.totalPrice);
            emit TokensTransferred(order.projectId, address(this), msg.sender, order.tokenAmount);

            escrowTokens[orderId] = 0;
            if (msg.value > order.totalPrice) {
                payable(msg.sender).transfer(msg.value - order.totalPrice);
            }
        }

        userTokenBalances[order.creator][order.projectId] = assetsContract.balanceOf(order.creator, order.projectId);
        userTokenBalances[msg.sender][order.projectId] = assetsContract.balanceOf(msg.sender, order.projectId);
    }

    function cancelOrder(uint256 orderId) public whenNotPaused nonReentrant {
        Order storage order = orders[orderId];
        if (order.orderId == 0) revert OrderNotFound(orderId);
        if (order.status != OrderStatus.Open) revert OrderNotOpen(orderId);
        if (msg.sender != order.creator && !hasRole(ADMIN_ROLE, msg.sender))
            revert Unauthorized("Only creator or admin can cancel");

        order.status = OrderStatus.Cancelled;

        if (order.orderType == OrderType.Sell) {
            if (escrowTokens[orderId] == 0) revert EscrowNotFound(orderId);
            assetsContract.safeTransferFrom(address(this), order.creator, order.projectId, order.tokenAmount, "");
            emit EscrowRefunded(orderId, order.creator, escrowTokens[orderId], false);
            emit TokensTransferred(order.projectId, address(this), order.creator, order.tokenAmount);
            escrowTokens[orderId] = 0;
        } else {
            if (escrowEther[orderId] == 0) revert EscrowNotFound(orderId);
            payable(order.creator).transfer(escrowEther[orderId]);
            emit EscrowRefunded(orderId, order.creator, escrowEther[orderId], true);
            escrowEther[orderId] = 0;
        }

        emit OrderCancelled(orderId, order.creator);
    }

    function cleanExpiredOrders(uint256[] memory orderIds) public onlyAdmin whenNotPaused nonReentrant {
        for (uint256 i = 0; i < orderIds.length; i++) {
            uint256 orderId = orderIds[i];
            Order storage order = orders[orderId];
            if (order.orderId == 0 || order.status != OrderStatus.Open || order.deadline >= block.timestamp) continue;

            order.status = OrderStatus.Expired;

            if (order.orderType == OrderType.Sell) {
                if (escrowTokens[orderId] > 0) {
                    assetsContract.safeTransferFrom(address(this), order.creator, order.projectId, order.tokenAmount, "");
                    emit EscrowRefunded(orderId, order.creator, escrowTokens[orderId], false);
                    emit TokensTransferred(order.projectId, address(this), order.creator, order.tokenAmount);
                    escrowTokens[orderId] = 0;
                }
            } else {
                if (escrowEther[orderId] > 0) {
                    payable(order.creator).transfer(escrowEther[orderId]);
                    emit EscrowRefunded(orderId, order.creator, escrowEther[orderId], true);
                    escrowEther[orderId] = 0;
                }
            }

            emit OrderExpired(orderId);
        }
    }

    function getOrder(uint256 orderId) public view returns (Order memory) {
        if (orders[orderId].orderId == 0) revert OrderNotFound(orderId);
        return orders[orderId];
    }

    function getEscrowBalance(uint256 orderId) public view returns (uint256 etherAmount, uint256 tokenAmount) {
        return (escrowEther[orderId], escrowTokens[orderId]);
    }

    function getUserTokenBalance(address user, uint256 projectId) public view returns (uint256) {
        return assetsContract.balanceOf(user, projectId);
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
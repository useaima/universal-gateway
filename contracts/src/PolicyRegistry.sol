// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PolicyRegistry {
    struct PolicyProfile {
        bytes32 policyHash;
        uint256 dailyLimitUsdCents;
        uint64 updatedAt;
        bool exists;
    }

    address public owner;
    mapping(address => PolicyProfile) public profiles;
    mapping(address => mapping(bytes32 => bool)) public authorizedNetworks;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PolicyProfileUpdated(
        address indexed operator,
        bytes32 indexed policyHash,
        uint256 dailyLimitUsdCents,
        bytes32[] enabledNetworks
    );
    event NetworkAuthorizationUpdated(
        address indexed operator,
        bytes32 indexed networkKey,
        bool authorized
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "POLICY_ONLY_OWNER");
        _;
    }

    modifier onlyOwnerOrOperator(address operator) {
        require(msg.sender == owner || msg.sender == operator, "POLICY_NOT_AUTHORIZED");
        _;
    }

    constructor(address owner_) {
        require(owner_ != address(0), "POLICY_INVALID_OWNER");
        owner = owner_;
        emit OwnershipTransferred(address(0), owner_);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "POLICY_INVALID_OWNER");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setPolicyProfile(
        address operator,
        bytes32 policyHash,
        uint256 dailyLimitUsdCents,
        bytes32[] calldata enabledNetworks
    ) external onlyOwnerOrOperator(operator) {
        require(operator != address(0), "POLICY_INVALID_OPERATOR");

        profiles[operator] = PolicyProfile({
            policyHash: policyHash,
            dailyLimitUsdCents: dailyLimitUsdCents,
            updatedAt: uint64(block.timestamp),
            exists: true
        });

        for (uint256 i = 0; i < enabledNetworks.length; i++) {
            authorizedNetworks[operator][enabledNetworks[i]] = true;
            emit NetworkAuthorizationUpdated(operator, enabledNetworks[i], true);
        }

        emit PolicyProfileUpdated(operator, policyHash, dailyLimitUsdCents, enabledNetworks);
    }

    function setNetworkAuthorization(
        address operator,
        bytes32 networkKey,
        bool authorized
    ) external onlyOwnerOrOperator(operator) {
        require(operator != address(0), "POLICY_INVALID_OPERATOR");
        authorizedNetworks[operator][networkKey] = authorized;
        emit NetworkAuthorizationUpdated(operator, networkKey, authorized);
    }

    function getPolicyProfile(address operator)
        external
        view
        returns (bytes32 policyHash, uint256 dailyLimitUsdCents, uint64 updatedAt, bool exists)
    {
        PolicyProfile memory profile = profiles[operator];
        return (
            profile.policyHash,
            profile.dailyLimitUsdCents,
            profile.updatedAt,
            profile.exists
        );
    }
}

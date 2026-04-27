// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "./IERC20.sol";

contract TreasuryReceiver {
    address public owner;
    address public settlementToken;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event SettlementTokenUpdated(address indexed previousToken, address indexed newToken);
    event NativeReceived(address indexed payer, uint256 amount, bytes32 indexed reference);
    event PaymentReceived(
        address indexed payer,
        address indexed token,
        uint256 amount,
        string paymentId,
        bytes32 indexed metadataHash
    );
    event NativeWithdrawn(address indexed recipient, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "TREASURY_ONLY_OWNER");
        _;
    }

    constructor(address settlementToken_, address owner_) {
        require(owner_ != address(0), "TREASURY_INVALID_OWNER");
        owner = owner_;
        settlementToken = settlementToken_;
        emit OwnershipTransferred(address(0), owner_);
    }

    receive() external payable {
        emit NativeReceived(msg.sender, msg.value, bytes32(0));
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TREASURY_INVALID_OWNER");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function updateSettlementToken(address newToken) external onlyOwner {
        emit SettlementTokenUpdated(settlementToken, newToken);
        settlementToken = newToken;
    }

    function recordBasePayPayment(
        address payer,
        uint256 amount,
        string calldata paymentId,
        bytes32 metadataHash
    ) external onlyOwner {
        emit PaymentReceived(payer, settlementToken, amount, paymentId, metadataHash);
    }

    function withdrawNative(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "TREASURY_INVALID_RECIPIENT");
        require(address(this).balance >= amount, "TREASURY_INSUFFICIENT_NATIVE");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "TREASURY_NATIVE_WITHDRAW_FAILED");
        emit NativeWithdrawn(recipient, amount);
    }

    function withdrawToken(address token, address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "TREASURY_INVALID_RECIPIENT");
        require(IERC20(token).transfer(recipient, amount), "TREASURY_TOKEN_WITHDRAW_FAILED");
        emit TokenWithdrawn(token, recipient, amount);
    }

    function tokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}

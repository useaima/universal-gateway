// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ExecutionReceiptRegistry {
    struct ExecutionReceipt {
        bytes32 digest;
        bytes32 policySnapshot;
        bytes32 paymentReference;
        address operator;
        uint64 recordedAt;
        string network;
    }

    address public owner;
    mapping(bytes32 => ExecutionReceipt) public receipts;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ExecutionReceiptPosted(
        bytes32 indexed executionId,
        bytes32 indexed digest,
        address indexed operator,
        string network,
        bytes32 policySnapshot,
        bytes32 paymentReference
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "RECEIPT_ONLY_OWNER");
        _;
    }

    constructor(address owner_) {
        require(owner_ != address(0), "RECEIPT_INVALID_OWNER");
        owner = owner_;
        emit OwnershipTransferred(address(0), owner_);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RECEIPT_INVALID_OWNER");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function postReceipt(
        bytes32 executionId,
        bytes32 digest,
        bytes32 policySnapshot,
        bytes32 paymentReference,
        address operator,
        string calldata network
    ) external onlyOwner {
        require(operator != address(0), "RECEIPT_INVALID_OPERATOR");
        require(receipts[executionId].recordedAt == 0, "RECEIPT_ALREADY_RECORDED");

        receipts[executionId] = ExecutionReceipt({
            digest: digest,
            policySnapshot: policySnapshot,
            paymentReference: paymentReference,
            operator: operator,
            recordedAt: uint64(block.timestamp),
            network: network
        });

        emit ExecutionReceiptPosted(
            executionId,
            digest,
            operator,
            network,
            policySnapshot,
            paymentReference
        );
    }
}

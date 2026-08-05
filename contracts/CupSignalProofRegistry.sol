// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CupSignalProofRegistry {
    struct ProofAnchor {
        bytes32 proofSha256;
        bytes32 cctpMemoSha256;
        string proofUri;
        uint64 anchoredAt;
        address submitter;
    }

    address public immutable owner;
    ProofAnchor private latest;

    event ProofAnchored(
        bytes32 indexed proofSha256,
        bytes32 indexed cctpMemoSha256,
        string proofUri,
        uint64 anchoredAt,
        address indexed submitter
    );

    error Unauthorized();
    error EmptyProofHash();
    error EmptyProofUri();

    constructor() {
        owner = msg.sender;
    }

    function anchorProof(bytes32 proofSha256, bytes32 cctpMemoSha256, string calldata proofUri) external {
        if (msg.sender != owner) revert Unauthorized();
        if (proofSha256 == bytes32(0)) revert EmptyProofHash();
        if (bytes(proofUri).length == 0) revert EmptyProofUri();

        uint64 timestamp = uint64(block.timestamp);
        latest = ProofAnchor({
            proofSha256: proofSha256,
            cctpMemoSha256: cctpMemoSha256,
            proofUri: proofUri,
            anchoredAt: timestamp,
            submitter: msg.sender
        });

        emit ProofAnchored(proofSha256, cctpMemoSha256, proofUri, timestamp, msg.sender);
    }

    function latestProof() external view returns (ProofAnchor memory) {
        return latest;
    }
}

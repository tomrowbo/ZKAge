# ZKTap Circuit Implementation

This directory contains the circuit implementation for ZKTap's zero-knowledge proof system, built with Foundry and VLayer.

## 🔒 Overview

The ZKTap circuit implementation handles the cryptographic core of the system - the zero-knowledge proofs that allow users to prove facts without revealing personal information. This component is responsible for defining the circuit logic that verifies claims cryptographically.

## 💡 Features

- **Age Verification Circuit**: Verifies a user is over 18 without revealing their actual age
- **NFT Ownership Circuit**: Proves ownership of an NFT without revealing the wallet address
- **Membership Verification**: Validates membership status without exposing identity
- **VLayer Integration**: Leverages VLayer for efficient zk-SNARK generation

## 📋 Circuit Architecture

- Circuit constraints that verify:
  - Valid NFT ownership
  - Valid age verification
  - Signature validation
  - Timestamp checking

## 🚀 Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)
- [VLayer SDK](https://github.com/vlayer-xyz/vlayer-sdk)
- Solidity 0.8.x
- Access to an Ethereum node (for testing)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   forge install
   ```

## 🔧 Development

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Local Development

Start a local Ethereum node:
```bash
anvil
```

## 🧩 Circuit Logic

The core circuit logic validates that:

1. The prover owns an ERC-721 token from the verified age contract
2. The token ID corresponds to a valid age verification
3. The token hasn't been revoked
4. Additional constraints for privacy preservation

This allows users to prove they meet age requirements without revealing their wallet address, token ID, or personal information.

## 🔍 Integration with ZKTap System

These circuits provide the cryptographic foundation for the ZKTap system:

1. User obtains an Age Verification NFT through the verification process
2. The ZKTap mobile app uses these circuits to generate a zero-knowledge proof
3. The proof is transmitted via NFC to the reader
4. The reader verifies the proof cryptographically

## 📚 Learn More

For more information on Foundry:
https://book.getfoundry.sh/

For more information on VLayer:
https://book.vlayer.xyz/

## 📝 License

[MIT License](../LICENSE)

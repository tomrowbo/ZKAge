# ZKTap VLayer Integration

This component integrates VLayer's zero-knowledge proof technology with the ZKTap system to generate and verify privacy-preserving proofs for identity claims.

## 🔒 Overview

VLayer provides the cryptographic backbone for ZKTap's privacy technology, enabling users to prove facts about themselves without revealing personal information. This integration handles proof generation and verification.

## 💡 Features

- **zk-SNARK Proof Generation**: Creates compact (~750 bytes) zero-knowledge proofs
- **Proof Verification**: Validates proofs cryptographically without revealing data
- **API Server**: Exposes endpoints for the ZKTap mobile and reader apps
- **Multiple Environments**: Supports development, testnet, and mainnet deployments

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Docker and Docker Compose for local development
- Node.js 16+ (alternative to Bun)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

### Running the Local Development Environment

1. Start the local development network:
   ```bash
   bun run devnet:up
   ```

2. Run the proof generation service:
   ```bash
   bun run prove:dev
   ```

3. Run the API server:
   ```bash
   bun run api:dev
   ```

## 🔧 Configuration

Environment variables can be set to configure the service:

- `VLAYER_ENV`: Set to `dev`, `testnet`, or `mainnet`
- `API_PORT`: Port for the API server (default: 3000)
- `RPC_URL`: Ethereum RPC URL for the selected environment

## 📖 API Endpoints

### Proof Generation

- **POST /api/generate-proof**
  - Generates a proof for a specific claim
  - Requires wallet address and claim type

### Proof Verification

- **POST /api/verify-proof**
  - Verifies a provided proof
  - Returns verification result

## 🔍 Technical Details

- Proof size: ~750 bytes
- Verification time: <100ms
- Circuit compatibility: Age verification, membership, ticket ownership

## 🧪 Testing

Run tests with:

```bash
bun run test-web:dev
```

## 📚 Learn More

Learn how to run this example here:  
https://book.vlayer.xyz/getting-started/first-steps.html

## 📝 License

[MIT License](../../LICENSE)
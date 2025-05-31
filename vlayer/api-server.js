import express from 'express';
import cors from 'cors';
import { createVlayerClient } from "@vlayer/sdk";
import {
  getConfig,
  createContext,
} from "@vlayer/sdk/config";

// Mock ABI objects since we don't need the full contract info
const proverAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balance",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "bytes4",
                "name": "verifierSelector",
                "type": "bytes4"
              },
              {
                "internalType": "bytes32[8]",
                "name": "seal",
                "type": "bytes32[8]"
              },
              {
                "internalType": "enum Mode",
                "name": "mode",
                "type": "uint8"
              }
            ],
            "internalType": "struct Seal",
            "name": "seal",
            "type": "tuple"
          },
          {
            "internalType": "bytes32",
            "name": "callGuestId",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "length",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "proverContractAddress",
                "type": "address"
              },
              {
                "internalType": "bytes4",
                "name": "functionSelector",
                "type": "bytes4"
              },
              {
                "internalType": "bytes32",
                "name": "settleChainId",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "settleBlockNumber",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "settleBlockHash",
                "type": "bytes32"
              }
            ],
            "internalType": "struct CallAssumptions",
            "name": "callAssumptions",
            "type": "tuple"
          }
        ],
        "internalType": "struct Proof",
        "name": "",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Custom JSON middleware to handle BigInt
app.use(express.json());
app.use((req, res, next) => {
  // Override res.json to handle BigInt serialization
  const originalJson = res.json;
  res.json = function(obj) {
    return originalJson.call(this, JSON.parse(JSON.stringify(obj, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    )));
  };
  next();
});

// Hardcoded contract addresses
const CONTRACTS = {
  AGE_VERIFICATION_NFT: "0xd542B1ab9DD7065CC66ded19CE3dA42d41d8B15C",
  PROVER: "0x1670276ab1398f62848cf8d63c00061130ffb93f",
  VERIFIER: "0xadc19d3b918f76259f631353614a81f390173b16"
};

// Global variable for custodial wallet
let userWallet; // This simulates a custodial wallet for demo purposes

// Initialize wallet
async function initializeWallet() {
  const config = getConfig();
  const {
    account: john,
  } = createContext(config);

  if (!john) {
    throw new Error(
      "No account found make sure EXAMPLES_TEST_PRIVATE_KEY is set in your environment variables",
    );
  }

  // In our hackathon demo, we're using a server-side wallet
  // In a real implementation, this would be done on the Android device
  userWallet = john;
  console.log(`Custodial wallet initialized for demo: ${userWallet.address}`);

  return true;
}

// API Endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Age Verification API is running',
    note: 'This demo simulates a custodial wallet for the hackathon. In a real implementation, proof generation would happen on the Android device.',
    contracts: CONTRACTS
  });
});

app.post('/verify-age', async (req, res) => {
  try {
    // In a hackathon demo, we're using a server-side wallet (userWallet)
    // In a real implementation, the address would come from the mobile app's local wallet
    
    // Ensure wallet is initialized
    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not initialized yet' });
    }

    const config = getConfig();
    const {
      chain,
      proverUrl,
    } = createContext(config);

    // Create proof using the custodial wallet
    console.log(`Generating proof for custodial wallet: ${userWallet.address}`);
    const vlayer = createVlayerClient({
      url: proverUrl,
      token: config.token,
    });

    const hash = await vlayer.prove({
      address: CONTRACTS.PROVER,
      proverAbi: proverAbi,
      functionName: "balance",
      args: [userWallet.address],
      chainId: chain.id,
      gasLimit: config.gasLimit,
    });

    const result = await vlayer.waitForProvingResult({ hash });
    const [proof, owner, nftBalance] = result;

    // Manually convert any BigInt values in the proof to strings
    const safeProof = JSON.parse(JSON.stringify(proof, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    ));

    // Return proof result
    res.json({
      success: true,
      demoNote: "This is a hackathon demo using a server-side custodial wallet. In production, proofs would be generated on-device.",
      proof: safeProof,
      owner: owner,
      nftBalance: nftBalance.toString(),
      isVerified: nftBalance > 0,
      contracts: CONTRACTS
    });
  } catch (error) {
    console.error('Error generating proof:', error);
    res.status(500).json({ error: error.message });
  }
});

// This endpoint would normally not exist in a real implementation
// It's just for the hackathon demo to show the custodial wallet address
app.get('/demo-wallet', (req, res) => {
  if (!userWallet) {
    return res.status(500).json({ error: 'Wallet not initialized yet' });
  }
  
  res.json({
    demoNote: "This endpoint only exists for the hackathon demo. In production, the wallet would be on the user's device.",
    walletAddress: userWallet.address,
    contracts: CONTRACTS
  });
});

// New endpoint for privacy-preserving NFC verification
app.get('/nfc-proof', async (req, res) => {
  try {
    // Ensure wallet is initialized
    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not initialized yet' });
    }

    const config = getConfig();
    const {
      chain,
      proverUrl,
    } = createContext(config);

    // Create proof using the custodial wallet
    console.log(`Generating proof for custodial wallet: ${userWallet.address}`);
    const vlayer = createVlayerClient({
      url: proverUrl,
      token: config.token,
    });

    const hash = await vlayer.prove({
      address: CONTRACTS.PROVER,
      proverAbi: proverAbi,
      functionName: "balance",
      args: [userWallet.address],
      chainId: chain.id,
      gasLimit: config.gasLimit,
    });

    const result = await vlayer.waitForProvingResult({ hash });
    const [proof, owner, nftBalance] = result;

    // Extract only the verification-relevant parts
    // Remove any identifying information
    const privacyPreservingProof = {
      // Keep only the cryptographic seal and verification data
      proofData: {
        seal: proof.seal,
        length: proof.length,
        // Anonymize the callAssumptions
        callAssumptions: {
          proverContractAddress: proof.callAssumptions.proverContractAddress,
          functionSelector: proof.callAssumptions.functionSelector,
          settleChainId: proof.callAssumptions.settleChainId,
          settleBlockNumber: proof.callAssumptions.settleBlockNumber,
          settleBlockHash: proof.callAssumptions.settleBlockHash
        }
      },
      // Just a boolean - no actual balance value
      isVerified: nftBalance > 0,
      // Include verification timestamp
      timestamp: new Date().toISOString()
    };

    // Return stripped proof result for NFC transmission
    res.json({
      privacyNote: "This proof is designed to be transmitted via NFC without revealing the user's wallet address",
      verificationProof: privacyPreservingProof,
    });
  } catch (error) {
    console.error('Error generating privacy-preserving proof:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using hardcoded contract addresses:`);
  console.log(` - Age NFT: ${CONTRACTS.AGE_VERIFICATION_NFT}`);
  console.log(` - Prover: ${CONTRACTS.PROVER}`);
  console.log(` - Verifier: ${CONTRACTS.VERIFIER}`);
  console.log(`HACKATHON DEMO NOTE: This server simulates a custodial wallet. In production, proofs would be generated on-device.`);
  
  // Initialize wallet on startup
  try {
    await initializeWallet();
    console.log('Wallet initialized successfully');
  } catch (error) {
    console.error('Failed to initialize wallet:', error);
  }
}); 
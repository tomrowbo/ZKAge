import express from 'express';
import cors from 'cors';
import { createVlayerClient } from "@vlayer/sdk";
import proverSpec from "../out/SimpleProver.sol/SimpleProver";
import verifierSpec from "../out/SimpleVerifier.sol/SimpleVerifier";
import {
  getConfig,
  createContext,
} from "@vlayer/sdk/config";

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
      proverAbi: proverSpec.abi,
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
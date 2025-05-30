import { createVlayerClient } from "@vlayer/sdk";
import nftSpec from "../out/ExampleNFT.sol/ExampleNFT";
import proverSpec from "../out/SimpleProver.sol/SimpleProver";
import verifierSpec from "../out/SimpleVerifier.sol/SimpleVerifier";
import {
  getConfig,
  createContext,
  deployVlayerContracts,
  waitForContractDeploy,
} from "@vlayer/sdk/config";

const config = getConfig();
const {
  chain,
  ethClient,
  account: john,
  proverUrl,
  confirmations,
} = createContext(config);

if (!john) {
  throw new Error(
    "No account found make sure EXAMPLES_TEST_PRIVATE_KEY is set in your environment variables",
  );
}

// Instead of deploying a new token, use the existing Age Verification NFT
const AGE_VERIFICATION_NFT_ADDRESS = "0xd542B1ab9DD7065CC66ded19CE3dA42d41d8B15C";

const nftDeployTransactionHash = await ethClient.deployContract({
  abi: nftSpec.abi,
  bytecode: nftSpec.bytecode.object,
  account: john,
  args: [],
});

const nftContractAddress = await waitForContractDeploy({
  client: ethClient,
  hash: nftDeployTransactionHash,
});

const { prover, verifier } = await deployVlayerContracts({
  proverSpec,
  verifierSpec,
  proverArgs: [AGE_VERIFICATION_NFT_ADDRESS],
  verifierArgs: [nftContractAddress],
});

console.log("Proving...");
const vlayer = createVlayerClient({
  url: proverUrl,
  token: config.token,
});

const hash = await vlayer.prove({
  address: prover,
  proverAbi: proverSpec.abi,
  functionName: "balance",
  args: [john.address],
  chainId: chain.id,
  gasLimit: config.gasLimit,
});
const result = await vlayer.waitForProvingResult({ hash });
const [proof, owner, nftBalance] = result;

console.log("Proof result:", result);
// Workaround for viem estimating gas with `latest` block causing future block assumptions to fail on slower chains like mainnet/sepolia
const gas = await ethClient.estimateContractGas({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "claimWhale",
  args: [proof, owner, nftBalance],
  account: john,
  blockTag: "pending",
});

const verificationHash = await ethClient.writeContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "claimWhale",
  args: [proof, owner, nftBalance],
  account: john,
  gas,
});

const receipt = await ethClient.waitForTransactionReceipt({
  hash: verificationHash,
  confirmations,
  retryCount: 60,
  retryDelay: 1000,
});

console.log(`Verification result: ${receipt.status}`);

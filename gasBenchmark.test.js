const fs = require("fs");
const path = require("path");

const SimpleHTLC = artifacts.require("SimpleHTLC");
const RoleOrchestrated = artifacts.require("RoleOrchestrated");
const ThresholdHTLC = artifacts.require("ThresholdHTLC");
const MerkleRelay = artifacts.require("MerkleRelay");

contract("Gas Benchmark", async (accounts) => {
  let simpleHTLC, roleOrchestrated, thresholdHTLC, merkleRelay;
  const gasResults = {};

  const hashlock = web3.utils.sha3("benchmark-secret");
  const timelock = 300;
  const threshold = 2;
  const signers = [accounts[1], accounts[2]];
  const role = web3.utils.keccak256("ORCHESTRATOR");
  const commitment = web3.utils.sha3("threshold-lock");
  const dummyMerkleRoot = web3.utils.sha3("dummy-root");

  it("Code 1: SimpleHTLC - deploy and measure gas", async () => {
    const deployed = await SimpleHTLC.new(hashlock, timelock);
    const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
    const tx = await deployed.lock(web3.utils.sha3("secret1"), accounts[1], 100);

    gasResults["SimpleHTLC"] = {
      deploymentGas: deployTx.gasUsed,
      executionGas: tx.receipt.gasUsed
    };
  });

  it("Code 2: RoleOrchestrated - deploy and measure gas", async () => {
    const deployed = await RoleOrchestrated.new();
    const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
    const tx = await deployed.grantRole(role, accounts[1]);

    gasResults["RoleOrchestrated"] = {
      deploymentGas: deployTx.gasUsed,
      executionGas: tx.receipt.gasUsed
    };
  });

  it("Code 3: ThresholdHTLC - deploy and measure gas", async () => {
    const deployed = await ThresholdHTLC.new(signers, threshold);
    const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
    const tx = await deployed.lock(commitment);

    gasResults["ThresholdHTLC"] = {
      deploymentGas: deployTx.gasUsed,
      executionGas: tx.receipt.gasUsed
    };
  });

  it("Code 4: MerkleRelay - deploy and measure gas", async () => {
    const deployed = await MerkleRelay.new(dummyMerkleRoot);
    const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
    const leaf = web3.utils.sha3("leaf");
    const proof = [];
    const root = dummyMerkleRoot;

    const tx = await deployed.verifyWithGas(proof, leaf, root);

    gasResults["MerkleRelay"] = {
      deploymentGas: deployTx.gasUsed,
      executionGas: tx.receipt.gasUsed
    };
  });

  after(async () => {
    fs.writeFileSync(
      path.join(__dirname, "../gas-results.json"),
      JSON.stringify(gasResults, null, 2)
    );
    console.log(" gas-results.json written.");
  });
});

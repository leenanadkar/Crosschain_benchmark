const fs = require("fs");
const path = require("path");

const SimpleHTLC = artifacts.require("SimpleHTLC");
const RoleOrchestrated = artifacts.require("RoleOrchestrated");
const ThresholdHTLC = artifacts.require("ThresholdHTLC");
const MerkleRelay = artifacts.require("MerkleRelay");

contract("Gas Benchmark", async (accounts) => {
  const gasResults = {};
  const runs = 10;

  const hashlock = web3.utils.sha3("benchmark-secret");
  const timelock = 300;
  const threshold = 2;
  const signers = [accounts[1], accounts[2]];
  const role = web3.utils.keccak256("ORCHESTRATOR");
  const commitment = web3.utils.sha3("threshold-lock");
  const dummyMerkleRoot = web3.utils.sha3("dummy-root");

  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const stdDev = (values) => {
    const avg = mean(values);
    const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  };

  const record = (name, deploymentGasRuns, executionGasRuns) => {
    const deploymentGas = mean(deploymentGasRuns);
    const executionGas = mean(executionGasRuns);

    gasResults[name] = {
      runs,
      deploymentGas,
      executionGas,
      deploymentGasStdDev: stdDev(deploymentGasRuns),
      executionGasStdDev: stdDev(executionGasRuns),
      deploymentGasRuns,
      executionGasRuns
    };
  };

  it("Code 1: SimpleHTLC - deploy and measure gas", async () => {
    const deploymentGasRuns = [];
    const executionGasRuns = [];

    for (let i = 0; i < runs; i++) {
      const deployed = await SimpleHTLC.new(hashlock, timelock);
      const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
      const tx = await deployed.lock(web3.utils.sha3(`secret-${i}`), accounts[1], 100);
      deploymentGasRuns.push(deployTx.gasUsed);
      executionGasRuns.push(tx.receipt.gasUsed);
    }

    record("SimpleHTLC", deploymentGasRuns, executionGasRuns);
  });

  it("Code 2: RoleOrchestrated - deploy and measure gas", async () => {
    const deploymentGasRuns = [];
    const executionGasRuns = [];

    for (let i = 0; i < runs; i++) {
      const deployed = await RoleOrchestrated.new();
      const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
      const tx = await deployed.grantRole(role, accounts[1]);
      deploymentGasRuns.push(deployTx.gasUsed);
      executionGasRuns.push(tx.receipt.gasUsed);
    }

    record("RoleOrchestrated", deploymentGasRuns, executionGasRuns);
  });

  it("Code 3: ThresholdHTLC - deploy and measure gas", async () => {
    const deploymentGasRuns = [];
    const executionGasRuns = [];

    for (let i = 0; i < runs; i++) {
      const deployed = await ThresholdHTLC.new(signers, threshold);
      const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
      const tx = await deployed.lock(web3.utils.sha3(`${commitment}-${i}`));
      deploymentGasRuns.push(deployTx.gasUsed);
      executionGasRuns.push(tx.receipt.gasUsed);
    }

    record("ThresholdHTLC", deploymentGasRuns, executionGasRuns);
  });

  it("Code 4: MerkleRelay - deploy and measure gas", async () => {
    const deploymentGasRuns = [];
    const executionGasRuns = [];
    const proof = [];
    const root = dummyMerkleRoot;

    for (let i = 0; i < runs; i++) {
      const deployed = await MerkleRelay.new(dummyMerkleRoot);
      const deployTx = await web3.eth.getTransactionReceipt(deployed.transactionHash);
      const leaf = web3.utils.sha3(`leaf-${i}`);
      const tx = await deployed.verifyWithGas(proof, leaf, root);
      deploymentGasRuns.push(deployTx.gasUsed);
      executionGasRuns.push(tx.receipt.gasUsed);
    }

    record("MerkleRelay", deploymentGasRuns, executionGasRuns);
  });

  after(async () => {
    fs.writeFileSync(
      path.join(__dirname, "../gas-results.json"),
      JSON.stringify(gasResults, null, 2)
    );
    console.log(" gas-results.json written.");
  });
});

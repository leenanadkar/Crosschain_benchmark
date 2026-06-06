/**
 * Gas Benchmark Test — n=10 repeated runs per contract
 * Computes mean ± SD for execution gas across 10 identical calls.
 * Outputs gas-results.json with per-contract mean, sd, and raw runs.
 *
 * Run: truffle test ./gasBenchmark.test.js
 */

const fs   = require("fs");
const path = require("path");

const SimpleHTLC      = artifacts.require("SimpleHTLC");
const RoleOrchestrated = artifacts.require("RoleOrchestrated");
const ThresholdHTLC   = artifacts.require("ThresholdHTLC");
const MerkleRelay     = artifacts.require("MerkleRelay");

const N_RUNS = 10;

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sd(arr) {
  const m = mean(arr);
  const variance = arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

contract("Gas Benchmark (n=10)", async (accounts) => {
  const gasResults = {};

  const hashlock   = web3.utils.sha3("benchmark-secret");
  const timelock   = 300;
  const threshold  = 2;
  const signers    = [accounts[1], accounts[2]];
  const role       = web3.utils.keccak256("ORCHESTRATOR");
  const commitment = web3.utils.sha3("threshold-lock");
  const dummyRoot  = web3.utils.sha3("dummy-root");

  it("Code 1: SimpleHTLC — 10 runs of lock()", async () => {
    const runs = [];
    for (let i = 0; i < N_RUNS; i++) {
      // Fresh deploy each run so isLocked is reset
      const deployed = await SimpleHTLC.new(hashlock, timelock);
      const tx = await deployed.lock(web3.utils.sha3("secret" + i), accounts[1], 100);
      runs.push(tx.receipt.gasUsed);
    }
    const m = mean(runs);
    const s = sd(runs);
    console.log(`SimpleHTLC    — mean: ${m.toFixed(1)}, SD: ${s.toFixed(1)}, runs: ${JSON.stringify(runs)}`);
    gasResults["SimpleHTLC"] = { mean: parseFloat(m.toFixed(1)), sd: parseFloat(s.toFixed(1)), runs };
  });

  it("Code 2: RoleOrchestrated — 10 runs of grantRole()", async () => {
    const deployed = await RoleOrchestrated.new();
    const runs = [];
    // Use different role hashes each run to avoid storage warm/cold variance
    for (let i = 0; i < N_RUNS; i++) {
      const r = web3.utils.keccak256("ROLE_" + i);
      const tx = await deployed.grantRole(r, accounts[1]);
      runs.push(tx.receipt.gasUsed);
    }
    const m = mean(runs);
    const s = sd(runs);
    console.log(`RoleOrchestrated — mean: ${m.toFixed(1)}, SD: ${s.toFixed(1)}, runs: ${JSON.stringify(runs)}`);
    gasResults["RoleOrchestrated"] = { mean: parseFloat(m.toFixed(1)), sd: parseFloat(s.toFixed(1)), runs };
  });

  it("Code 3: ThresholdHTLC — 10 runs of lock()", async () => {
    const deployed = await ThresholdHTLC.new(signers, threshold);
    const runs = [];
    for (let i = 0; i < N_RUNS; i++) {
      const c = web3.utils.sha3("commitment-" + i);
      const tx = await deployed.lock(c);
      runs.push(tx.receipt.gasUsed);
    }
    const m = mean(runs);
    const s = sd(runs);
    console.log(`ThresholdHTLC — mean: ${m.toFixed(1)}, SD: ${s.toFixed(1)}, runs: ${JSON.stringify(runs)}`);
    gasResults["ThresholdHTLC"] = { mean: parseFloat(m.toFixed(1)), sd: parseFloat(s.toFixed(1)), runs };
  });

  it("Code 4: MerkleRelay — 10 runs of verifyWithGas()", async () => {
    const deployed = await MerkleRelay.new(dummyRoot);
    const runs = [];
    for (let i = 0; i < N_RUNS; i++) {
      const leaf = web3.utils.sha3("leaf-" + i);
      const proof = [];              // single-leaf proof: leaf must equal root for true; gas is constant regardless
      const tx = await deployed.verifyWithGas(proof, leaf, dummyRoot);
      runs.push(tx.receipt.gasUsed);
    }
    const m = mean(runs);
    const s = sd(runs);
    console.log(`MerkleRelay   — mean: ${m.toFixed(1)}, SD: ${s.toFixed(1)}, runs: ${JSON.stringify(runs)}`);
    gasResults["MerkleRelay"] = { mean: parseFloat(m.toFixed(1)), sd: parseFloat(s.toFixed(1)), runs };
  });

  after(async () => {
    const outPath = path.join(__dirname, "gas-results.json");
    fs.writeFileSync(outPath, JSON.stringify(gasResults, null, 2));
    console.log("\ngas-results.json written to", outPath);
    console.log("\nSummary:");
    for (const [contract, data] of Object.entries(gasResults)) {
      console.log(`  ${contract}: ${data.mean} ± ${data.sd} gas`);
    }
  });
});

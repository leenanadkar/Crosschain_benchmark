const fs = require("fs");
const path = require("path");
const SimpleHTLC = artifacts.require("SimpleHTLC");
const RoleOrchestrated = artifacts.require("RoleOrchestrated");
const ThresholdHTLC = artifacts.require("ThresholdHTLC");
const MerkleRelay = artifacts.require("MerkleRelay");
const N_RUNS = 10;
function mean(arr) { return arr.reduce((a,b)=>a+b,0)/arr.length; }
function sd(arr) { const m=mean(arr); return Math.sqrt(arr.reduce((s,x)=>s+Math.pow(x-m,2),0)/arr.length); }
contract("Gas Benchmark (n=10)", async (accounts) => {
  const gasResults = {};
  const hashlock = web3.utils.sha3("benchmark-secret");
  const timelock = 300;
  const signers = [accounts[1], accounts[2]];
  const threshold = 2;
  const role = web3.utils.keccak256("ORCHESTRATOR");
  const dummyRoot = web3.utils.sha3("dummy-root");
  it("Code 1: SimpleHTLC - 10 runs of lock()", async () => {
    const runs = [];
    for (let i=0;i<N_RUNS;i++) {
      const d = await SimpleHTLC.new(hashlock, timelock);
      const tx = await d.lock(web3.utils.sha3("secret"+i), accounts[1], 100);
      runs.push(tx.receipt.gasUsed);
    }
    gasResults["SimpleHTLC"] = { mean: parseFloat(mean(runs).toFixed(1)), sd: parseFloat(sd(runs).toFixed(1)), runs };
    console.log("SimpleHTLC mean:", mean(runs).toFixed(1), "sd:", sd(runs).toFixed(1));
  });
  it("Code 2: RoleOrchestrated - 10 runs of grantRole()", async () => {
    const d = await RoleOrchestrated.new();
    const runs = [];
    for (let i=0;i<N_RUNS;i++) {
      const r = web3.utils.keccak256("ROLE_"+i);
      const tx = await d.grantRole(r, accounts[1]);
      runs.push(tx.receipt.gasUsed);
    }
    gasResults["RoleOrchestrated"] = { mean: parseFloat(mean(runs).toFixed(1)), sd: parseFloat(sd(runs).toFixed(1)), runs };
    console.log("RoleOrchestrated mean:", mean(runs).toFixed(1), "sd:", sd(runs).toFixed(1));
  });
  it("Code 3: ThresholdHTLC - 10 runs of lock()", async () => {
    const d = await ThresholdHTLC.new(signers, threshold);
    const runs = [];
    for (let i=0;i<N_RUNS;i++) {
      const c = web3.utils.sha3("commitment-"+i);
      const tx = await d.lock(c);
      runs.push(tx.receipt.gasUsed);
    }
    gasResults["ThresholdHTLC"] = { mean: parseFloat(mean(runs).toFixed(1)), sd: parseFloat(sd(runs).toFixed(1)), runs };
    console.log("ThresholdHTLC mean:", mean(runs).toFixed(1), "sd:", sd(runs).toFixed(1));
  });
  it("Code 4: MerkleRelay - 10 runs of verifyWithGas()", async () => {
    const d = await MerkleRelay.new(dummyRoot);
    const runs = [];
    for (let i=0;i<N_RUNS;i++) {
      const leaf = web3.utils.sha3("leaf-"+i);
      const tx = await d.verifyWithGas([], leaf, dummyRoot);
      runs.push(tx.receipt.gasUsed);
    }
    gasResults["MerkleRelay"] = { mean: parseFloat(mean(runs).toFixed(1)), sd: parseFloat(sd(runs).toFixed(1)), runs };
    console.log("MerkleRelay mean:", mean(runs).toFixed(1), "sd:", sd(runs).toFixed(1));
  });
  after(async () => {
    fs.writeFileSync(path.join(__dirname, "gas-results.json"), JSON.stringify(gasResults, null, 2));
    console.log("\ngas-results.json written.");
  });
});

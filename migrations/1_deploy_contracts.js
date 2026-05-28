const SimpleHTLC = artifacts.require("SimpleHTLC");
const RoleOrchestrated = artifacts.require("RoleOrchestrated");
const ThresholdHTLC = artifacts.require("ThresholdHTLC");
const MerkleRelay = artifacts.require("MerkleRelay");

module.exports = async function (deployer, network, accounts) {
  const [, signer1, signer2] = accounts;

  // SimpleHTLC
  const hashlock = web3.utils.sha3("dummy");
  const timelock = 300;
  await deployer.deploy(SimpleHTLC, hashlock, timelock);
  console.log(" SimpleHTLC deployed");

  // RoleOrchestrated
  await deployer.deploy(RoleOrchestrated);
  console.log(" RoleOrchestrated deployed");

  // ThresholdHTLC
  const signerArray = [signer1, signer2];
  const threshold = 2;
  await deployer.deploy(ThresholdHTLC, signerArray, threshold);
  console.log("ThresholdHTLC deployed");

  // MerkleRelay - bytes32 root expected
  const initialMerkleRoot = web3.utils.keccak256("initial-root");
  await deployer.deploy(MerkleRelay, initialMerkleRoot);
  console.log("MerkleRelay deployed");
};

Cross-Chain Smart Contract Gas Benchmarking

This project benchmarks and visualizes **deployment and execution gas usage** for various cross-chain smart contract orchestration mechanisms. It supports the research paper:

“Cross-Chain Smart Contract Orchestration: A Novel Framework for Atomic and Consistent Execution Across Multi-Chain Ecosystems”
Leena Nadkar, Dr. Prashasti Kanikar – NMIMS University, Mumbai

---

Overview

The system simulates and measures gas consumption for different smart contract orchestration models:
- **Deployment Gas** – Cost to deploy each contract
- **Execution Gas** – Cost to invoke cross-chain functions

## Smart Contract Models Benchmarked

| Code | Mechanism                  | Function Benchmarked         |
|------|----------------------------|-------------------------------|
| 1    | Simple HTLC                | `lock()`                      |
| 2    | Role-Orchestrated          | `grantRole()`                 |
| 3    | Threshold Signature HTLC   | `lock()`                      |
| 4    | Merkle Root Relay          | `verifyWithGas()`             |

---


##  Setup Instructions

1. Install Truffle and dependencies
npm install -g truffle
npm install
2. Compile contracts
truffle compile
3. Run benchmark tests
truffle test ./test/gasBenchmark.test.js
This generates the gas-results.json file with execution gas data.

Visualization Dashboard
1. Serve the project directory
npx http-server .
OR
python3 -m http.server 8080
2. Open in browser
http://localhost:8080/gasChart.html
3. Dashboard Features
Deployment vs Execution gas bar chart


Output Files
gas-results.json – Execution gas per contract

gasChart.html – Dashboard file

gas-profile.png / gas-profile.pdf – Exported report

Use Cases
-Blockchain academic research (Ethereum, IBC, Polkadot)
-Protocol optimization benchmarking
-Cross-chain smart contract efficiency comparisons
-Teaching and learning about gas costs

Research Context
Nadkar, L. & Kanikar, P. (2025). Cross-Chain Smart Contract Orchestration: A Novel Framework for Atomic and Consistent Execution Across Multi-Chain Ecosystems.
NMIMS University, Mumbai

Built With
-Solidity
-Truffle
-Ganache


License
MIT License – free for academic and research use. Please cite our paper when used in publications.

Acknowledgements
Thanks to the contributors, reviewers, and open-source communities that helped refine this work.


# Cross-Chain Smart Contract Gas Benchmarking

This repository contains the reproducible EVM/Ganache contract-level benchmark
used for the manuscript:

> Cross-Chain Smart Contract Orchestration: A Prototype Framework for Atomic
> Execution Across EVM-Compatible Blockchain Instances

The current code evaluates four Solidity contract variants on a local Ganache
EVM instance. It does not claim deployment on public testnets, non-EVM chains,
or production heterogeneous networks.

## What Is Benchmarked

| Code | Contract model | Function benchmarked |
| --- | --- | --- |
| 1 | Simple HTLC baseline | `lock()` |
| 2 | Role-orchestrated access control | `grantRole()` |
| 3 | Threshold HTLC commitment model | `lock()` |
| 4 | Merkle root relay verifier | `verifyWithGas()` |

The benchmark measures:

- deployment gas for each contract
- execution gas for the selected representative function
- percentage execution-gas change relative to `SimpleHTLC`

## Repository Structure

```text
contracts/               Solidity contracts used by Truffle
migrations/              Truffle deployment script
test/                    Gas benchmark test
scripts/                 Result summarization helpers
results/                 Generated benchmark summaries/chart data
gas-results.json         Raw gas output from the benchmark test
gasChart.html            Browser chart for gas-results.json
truffle-config.js        Local Ganache Truffle configuration
```

The root-level Solidity and test files are retained for compatibility with the
original upload, but the canonical Truffle paths are `contracts/`,
`migrations/`, and `test/`.

## Reproduction Environment

The original manuscript audit was performed against commit:

```text
d54e3b7f55e79ae6fa78b01488233e865790c6ff
```

Use the latest commit on the `codex/reproducibility-reframe` branch for the
revised reproducibility structure and n=10 gas benchmark output.

Validated toolchain:

- Node.js `18.20.5`
- npm `10.8.2`
- Truffle `5.11.5`
- Ganache `7.9.2`
- Solidity compiler resolved by Truffle from pragma `^0.8.0`

## Reproduce The Gas Results

Install Truffle and Ganache if they are not already available:

```bash
npm install -g truffle ganache
```

Start Ganache in a separate terminal:

```bash
ganache --host 127.0.0.1 --port 8545
```

Compile and run the benchmark:

```bash
npm run compile
npm run benchmark:gas
npm run benchmark:summary
npm run plot:gas
```

The benchmark writes:

- `gas-results.json`
- `results/gas-summary.json`
- `results/gas-chart-data.json`

To view Figure 6.1, serve the repository directory and open `gasChart.html`:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/gasChart.html
```

## Current Raw Results

Each contract/function pair is repeated `n=10` times by
`test/gasBenchmark.test.js`. Gas is deterministic under a fixed EVM/compiler
configuration, so standard deviations are zero or near-zero.

| Contract | Runs | Deployment gas mean | Deployment gas SD | Execution gas mean | Execution gas SD |
| --- | ---: | ---: | ---: | ---: | ---: |
| SimpleHTLC | 10 | 438,493 | 0.0 | 77,512.8 | 3.6 |
| RoleOrchestrated | 10 | 231,692 | 0.0 | 46,314.0 | 0.0 |
| ThresholdHTLC | 10 | 394,592 | 0.0 | 45,581.8 | 3.6 |
| MerkleRelay | 10 | 317,827 | 0.0 | 23,882.8 | 3.6 |

MerkleRelay execution gas is 69.19% lower than the SimpleHTLC baseline for the
representative function measured by `test/gasBenchmark.test.js`.

## Scope And Limitations

This repository supports contract-level gas profiling only. It does not provide
scripts for latency, throughput, fault-tolerance, state-consistency, public
testnet, non-EVM, or multi-region validator measurements. Those topics should be
treated as design discussion or future work unless additional scripts and raw
data are added.

## Built With

- Solidity
- Truffle
- Ganache

## License

MIT License. Please cite the manuscript if this benchmark is used in academic
work.

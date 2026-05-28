const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "..", "gas-results.json");
const outputPath = path.join(__dirname, "..", "results", "gas-summary.json");

if (!fs.existsSync(inputPath)) {
  throw new Error("gas-results.json not found. Run npm run benchmark:gas first.");
}

const gasResults = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const baseline = gasResults.SimpleHTLC;

if (!baseline) {
  throw new Error("SimpleHTLC baseline missing from gas-results.json.");
}

const summary = Object.fromEntries(
  Object.entries(gasResults).map(([name, values]) => {
    const executionDelta = values.executionGas - baseline.executionGas;
    const executionChangePct = (executionDelta / baseline.executionGas) * 100;

    return [
      name,
      {
        runs: values.runs,
        deploymentGas: values.deploymentGas,
        executionGas: values.executionGas,
        deploymentGasStdDev: values.deploymentGasStdDev,
        executionGasStdDev: values.executionGasStdDev,
        executionGasVsSimpleHTLCPct: Number(executionChangePct.toFixed(2))
      }
    ];
  })
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
console.log(`Wrote ${outputPath}`);

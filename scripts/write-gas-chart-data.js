const fs = require("fs");
const path = require("path");

const resultsPath = path.join(__dirname, "..", "gas-results.json");
const chartPath = path.join(__dirname, "..", "results", "gas-chart-data.json");

if (!fs.existsSync(resultsPath)) {
  throw new Error("gas-results.json not found. Run npm run benchmark:gas first.");
}

const gasResults = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const labels = Object.keys(gasResults);

const chartData = {
  labels,
  deploymentGas: labels.map((label) => gasResults[label].deploymentGas),
  executionGas: labels.map((label) => gasResults[label].executionGas)
};

fs.mkdirSync(path.dirname(chartPath), { recursive: true });
fs.writeFileSync(chartPath, JSON.stringify(chartData, null, 2));
console.log(`Wrote ${chartPath}`);

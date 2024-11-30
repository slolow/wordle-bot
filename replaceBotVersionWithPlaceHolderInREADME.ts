import fs from "fs";
import path from "path";

// Paths
const packageJsonPath = path.resolve(process.cwd(), "package.json");
const readmePath = path.resolve(process.cwd(), "README.md");

// Load package.json and extract the version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

// Read the README file
let readmeContent = fs.readFileSync(readmePath, "utf-8");

// Replace a placeholder in the README with the version
readmeContent = readmeContent.replace(version, "{{VERSION}}");

// Write the updated README file
fs.writeFileSync(readmePath, readmeContent);

console.log("README version replace with place holder");

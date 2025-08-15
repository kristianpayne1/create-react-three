#!/usr/bin/env node

import { execSync } from "child_process";
import degit from "degit";
import prompts from "prompts";
import chalk from "chalk";
import fs from "fs";
import path from "path";

async function main() {
    console.log(chalk.cyan("Creating a new R3F project"));

    const projectNameResponse = await prompts({
        type: "text",
        name: "name",
        message: "Project name?",
        initial: "my-r3f-app",
    });

    const languageResponse = await prompts({
        type: "select",
        name: "language",
        message: "What language would you like?",
        choices: [
            {title: "JavaScript", value: "javascript"},
            {title: "TypeScript", value: "typescript"}
        ],
        initial: 0,
    });

    const projectName = projectNameResponse.name.trim();
    const typescript = languageResponse.language === "typescript";
    const repo = `kristianpayne1/r3f-template${typescript ? "-typescript" : ""}`;

    console.log(chalk.green(`Creating R3F project "${projectName}"...`));

    execSync(`mkdir ${projectName}`, { stdio: "inherit" });

    await degit(repo).clone(projectName);

    // Update package.json
    const packageJsonPath = path.join(projectName, "package.json");

    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageData.name = projectName; // Update name field
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));

    // Update vite.config.js
    const viteConfigPath = path.join(projectName,`vite.config.${typescript ? "t" : "j"}s`);
    let viteConfigContent = fs.readFileSync(viteConfigPath, "utf-8");

    viteConfigContent = viteConfigContent.replace(
        /base:\s*["'`](.*?)["'`]/,
        `base: "/${projectName}/"`
    );

    fs.writeFileSync(viteConfigPath, viteConfigContent);

    // Update README.md
    const readmePath = path.join(projectName, "README.md");
    const fileContent = fs.readFileSync(readmePath, 'utf8');

    const updatedContent = `# ${projectName}\n\n${fileContent}`;

    fs.writeFileSync(readmePath, updatedContent, 'utf8');

    console.log(chalk.green("Done! Now run:"));
    console.log(chalk.blue(`cd ${projectName}`));
    console.log(chalk.blue("npm install"));
    console.log(chalk.blue("npm run dev"));

    process.exit(0);
}

main().catch(console.error);

#!/usr/bin/env node

import fs from "fs";
import path from "path";

import chalk from "chalk";
import lodash from "lodash";
import yaml from "yaml";

import type { ZodocsConfig } from "@/core/definitions";
import { zodocs } from "@/core/models";

import type { RequiredDeep } from "type-fest";

const ROOT_DIRECTORY = process.cwd();
const CONFIG_FILE_NAME = "zodocs.config.ts";

const defaultConfig: RequiredDeep<ZodocsConfig> = {
  version: "1.0.0",
  title: "Generated API Document Title",
  description: "Generated API Document Description",
  servers: [],
  input: {
    directories: ["schema"],
    endpointFileName: "endpoint.ts",
    requestFileName: "request.ts",
    responseFileName: "response.ts",
    tags: {},
  },
  output: {
    directory: "",
    fileName: "openapi-docs.yml",
  },
};

const createDefaultConfig = (
  config: RequiredDeep<ZodocsConfig>,
) => `import type { ZodocsConfig, ZodocsTags } from "zodocs";

export const Tags = {} as const satisfies ZodocsTags;

const config: ZodocsConfig = {
  version: "${config.version}",
  title: "${config.title}",
  description: "${config.description}",
  servers: ${JSON.stringify(config.servers, null, 2)},
  input: {
    directories: ${JSON.stringify(config.input.directories)},
    endpointFileName: "${config.input.endpointFileName}",
    requestFileName: "${config.input.requestFileName}",
    responseFileName: "${config.input.responseFileName}",
    tags: Tags,
  },
  output: {
    directory: "${config.output.directory}",
    fileName: "${config.output.fileName}",
  },
};

export default config;
`;

const loadConfig = async () => {
  const fromPath = path.join(ROOT_DIRECTORY, CONFIG_FILE_NAME);

  try {
    if (!fs.existsSync(fromPath)) {
      fs.writeFileSync(fromPath, createDefaultConfig(defaultConfig), "utf-8");

      console.log(chalk.green(`✨ Created ${chalk.bold(CONFIG_FILE_NAME)}\n`));
    }

    const { default: config } = await import(fromPath);

    const loadedConfig = lodash.merge<RequiredDeep<ZodocsConfig>, ZodocsConfig>(
      defaultConfig,
      config,
    );

    if (!loadedConfig.input.directories.length) {
      console.log(chalk.red("❌ No schema directories specified\n"));

      process.exit(1);
    }

    if (
      !loadedConfig.input.endpointFileName ||
      !loadedConfig.input.requestFileName ||
      !loadedConfig.input.responseFileName
    ) {
      console.log(chalk.red("❌ Schema file names not specified\n"));

      process.exit(1);
    }

    if (!loadedConfig.output.fileName) {
      console.log(chalk.red("❌ Output file name not specified\n"));

      process.exit(1);
    }

    return loadedConfig;
  } catch (e) {
    console.error(
      chalk.red(`❌ Failed to load ${chalk.bold(CONFIG_FILE_NAME)}\n`),
      e,
    );

    process.exit(1);
  }
};

const searchSchemaDirectories = async (loadDirectories: string[]) => {
  const foundDirectories: string[] = [];

  const search = async (directory: string, loadDirectories: string[]) => {
    const entries = await fs.promises.readdir(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const currentPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (loadDirectories.includes(entry.name)) {
          foundDirectories.push(currentPath);
        } else {
          await search(currentPath, loadDirectories);
        }
      }
    }
  };

  await search(ROOT_DIRECTORY, loadDirectories);

  return foundDirectories;
};

const loadSchemas = async (config: RequiredDeep<ZodocsConfig>) => {
  const schemaDirectories = await searchSchemaDirectories(
    config.input.directories,
  );

  for (const schemaDirectory of schemaDirectories) {
    const endpointFile = path.join(
      schemaDirectory,
      config.input.endpointFileName,
    );

    if (fs.existsSync(endpointFile)) {
      try {
        await import(path.resolve(endpointFile));
      } catch (e) {
        console.error(
          chalk.red(`❌ Failed to load ${chalk.bold(endpointFile)}\n`),
          e,
        );
      }
    }
  }
};

const syncOutputDirectory = (config: RequiredDeep<ZodocsConfig>) => {
  const outputDir = config.output.directory;

  if (outputDir && !fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (e) {
      console.error(
        chalk.red(`❌ Failed to create ${chalk.bold(outputDir)}\n`),
        e,
      );

      process.exit(1);
    }
  }

  return path.join(outputDir, config.output.fileName);
};

const generate = async () => {
  console.log(chalk.blue("🚀 Starting documentation generation\n"));

  try {
    const config = await loadConfig();

    await loadSchemas(config);

    const toPath = syncOutputDirectory(config);

    fs.writeFileSync(toPath, yaml.stringify(zodocs.generate(config)), {
      encoding: "utf-8",
    });

    console.log(
      chalk.green(`✨ Successfully generated ${chalk.bold(toPath)}\n`),
    );
  } catch (e) {
    console.error(chalk.red("❌ Failed to generate documentation\n"), e);

    process.exit(1);
  }
};

process.on("unhandledRejection", (e) => {
  console.error(e);

  process.exit(1);
});

process.on("uncaughtException", (e) => {
  console.error(e);

  process.exit(1);
});

void generate();

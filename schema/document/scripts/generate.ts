import fs from "fs";
import path from "path";

import chalk from "chalk";
import { merge } from "lodash";
import type { RequiredDeep } from "type-fest";
import yaml from "yaml";
import { docs } from "../generator";
import { DocumentConfig } from "../config";

const ROOT_DIRECTORY = process.cwd();

const CONFIG_FILE_NAME = "schema.config.ts";

const defaultConfig: RequiredDeep<DocumentConfig> = {
  version: "0.1.0",
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

const loadConfig = async () => {
  const configPath = path.join(ROOT_DIRECTORY, CONFIG_FILE_NAME);

  try {
    let loadedConfig = defaultConfig;

    if (fs.existsSync(configPath)) {
      const { default: config } = await import(configPath);
      loadedConfig = merge<RequiredDeep<DocumentConfig>, DocumentConfig>(
        defaultConfig,
        config,
      );
    }

    if (!loadedConfig.input.directories.length) {
      console.log(
        chalk.red("スキーマを定義するディレクトリが指定されていません"),
      );
      console.log();
      process.exit(1);
    }

    if (
      !loadedConfig.input.endpointFileName ||
      !loadedConfig.input.requestFileName ||
      !loadedConfig.input.responseFileName
    ) {
      console.log(
        chalk.red("スキーマを定義するファイル名が指定されていません"),
      );
      console.log();
      process.exit(1);
    }

    if (!loadedConfig.output.fileName) {
      console.log(
        chalk.red("ドキュメントの出力ファイル名が指定されていません"),
      );
      console.log();
      process.exit(1);
    }

    return loadedConfig;
  } catch (e) {
    console.log(chalk.red("設定ファイルの読み込みに失敗しました"));
    console.log(chalk.red(e));
    process.exit(1);
  }
};

const searchSchemaDirectories = async (loadDirectories: string[]) => {
  const foundDirectories: string[] = [];

  const recursiveSearchSchemaDirectories = async (
    directory: string,
    loadDirectories: string[],
  ) => {
    const entries = await fs.promises.readdir(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const currentPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (loadDirectories.includes(entry.name)) {
          foundDirectories.push(currentPath);
        } else {
          await recursiveSearchSchemaDirectories(currentPath, loadDirectories);
        }
      }
    }
  };

  await recursiveSearchSchemaDirectories(ROOT_DIRECTORY, loadDirectories);

  return foundDirectories;
};

const loadSchemas = async (config: RequiredDeep<DocumentConfig>) => {
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
        console.log(chalk.red(`${endpointFile} の読み込みに失敗しました`));
        console.log(chalk.red(e));
      }
    }
  }
};

const generate = async () => {
  console.log(chalk.blue("▶ ドキュメント生成を開始します"));
  console.log();

  try {
    const config = await loadConfig();

    await loadSchemas(config);

    const document = docs.generate(config);

    if (config.output.directory && !fs.existsSync(config.output.directory)) {
      fs.mkdirSync(config.output.directory, { recursive: true });
    }

    const outputPath = path.join(
      config.output.directory,
      config.output.fileName,
    );
    fs.writeFileSync(outputPath, yaml.stringify(document), {
      encoding: "utf-8",
    });

    console.log(chalk.green("✅ ドキュメント生成が完了しました"));
    console.log();
    console.log(chalk.green(`📋 ${outputPath}`));
    console.log();
  } catch (e) {
    console.log(chalk.red("ドキュメント生成中にエラーが発生しました"));
    console.log();
    console.log(chalk.red(e));
    console.log();
    process.exit(1);
  }
};

void generate();

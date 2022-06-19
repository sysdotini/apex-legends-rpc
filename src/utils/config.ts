/**
 * @file Config
 * @description Creates, modifies, and validates a valid config file
 * @module config
 */

import type { PathLike } from "node:fs";
import { logger } from "./logger.js";
import prompts from "prompts";
import fs from "node:fs";
let PARSED_CONFIG_FILE: ConfigFile = { steam32ID: "" };

// Typing for a valid config file
export type ConfigFile = {
  steam32ID: string;
  customClientID?: string;
};

/**
 * Searches for and validates a config file
 * @param directory The directory to look for the config file in
 * @returns A valid config file
 */

export async function getConfig(directory: PathLike): Promise<ConfigFile> {
  const CONFIG_FILE_PATH = `${directory}/config.json`;

  // Creates an empty config if it's missing
  if (!fs.existsSync(directory) || !fs.existsSync(CONFIG_FILE_PATH)) {
    await createInitialConfig(directory);
  }

  // Checks to see if the Steam32ID config file is set
  const CONFIG_FILE = fs.readFileSync(CONFIG_FILE_PATH)?.toString();

  // Validates our config is JSON
  try {
    PARSED_CONFIG_FILE = JSON.parse(CONFIG_FILE);
  } catch {
    logger.debug("The config file is corrupt or not set-up. Re-creating.");
    await createInitialConfig(directory, true);
  }

  // If for some reason it's been tampered with, re-run the script
  if (!PARSED_CONFIG_FILE || !PARSED_CONFIG_FILE?.steam32ID) {
    logger.debug("The config file is corrupt or not set-up. Re-creating.");
    await createInitialConfig(directory, true);
  }

  logger.info("Loading a locally saved Steam32 ID from the config file");
  return PARSED_CONFIG_FILE;
}

/**
 * Creates the initial config file
 * @param directory The data directory to save the config file to
 * @param deleteOldData Whether or not to clear the data directory out; use if corrupt
 * @returns A valid config file
 */

async function createInitialConfig(directory: PathLike, deleteOldData = false) {
  if (deleteOldData) fs.rmSync(directory, { recursive: true, force: true });

  const CONFIG_FILE_PATH = `${directory}/config.json`;

  // Create the data directory if it doesn't exist already
  if (!fs.existsSync(directory)) {
    try {
      fs.mkdirSync(directory);
    } catch (error) {
      logger.error(`Failed to create the data directory: ${error}`);
      return;
    }
  }

  // Create the data directory if it doesn't exist already
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      fs.writeFileSync(CONFIG_FILE_PATH, "{}", "utf8");
    } catch (error) {
      logger.error(`Failed to write an empty config file: ${error}`);
      return;
    }
  }

  // Prompts for the user's Steam32 ID
  const response = await prompts({
    type: "text",
    name: "steam32ID",
    // TODO: Automate this
    message: "Please provide your 'Steam32 ID' - you can get it from https://steamid.xyz/",
  });

  console.log(response);
  if (!response) throw new Error("You did not provide a Steam32 ID. Exiting.");

  // Creates the config JSON object
  const configToWrite: ConfigFile = {
    steam32ID: response.steam32ID,
  };

  // Creates a new config file
  logger.info(`Saved the Steam32 ID to ${CONFIG_FILE_PATH}`);
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configToWrite), { encoding: "utf8" });
}

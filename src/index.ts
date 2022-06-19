/**
 * @file Index
 * @description Sets up the application
 * @module index
 */

import type { ApexPresenceData } from "./utils/scraper.js";
import { GeneralAssets } from "./utils/assets.js";
import { getConfig } from "./utils/config.js";
import { scrapeMiniProfile } from "./utils/scraper.js";
import discordRPC from "discord-rpc";
import path from "node:path";
import url from "node:url";

// Path for the data directory
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));
const DATA_DIRECTORY = path.join(pathDirname, "../data");
const config = await getConfig(DATA_DIRECTORY);

// Start elapsed time when the app starts
const startTimestamp = new Date();

// Creates a new Rich Presence Client
const client = new discordRPC.Client({ transport: "ipc" });

let currentPresenceData: ApexPresenceData | undefined = {};

/**
 * Sets the rich presence activity
 */

async function setActivity() {
  // Sets the current presence data to scraped data
  currentPresenceData = await scrapeMiniProfile(config.steam32ID);

  // Destroy the RPC if no data is found
  if (!currentPresenceData) return client.destroy();

  // Sets the activity
  client.setActivity({
    details: currentPresenceData.gamemode ? currentPresenceData.gamemode : undefined,
    state: currentPresenceData.map ? currentPresenceData.map : undefined,
    largeImageKey: GeneralAssets.APEX_LOGO,
    largeImageText: "Apex Legends",
    startTimestamp: startTimestamp,
  });
}

// Starts setting the status, refresh it every 60 seconds
client.once("ready", async () => {
  // Sets the initial activity
  if (currentPresenceData) await setActivity();

  // Updates activity every 60 seconds
  setInterval(setActivity, 60_000);
});

// Signs into the rich presence
client.login({ clientId: config?.customClientID ?? "986486982886699028" });

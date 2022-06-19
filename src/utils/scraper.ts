/**
 * @file Scraper
 * @description Scrapes the Steam web API for playing details
 * @module scraper
 */

import { logger } from "./logger.js";
import scrapeIt from "scrape-it";
let parsedData: ApexPresenceData = {};

// A typing for Apex Presence Data
export interface ApexPresenceData {
  map?: string;
  gamemode?: string;
  lobby_size?: number;
  squads_left?: number;
}

/**
 * Scrapes the Steam community mini profile API to get playing statuses
 * @param steam32ID A Steam32 ID to scrape a playing status from
 * @returns A JSON object of playing status details
 */

export async function scrapeMiniProfile(steam32ID: string) {
  type ScrapedData = {
    title?: string;
    details?: string;
  };

  const scrapedData = await scrapeIt(`https://steamcommunity.com/miniprofile/${steam32ID}`, {
    title: ".miniprofile_game_name",
    details: ".rich_presence",
  })
    .then(({ data }) => {
      return data as Promise<ScrapedData | undefined>;
    })
    .catch((error) => {
      logger.error(`Error while fetching rich presence data: ${error}`);
    });

  if (!scrapedData || scrapedData?.title !== "Apex Legends") return;

  // TODO: actually do this
  parsedData = {
    gamemode: "Firing Range",
    lobby_size: 1,
    map: "Firing Range",
    squads_left: 2,
  };

  console.log(scrapedData);
  return parsedData;
}

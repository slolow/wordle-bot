// TODO: change tsconfig.json to use .ts extensions instead of .js for import. Even better import without extension

import {
  PlayerStats,
  PlayerStatsOfTheDay,
} from "./data-structure/dataTypes.js";
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { getWinnersStatsOfTheDay } from "./playersStatsOfTheDay/getWinnersStatsOfTheDay.js";
import { createWinnersOfTheDayMessage } from "./messages/createWinnersOfTheDayMessage.js";
import { importFromCsv } from "./importer/importFromCsv.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { updatePlayersStats } from "./playersStats/updatePlayersStats.js";
import { exportToCsv } from "./exporter/exportToCsv.js";
import { createTablePhoto } from "./messages/createTablePhoto.js";
import { createPlayerIsABotMessage } from "./messages/createPlayerIsABotMessage.js";
import { createNoOnePlayedTodayMessage } from "./messages/createNoOnePlayedTodayMessage.js";
import { createCrashMessage } from "./messages/createCrashMessage.js";
import { createNotAbleToUpdatePlayersStatsMessage } from "./messages/createNotAbleToUpdatePlayersStatsMessage.js";
import {
  sendDocument,
  sendMessage,
  sendPhoto,
} from "./messages/sendMessage.js";
import { createSeeMoreStatsMessage } from "./messages/createSeeMoreStatsMessage.js";
import { createAllTimeLeaderMessage } from "./messages/createAllTimeLeaderMessage.js";
import { createStartMessage } from "./messages/createStartMessage.js";

const TOKEN: string | undefined = process.env.TOKEN;
export const CHAT_ID: string | undefined = process.env.CHAT_ID;

if (!TOKEN) {
  throw new Error("you need to provide a TOKEN in an .env file!");
}
if (!CHAT_ID) {
  throw new Error("you need to provide a CHAT_ID in an .env file!");
}

// We need absolute path because node:fs throws an error when opening file with relative path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToPlayersStats = join(__dirname, "../data/playersStatsTest.csv");

const CRON_EXPRESSION: string = "* * * * *";

const WORDLE_REGEX = /^Wordle \d+[.,]\d+ [1-6X]\/6/;

export const bot: TelegramBot = new TelegramBot(TOKEN!, { polling: true });

let playersStatsOfTheDay: PlayerStatsOfTheDay[] = [];

bot.onText(/\/start/, () => sendMessage(createStartMessage(), 0));

bot.on("message", async (msg: TelegramBot.Message) => {
  const chatId: string = msg.chat.id.toString();
  const sender: TelegramBot.User | undefined = msg.from;
  const messageText: string | undefined = msg.text;

  if (!sender || !messageText || chatId !== CHAT_ID) {
    return;
  }

  if (sender.is_bot) {
    await sendMessage(createPlayerIsABotMessage(sender));
    return;
  }

  if (WORDLE_REGEX.test(messageText)) {
    const informationFromWordleMessage = messageText.split(" ");

    const numberOfAttempts = informationFromWordleMessage[2][0];

    const playerStatsOfTheDay: PlayerStatsOfTheDay = {
      name: sender.first_name,
      attempts:
        numberOfAttempts !== "X" ? Number(numberOfAttempts) : numberOfAttempts,
    };
    playersStatsOfTheDay.push(playerStatsOfTheDay);
  }
});

cron.schedule(CRON_EXPRESSION, async () => {
  if (playersStatsOfTheDay.length === 0) {
    await sendMessage(createNoOnePlayedTodayMessage());
    return;
  }

  const playersStats: PlayerStats[] = await importFromCsv(
    pathToPlayersStats,
  ).catch((error) => {
    sendMessage(createCrashMessage());
    console.error(
      `An error occurred while importing the data from ${pathToPlayersStats}`,
      error,
    );
    process.exit(1);
  });

  const winnersStatsOfTheDay: PlayerStatsOfTheDay[] =
    getWinnersStatsOfTheDay(playersStatsOfTheDay);

  const updatedPlayersStats: PlayerStats[] = updatePlayersStats(
    winnersStatsOfTheDay,
    playersStatsOfTheDay,
    playersStats,
  );

  let hasExportError: boolean = false;
  exportToCsv(pathToPlayersStats, updatedPlayersStats).catch((error) => {
    hasExportError = true;
    console.error(
      `The updated player stats could not be exported to ${pathToPlayersStats}`,
      error,
    );
  });

  const winnersOfTheDayMessage: string =
    createWinnersOfTheDayMessage(winnersStatsOfTheDay);
  const allTimeLeaderMessage: string =
    createAllTimeLeaderMessage(updatedPlayersStats);
  const messageOfTheDay: string = `${winnersOfTheDayMessage}\n\n${allTimeLeaderMessage}`;

  if (hasExportError) {
    await sendMessage(
      createNotAbleToUpdatePlayersStatsMessage(messageOfTheDay),
    );
    return;
  }
  await sendPhoto(createTablePhoto(updatedPlayersStats), messageOfTheDay);
  await sendDocument(pathToPlayersStats, createSeeMoreStatsMessage());

  playersStatsOfTheDay = [];
});

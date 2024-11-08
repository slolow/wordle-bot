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
import { createNotAbleToUpdatePlayersStats } from "./messages/createNotAbleToUpdatePlayersStats.js";

const TOKEN: string | undefined = process.env.TOKEN;
const CHAT_ID: string | undefined = process.env.CHAT_ID;

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

const WORDLE_MSG_START: string = "Wordle";

const bot: TelegramBot = new TelegramBot(TOKEN!, { polling: true });

let playersStatsOfTheDay: PlayerStatsOfTheDay[] = [];

bot.on("message", (msg: TelegramBot.Message) => {
  const chatId: string = msg.chat.id.toString();
  const sender: TelegramBot.User | undefined = msg.from;
  const messageText: string | undefined = msg.text;

  if (!sender || !messageText || chatId !== CHAT_ID) {
    return;
  }

  if (sender.is_bot) {
    bot
      .sendMessage(chatId, createPlayerIsABotMessage(sender))
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  if (messageText.startsWith(WORDLE_MSG_START)) {
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
    bot
      .sendMessage(CHAT_ID, createNoOnePlayedTodayMessage())
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  const playersStats: PlayerStats[] = await importFromCsv(
    pathToPlayersStats,
  ).catch((error) => {
    bot
      .sendMessage(CHAT_ID, createCrashMessage())
      .catch((error) => console.error("bot message could not be send", error));
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

  const winnersOfTheDayMessage =
    createWinnersOfTheDayMessage(winnersStatsOfTheDay);

  hasExportError
    ? bot
        .sendMessage(
          CHAT_ID,
          createNotAbleToUpdatePlayersStats(winnersOfTheDayMessage),
        )
        .catch((error) => console.error("bot message could not be send", error))
    : bot
        .sendPhoto(CHAT_ID, createTablePhoto(updatedPlayersStats), {
          caption: winnersOfTheDayMessage,
        })
        .catch((error) =>
          console.error("bot photo message could not be send", error),
        );

  playersStatsOfTheDay = [];
});

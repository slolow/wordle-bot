// TODO: change tsconfig.json to use .ts extensions instead of .js for import. Even better import without extension

import {
  PlayerStats,
  PlayerStatsOfTheDay,
} from "./data-structure/dataTypes.js";
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import dotenv from "dotenv";
import path from "node:path";
import { getWinnersStatsOfTheDay } from "./playersStatsOfTheDay/getWinnersStatsOfTheDay.js";
import { createWinnersOfTheDayMessage } from "./messages/createWinnersOfTheDayMessage.js";
import { importFromCsv } from "./importer/importFromCsv.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { updatePlayersStats } from "./playersStats/updatePlayersStats.js";
import { exportToCsv } from "./exporter/exportToCsv.js";
import { createTablePhoto } from "./messages/createTablePhoto.js";
import { createPlayerIsABotMessage } from "./messages/createPlayerIsABotMessage.js";
import { createNoOnePlayedYesterdayMessage } from "./messages/createNoOnePlayedYesterdayMessage.js";
import { createCrashMessage } from "./messages/createCrashMessage.js";
import { createNotAbleToUpdatePlayersStatsMessage } from "./messages/createNotAbleToUpdatePlayersStatsMessage.js";
import {
  deleteMessage,
  sendDocument,
  sendMessage,
  sendPhoto,
} from "./messages/sendMessage.js";
import { createSeeMoreStatsMessage } from "./messages/createSeeMoreStatsMessage.js";
import { createAllTimeLeaderMessage } from "./messages/createAllTimeLeaderMessage.js";
import { createStartMessage } from "./messages/createStartMessage.js";
import { createWelcomeNewChatMembersMessage } from "./messages/createWelcomeNewChatMembersMessage.js";
import { exportToTxt } from "./exporter/exportToTxt.js";
import { importFromTxt } from "./importer/importFromTxt.js";
import { createBotWillBeDownMessage } from "./messages/createBotWillBeDownMessage.js";
import { createBotIsBackMessage } from "./messages/createBotIsBackMessage.js";
import { Environment } from "./Environment.js";

// config dotenv to read the right .env file. By default, read from .env.development.local.
const environment: Environment =
  (process.env.ENVIRONMENT as Environment) || "dev";
const envFile = environment === "dev" ? ".env.development.local" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile), override: true });

const TOKEN: string | undefined = process.env.TOKEN;
export const CHAT_ID: string | undefined = process.env.CHAT_ID;
const RELATIVE_PATH_TO_PLAYERS_STATS: string | undefined =
  process.env.RELATIVE_PATH_TO_PLAYERS_STATS;
const RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY: string | undefined =
  process.env.RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY;
const RELATIVE_PATH_TO_START_MESSAGE_ID: string | undefined =
  process.env.RELATIVE_PATH_TO_START_MESSAGE_ID;
const CRON_EXPRESSION: string | undefined = process.env.CRON_EXPRESSION;

if (!TOKEN) {
  throw new Error("you need to provide a TOKEN in an .env file!");
}
if (!CHAT_ID) {
  throw new Error("you need to provide a CHAT_ID in an .env file!");
}
if (!RELATIVE_PATH_TO_PLAYERS_STATS) {
  throw new Error(
    "you need to provide a RELATIVE_PATH_TO_PLAYERS_STATS in an .env file!",
  );
}
if (!RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY) {
  throw new Error(
    "you need to provide a RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY in an .env file!",
  );
}
if (!RELATIVE_PATH_TO_START_MESSAGE_ID) {
  throw new Error(
    "you need to provide a RELATIVE_PATH_TO_START_MESSAGE_ID in an .env file!",
  );
}
if (!CRON_EXPRESSION) {
  throw new Error("you need to provide a CRON_EXPRESSION in an .env file!");
}

// We need absolute path because node:fs throws an error when opening file with relative path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToPlayersStats = join(__dirname, RELATIVE_PATH_TO_PLAYERS_STATS);
const pathToPlayersStatsOfTheDay = join(
  __dirname,
  RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY,
);
const pathToStartMessageId = join(__dirname, RELATIVE_PATH_TO_START_MESSAGE_ID);

const WORDLE_REGEX = /^Wordle \d+[.,]\d+ [1-6X]\/6/;

let playersStatsOfTheDay: PlayerStatsOfTheDay[] = [];

export const bot: TelegramBot = new TelegramBot(TOKEN, { polling: true });

console.log(`Bot is up and running in ${environment} mode`);
console.log(`Bot TOKEN is ${TOKEN}`);
console.log(`CHAT_ID is ${CHAT_ID}`);
console.log(
  `RELATIVE_PATH_TO_PLAYERS_STATS is ${RELATIVE_PATH_TO_PLAYERS_STATS}`,
);
console.log(
  `RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY is ${RELATIVE_PATH_TO_PLAYERS_STATS_OF_THE_DAY}`,
);
console.log(
  `RELATIVE_PATH_TO_START_MESSAGE_ID is ${RELATIVE_PATH_TO_START_MESSAGE_ID}`,
);
console.log(`CRON_EXPRESSION is ${CRON_EXPRESSION}`);

bot.onText(/\/start/, async () => {
  const startMessage: TelegramBot.Message | void = await sendMessage(
    createStartMessage(),
    0,
  );
  const startMessageId: number = startMessage!.message_id;

  await exportToTxt(pathToStartMessageId, startMessageId.toString());
});

bot.onText(/\/down/, () => sendMessage(createBotWillBeDownMessage(), 0));

bot.onText(/\/back/, () => sendMessage(createBotIsBackMessage(), 0));

bot.on("message", async (msg: TelegramBot.Message) => {
  const chatId: string = msg.chat.id.toString();
  const sender: TelegramBot.User | undefined = msg.from;
  const messageText: string | undefined = msg.text;

  if (msg.new_chat_members) {
    const startMessageId = Number(await importFromTxt(pathToStartMessageId));
    await sendMessage(
      createWelcomeNewChatMembersMessage(msg.new_chat_members),
      2000,
      {
        reply_to_message_id: startMessageId,
      },
    );
    return;
  }

  if (!sender || !messageText || chatId !== CHAT_ID) {
    return;
  }

  if (sender.is_bot) {
    await sendMessage(createPlayerIsABotMessage(sender));
    return;
  }

  // early exit when player already submitted result
  if (
    playersStatsOfTheDay.find(
      (playerStatsOfTheDay: PlayerStatsOfTheDay) =>
        playerStatsOfTheDay.id === sender.id,
    )
  ) {
    await deleteMessage(msg.message_id);
    return;
  }

  if (WORDLE_REGEX.test(messageText)) {
    const informationFromWordleMessage = messageText.split(" ");
    const numberOfAttempts = informationFromWordleMessage[2][0];

    const playerStatsOfTheDay: PlayerStatsOfTheDay = {
      id: sender.id,
      name: sender.first_name,
      attempts:
        numberOfAttempts !== "X" ? Number(numberOfAttempts) : numberOfAttempts,
    };
    playersStatsOfTheDay.push(playerStatsOfTheDay);
    exportToCsv(pathToPlayersStatsOfTheDay, playersStatsOfTheDay).catch(
      (error) => {
        console.error(
          `The updated playersStatsOfTheDay could not be exported to ${pathToPlayersStatsOfTheDay}`,
          error,
        );
      },
    );
  } else {
    await deleteMessage(msg.message_id);
  }
});

cron.schedule(CRON_EXPRESSION, async () => {
  const savedPlayersStatsOfTheDay: PlayerStatsOfTheDay[] | null =
    (await importFromCsv(pathToPlayersStatsOfTheDay).catch((error) => {
      sendMessage(createCrashMessage());
      console.error(
        `An error occurred while importing the data from ${pathToPlayersStatsOfTheDay}`,
        error,
      );
      return null;
    })) as PlayerStatsOfTheDay[];

  if (savedPlayersStatsOfTheDay === null) return;

  if (savedPlayersStatsOfTheDay.length === 0) {
    await sendMessage(createNoOnePlayedYesterdayMessage());
    return;
  }

  const savedPlayersStats: PlayerStats[] | null = (await importFromCsv(
    pathToPlayersStats,
  ).catch((error) => {
    sendMessage(createCrashMessage());
    console.error(
      `An error occurred while importing the data from ${pathToPlayersStats}`,
      error,
    );
    return null;
  })) as PlayerStats[];

  if (savedPlayersStats === null) return;

  const winnersStatsOfTheDay: PlayerStatsOfTheDay[] = getWinnersStatsOfTheDay(
    savedPlayersStatsOfTheDay,
  );

  const updatedPlayersStats: PlayerStats[] = updatePlayersStats(
    winnersStatsOfTheDay,
    savedPlayersStatsOfTheDay,
    savedPlayersStats,
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
  await exportToCsv(pathToPlayersStatsOfTheDay, playersStatsOfTheDay);
});

import {
  PlayerStatsOfTheDay,
  StatsOfTheDay,
} from "./data-structure/playerStatsOfTheDay";
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { getWinnersStatsOfTheDay } from "./getWinnersStatsOfTheDay";
import { createWinnersOfTheDayMessage } from "./createWinnersOfTheDayMessage";

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TOKEN) {
  throw new Error("you need to provide a TOKEN in an .env file!");
}
if (!CHAT_ID) {
  throw new Error("you need to provide a CHAT_ID in an .env file!");
}

const CRON_EXPRESSION = "0 0 * * *";

const WORDLE_MSG_START = "Wordle";

const bot = new TelegramBot(TOKEN!, { polling: true });

let statsOfTheDay: StatsOfTheDay = [];

bot.on("message", (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id.toString();
  const sender = msg.from;
  const messageText = msg.text;

  if (!sender || !messageText || chatId !== CHAT_ID) {
    return;
  }

  if (sender.is_bot) {
    bot
      .sendMessage(
        chatId,
        `${sender.first_name} ist ein Bot! Sein Resultat wird ignoriert`,
      )
      .catch((error) => console.error("bot message could not be send", error));
    return;
  }

  if (messageText.startsWith(WORDLE_MSG_START)) {
    const informationFromWordleMessage = messageText.split(" ");

    // depending on the users phone settings the gameNumber can be for example '1.223' or '1,223'
    const gameNumber = informationFromWordleMessage[1].replace(",", ".");
    const numberOfAttempts = informationFromWordleMessage[2][0];

    const playerStatsOfTheDay: PlayerStatsOfTheDay = {
      player: sender.first_name,
      attempts:
        numberOfAttempts !== "X" ? Number(numberOfAttempts) : numberOfAttempts,
    };
    statsOfTheDay.push(playerStatsOfTheDay);
  }
});

cron.schedule(CRON_EXPRESSION, () => {
  const winnersStatsOfTheDay = getWinnersStatsOfTheDay(statsOfTheDay);
  bot
    .sendMessage(CHAT_ID, createWinnersOfTheDayMessage(winnersStatsOfTheDay))
    .catch((error) => console.error("bot message could not be send", error));
  statsOfTheDay = [];
});

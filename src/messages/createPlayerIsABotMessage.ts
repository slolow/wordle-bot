import TelegramBot from "node-telegram-bot-api";

export const createPlayerIsABotMessage = (sender: TelegramBot.User): string =>
  `🔎 ${sender.first_name} is a bot! It's result will be ignored.`;

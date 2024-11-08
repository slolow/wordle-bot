import TelegramBot from "node-telegram-bot-api";
import { bot, CHAT_ID } from "../bot.js";
import type internal from "node:stream";

export const sendMessage = (
  message: string,
): Promise<TelegramBot.Message | void> =>
  bot
    .sendMessage(CHAT_ID!, message)
    .catch((error) => console.error("bot message could not be send", error));

export const sendPhoto = (
  photo: string | internal.Stream | Buffer,
  caption: string,
): Promise<TelegramBot.Message | void> =>
  bot
    .sendPhoto(CHAT_ID!, photo, {
      caption,
    })
    .catch((error) => console.error("bot photo could not be send", error));

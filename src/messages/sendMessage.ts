import TelegramBot from "node-telegram-bot-api";
import { bot, CHAT_ID } from "../bot.js";
import type internal from "node:stream";

export const sendMessage = async (
  message: string,
  typingTime: number = 10000,
): Promise<void> => {
  await typeMessage(typingTime);

  bot
    .sendMessage(CHAT_ID!, message)
    .catch((error) => console.error("bot message could not be send", error));
};

export const sendPhoto = async (
  photo: string | internal.Stream | Buffer,
  caption: string,
  typingTime: number = 10000,
): Promise<void> => {
  await typeMessage(typingTime);

  bot
    .sendPhoto(CHAT_ID!, photo, {
      caption,
    })
    .catch((error) => console.error("bot photo could not be send", error));
};

export const sendDocument = async (
  document: string | internal.Stream | Buffer,
  caption: string,
  typingTime: number = 10000,
): Promise<void> => {
  await typeMessage(typingTime);

  bot
    .sendDocument(CHAT_ID!, document, { caption })
    .catch((error) => console.error("bot document could not be send", error));
};

const sendChatAction = (action: TelegramBot.ChatAction): Promise<boolean> =>
  bot.sendChatAction(CHAT_ID!, action);

const typeMessage = async (typingTime: number): Promise<void> => {
  await sendChatAction("typing");

  await new Promise((resolve) => setTimeout(resolve, typingTime));
};
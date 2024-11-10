import TelegramBot from "node-telegram-bot-api";

export const createWelcomeNewChatMembersMessage = (
  newChatMembers: TelegramBot.User[],
): string =>
  (newChatMembers.length > 1
    ? `👋 ${newChatMembers
        .slice(0, -1)
        .map((newChatMember: TelegramBot.User) => newChatMember.first_name)
        .join(
          ", ",
        )} and ${newChatMembers[newChatMembers.length - 1]}! Welcome to the Wordle Championship my friends!`
    : `👋 ${newChatMembers[0].first_name}! Welcome to the Wordle Championship my friend!`) +
  " " +
  "☝️Check out the linked message for further information.";

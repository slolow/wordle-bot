export const createNotAbleToUpdatePlayersStatsMessage = (
  winnersOfTheDayMessage: string,
): string =>
  "😭 Unfortunately, due to a technical error, I won't be able to include the results in the overall" +
  "statistics today. Scusi my friends! 😭 \n\n Nevertheless here are the results for today: " +
  `\n\n ${winnersOfTheDayMessage}`;

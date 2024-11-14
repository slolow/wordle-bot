export const createNotAbleToUpdatePlayersStatsMessage = (
  messageOfTheDay: string,
): string =>
  "😭 Unfortunately, due to a technical error, I won't be able to include the yesterday's results in the overall" +
  "statistics. Scusi my friends!\n\n Nevertheless here are the results for Yesterday: " +
  `\n\n ${messageOfTheDay}`;

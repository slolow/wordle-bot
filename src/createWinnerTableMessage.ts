import { PlayerStats } from "./data-structure/dataTypes";

export const createWinnerTableMessage = (
  playersStats: PlayerStats[],
): string => {
  return `
| place | name | wins | played games | wins/played games | average attempts |

| 1. | Alice | 20 | 40 | 50% | 3 |
| 2. | Bob | 5 | 10 | 50% | 2 |
| 3. | Chad | 1 | 100 | 1% | 5 |
`;
};

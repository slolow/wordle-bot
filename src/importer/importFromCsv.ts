import {
  PlayerStats,
  PlayerStatsOfTheDay,
} from "../data-structure/dataTypes.js";
import { readFile } from "node:fs";
import Papa, { type ParseResult } from "papaparse";

export const importFromCsv = (
  filePath: string,
): Promise<PlayerStats[] | PlayerStatsOfTheDay[]> => {
  return new Promise((resolve, reject) => {
    readFile(
      filePath,
      "utf-8",
      (error: NodeJS.ErrnoException | null, data: string) => {
        if (error) {
          return reject(error);
        }

        if (data.length === 0) {
          return resolve([]);
        }

        Papa.parse<PlayerStats | PlayerStatsOfTheDay>(data, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (result: ParseResult<PlayerStats>) => {
            if (result.errors.length > 0) {
              reject(result.errors);
            } else {
              resolve(result.data);
            }
          },
        });
      },
    );
  });
};

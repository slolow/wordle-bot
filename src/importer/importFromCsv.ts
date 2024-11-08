import { PlayerStats } from "../data-structure/dataTypes.js";
import { readFile } from "node:fs";
import Papa, { type ParseResult } from "papaparse";

export const importFromCsv = (filePath: string): Promise<PlayerStats[]> => {
  return new Promise((resolve, reject) => {
    readFile(
      filePath,
      "utf-8",
      (error: NodeJS.ErrnoException | null, data: string) => {
        if (error) {
          return reject(error);
        }

        Papa.parse<PlayerStats>(data, {
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

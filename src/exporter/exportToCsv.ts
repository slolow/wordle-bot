import { PlayerStats } from "../data-structure/dataTypes.js";
import Papa from "papaparse";
import { writeFile } from "node:fs";

export const exportToCsv = (
  filePath: string,
  data: PlayerStats[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Convert data to CSV format
    const csv: string = Papa.unparse(data);

    writeFile(
      filePath,
      csv,
      "utf8",
      (error: NodeJS.ErrnoException | null): void =>
        error ? reject(error) : resolve(),
    );
  });
};

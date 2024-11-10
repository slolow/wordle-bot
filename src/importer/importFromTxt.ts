import { readFile } from "node:fs";

export const importFromTxt = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    readFile(
      filePath,
      "utf-8",
      (error: NodeJS.ErrnoException | null, data: string) =>
        error ? reject(error) : resolve(data),
    );
  });
};

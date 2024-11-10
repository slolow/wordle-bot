import { writeFile } from "node:fs";

export const exportToTxt = (filePath: string, data: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    writeFile(
      filePath,
      data,
      "utf8",
      (error: NodeJS.ErrnoException | null): void =>
        error ? reject(error) : resolve(),
    );
  });
};

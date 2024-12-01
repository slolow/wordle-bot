import path from "path";
import fs from "fs";

const getVersion = (): string => {
  const packageJsonPath: string = path.resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
};

export const createAnnouncementMessage = () => `
🆙 My friends! I, Wordletron 3000, grew up to version ${getVersion()}.

🎁 New features:
- multiple wordle gods announcement
- new version announcement
- short downtimes announcement

🩹 Fixes:
- stats of the day persistence
- wrong stats
- typos and text structures in messages

🧑🏻‍💻 Dev features:
- dev bot creation
`;

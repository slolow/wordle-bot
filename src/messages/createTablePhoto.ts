import { PlayerStats } from "../data-structure/dataTypes.js";
import { createCanvas } from "@napi-rs/canvas";

const WIDTH = 600;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 50;
const PADDING = 10;

export const createTablePhoto = (
  updatedPlayersStats: PlayerStats[],
): Buffer => {
  const canvas = createCanvas(
    WIDTH,
    HEADER_HEIGHT + ROW_HEIGHT * updatedPlayersStats.length + PADDING,
  );

  const ctx = canvas.getContext("2d");
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#bfbdbd";

  // only show most important stats in photo due to limited space
  const headers: string[] = [
    "place",
    ...Object.keys(updatedPlayersStats[0]).slice(0, 3),
  ];

  const columnWidth: number = WIDTH / headers.length;

  // draw header row
  headers.forEach((header: string, i: number) => {
    ctx.fillText(header, i * columnWidth + PADDING, HEADER_HEIGHT / 2);

    // draw vertical lines between columns. Start after first and end before last column
    if (i <= headers.length - 2) {
      ctx.moveTo((i + 1) * columnWidth, 0);
      ctx.lineTo((i + 1) * columnWidth, canvas.height);
    }
  });
  ctx.stroke();

  // draw horizontal line below header
  ctx.moveTo(0, HEADER_HEIGHT - PADDING);
  ctx.lineTo(WIDTH, HEADER_HEIGHT - PADDING);
  ctx.stroke();

  // draw data rows
  updatedPlayersStats.forEach((row: PlayerStats, rowIndex: number) => {
    headers.forEach((header: string, colIndex: number) => {
      // The value for the first column (place) is the rowIndex since the updatedPlayersStats are sorted
      const value: string =
        colIndex === 0
          ? (rowIndex + 1).toString()
          : row[header as keyof PlayerStats].toString();
      ctx.fillText(
        value,
        colIndex * columnWidth + PADDING,
        HEADER_HEIGHT + ROW_HEIGHT * rowIndex + PADDING * 2,
      );
    });
  });

  return canvas.toBuffer("image/jpeg");
};

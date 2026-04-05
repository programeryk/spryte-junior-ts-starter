import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Seat } from "./seat.types";

const seatsFilePath = path.resolve(process.cwd(), "data", "seats.json");

let seatsCache: Seat[] | null = null;

const readSeatsFromFile = async (): Promise<Seat[]> => {
  const fileContent = await readFile(seatsFilePath, "utf-8");
  return JSON.parse(fileContent) as Seat[]; //no validation for JSON shape
};

const cloneSeat = (seat: Seat): Seat => ({ ...seat });

const getCacheOrThrow = (): Seat[] => {
  if (!seatsCache) {
    throw new Error("Seat repository is not initialized"); //using english for debugging and collaboration coherence
  }
  return seatsCache;
};

const initialize = async (): Promise<void> => {
  if (seatsCache) {
    return;
  }
  seatsCache = await readSeatsFromFile();
}

export const seatRepository = {

  async getAll(): Promise<Seat[]> {
    await initialize();
    return getCacheOrThrow().map(cloneSeat);
  },

  async saveAll(seats: Seat[]): Promise<void> {
    seatsCache = seats.map(cloneSeat);
    await writeFile(seatsFilePath, JSON.stringify(seatsCache, null, 2), "utf-8");
  },
};

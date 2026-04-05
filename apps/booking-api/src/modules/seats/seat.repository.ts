import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Seat } from "./seat.types";

const seatsFilePath = path.resolve(process.cwd(), "data", "seats.json");

let seatsCache: Seat[] | null = null;

const readSeatsFromFile = async (): Promise<Seat[]> => {
  const fileContent = await readFile(seatsFilePath, "utf-8");
  return JSON.parse(fileContent) as Seat[];
};

const cloneSeat = (seat: Seat): Seat => ({ ...seat });

export const seatRepository = {
  async initialize(): Promise<void> {
    if (seatsCache) {
      return;
    }

    seatsCache = await readSeatsFromFile();
  },

  async getAll(): Promise<Seat[]> {
    await this.initialize();
    return seatsCache!.map(cloneSeat);
  },

  async findById(seatId: string): Promise<Seat | undefined> {
    await this.initialize();
    return seatsCache!.find((seat) => seat.id === seatId);
  },

  async saveAll(seats: Seat[]): Promise<void> {
    seatsCache = seats.map(cloneSeat);

    await writeFile(seatsFilePath, JSON.stringify(seatsCache, null, 2), "utf-8");
  },
};

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { SeatsAlreadyReservedError, SeatsNotFoundError } from "./seat.errors";
import type { Seat } from "./seat.types";

const seatsFilePath = path.resolve(process.cwd(), "data", "seats.json");

let seatsCache: Seat[] | null = null;
let reservationWriteQueue: Promise<void> = Promise.resolve();

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
};

const runReservationWrite = async <T>(task: () => Promise<T>): Promise<T> => {
  const run = reservationWriteQueue.then(task, task);

  reservationWriteQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
};

export const seatRepository = {
  async initialize(): Promise<void> {
    await initialize();
  },

  async getAll(): Promise<Seat[]> {
    return getCacheOrThrow().map(cloneSeat);
  },

  async reserveSeats(seatIds: string[]): Promise<Seat[]> {
    return runReservationWrite(async () => {
      const seats = getCacheOrThrow().map(cloneSeat);
      const seatsById = new Map(seats.map((seat) => [seat.id, seat]));
      const reservedSeats: Seat[] = [];
      const missingSeatIds: string[] = [];
      const alreadyReservedSeatIds: string[] = [];

      for (const seatId of seatIds) {
        const seat = seatsById.get(seatId);

        if (!seat) {
          missingSeatIds.push(seatId);
          continue;
        }

        if (seat.status === "reserved") {
          alreadyReservedSeatIds.push(seatId);
          continue;
        }

        reservedSeats.push(seat);
      }

      if (missingSeatIds.length > 0) {
        throw new SeatsNotFoundError(missingSeatIds);
      }

      if (alreadyReservedSeatIds.length > 0) {
        throw new SeatsAlreadyReservedError(alreadyReservedSeatIds);
      }

      for (const seat of reservedSeats) {
        seat.status = "reserved";
      }

      seatsCache = seats.map(cloneSeat);
      await writeFile(seatsFilePath, JSON.stringify(seatsCache, null, 2), "utf-8");

      return reservedSeats.map(cloneSeat);
    });
  },
};

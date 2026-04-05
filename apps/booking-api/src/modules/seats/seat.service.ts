import {
  InvalidSeatIdError,
  SeatAlreadyReservedError,
  SeatNotFoundError,
} from "./seat.errors";
import { seatRepository } from "./seat.repository";
import type { Seat } from "./seat.types";

const seatIdPattern = /^R\d+S\d+$/;

let reservationQueue: Promise<void> = Promise.resolve();

const runExclusive = async <T>(task: () => Promise<T>): Promise<T> => {
  const run = reservationQueue.then(task, task);

  reservationQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
};

const validateSeatId = (seatId: string): void => {
  if (!seatIdPattern.test(seatId)) {
    throw new InvalidSeatIdError(seatId);
  }
};

export const seatService = {
  async getSeats(): Promise<Seat[]> {
    return seatRepository.getAll();
  },

  async reserveSeat(seatId: string): Promise<Seat> {
    validateSeatId(seatId);

    return runExclusive(async () => {
      const seats = await seatRepository.getAll();
      const seat = seats.find((candidate) => candidate.id === seatId);

      if (!seat) {
        throw new SeatNotFoundError(seatId);
      }

      if (seat.status === "reserved") {
        throw new SeatAlreadyReservedError(seatId);
      }

      seat.status = "reserved";
      await seatRepository.saveAll(seats);

      return { ...seat };
    });
  },
};

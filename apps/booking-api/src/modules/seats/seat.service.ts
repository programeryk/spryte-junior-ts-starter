import {
  InvalidSeatIdError,
} from "./seat.errors";
import { seatRepository } from "./seat.repository";
import type { Seat } from "./seat.types";

const seatIdPattern = /^R\d+S\d+$/;

const validateSeatId = (seatId: string): void => {
  if (!seatIdPattern.test(seatId)) {
    throw new InvalidSeatIdError(seatId);
  }
};

export const seatService = {
  async getSeats(): Promise<Seat[]> {
    const seats = await seatRepository.getAll();
    return seats.map((seat) => ({ ...seat }));
  },

  async reserveSeats(seatIds: string[]): Promise<Seat[]> {
    for (const seatId of seatIds) {
      validateSeatId(seatId);
    }

    return seatRepository.reserveSeats(seatIds);
  },

  async reserveSeat(seatId: string): Promise<Seat> {
    const [reservedSeat] = await this.reserveSeats([seatId]);
    return reservedSeat;
  },
};

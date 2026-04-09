import {
  DuplicateSeatIdsError,
  InvalidReservationRequestError,
  InvalidSeatIdsError,
} from "./seat.errors";
import { seatRepository } from "./seat.repository";
import type { Seat } from "./seat.types";

const seatIdPattern = /^R\d+S\d+$/;

const getInvalidSeatIds = (seatIds: string[]): string[] =>
  seatIds.filter((seatId) => !seatIdPattern.test(seatId));

const getDuplicateSeatIds = (seatIds: string[]): string[] => {
  const seenSeatIds = new Set<string>();
  const duplicateSeatIds = new Set<string>();

  for (const seatId of seatIds) {
    if (seenSeatIds.has(seatId)) {
      duplicateSeatIds.add(seatId);
      continue;
    }

    seenSeatIds.add(seatId);
  }

  return [...duplicateSeatIds];
};

export const seatService = {
  async getSeats(): Promise<Seat[]> {
    return seatRepository.getAll();
  },

  async reserveSeats(seatIds: string[]): Promise<Seat[]> {
    if (seatIds.length === 0) {
      throw new InvalidReservationRequestError();
    }

    const invalidSeatIds = getInvalidSeatIds(seatIds);
    if (invalidSeatIds.length > 0) {
      throw new InvalidSeatIdsError(invalidSeatIds);
    }

    const duplicateSeatIds = getDuplicateSeatIds(seatIds);
    if (duplicateSeatIds.length > 0) {
      throw new DuplicateSeatIdsError(duplicateSeatIds);
    }

    return seatRepository.reserveSeats(seatIds);
  },

  async reserveSeat(seatId: string): Promise<Seat> {
    const [reservedSeat] = await this.reserveSeats([seatId]);
    return reservedSeat;
  },
};

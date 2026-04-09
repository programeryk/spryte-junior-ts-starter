import { InvalidReservationRequestError } from "./seat.errors";
import type { ReserveSeatsRequest } from "./seat.types";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const parseReserveSeatsRequest = (
  payload: unknown,
): ReserveSeatsRequest => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new InvalidReservationRequestError(
      "Reservation request body must be an object with a seatIds array.",
    );
  }

  const { seatIds } = payload as { seatIds?: unknown };

  if (!isStringArray(seatIds)) {
    throw new InvalidReservationRequestError(
      "Reservation request body must include seatIds as an array of strings.",
    );
  }

  return {
    seatIds,
  };
};

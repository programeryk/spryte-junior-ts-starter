export class InvalidReservationRequestError extends Error {
  constructor(message = "Reservation request must include at least one seat id.") {
    super(message);
    this.name = "InvalidReservationRequestError";
  }
}

export class InvalidSeatIdsError extends Error {
  readonly seatIds: string[];

  constructor(seatIds: string[]) {
    const normalizedSeatIds = [...seatIds];
    const label = normalizedSeatIds.length === 1 ? "Seat id" : "Seat ids";
    const formattedSeatIds = normalizedSeatIds.map((seatId) => `"${seatId}"`).join(", ");

    super(`${label} ${formattedSeatIds} ${normalizedSeatIds.length === 1 ? "is" : "are"} invalid.`);
    this.name = "InvalidSeatIdsError";
    this.seatIds = normalizedSeatIds;
  }
}

export class DuplicateSeatIdsError extends Error {
  readonly seatIds: string[];

  constructor(seatIds: string[]) {
    const normalizedSeatIds = [...seatIds];

    super(`Reservation request contains duplicate seat ids: ${normalizedSeatIds.join(", ")}.`);
    this.name = "DuplicateSeatIdsError";
    this.seatIds = normalizedSeatIds;
  }
}

export class SeatsNotFoundError extends Error {
  readonly seatIds: string[];

  constructor(seatIds: string[]) {
    const normalizedSeatIds = [...seatIds];

    super(`Seats not found: ${normalizedSeatIds.join(", ")}.`);
    this.name = "SeatsNotFoundError";
    this.seatIds = normalizedSeatIds;
  }
}

export class SeatsAlreadyReservedError extends Error {
  readonly seatIds: string[];

  constructor(seatIds: string[]) {
    const normalizedSeatIds = [...seatIds];

    super(`Seats already reserved: ${normalizedSeatIds.join(", ")}.`);
    this.name = "SeatsAlreadyReservedError";
    this.seatIds = normalizedSeatIds;
  }
}

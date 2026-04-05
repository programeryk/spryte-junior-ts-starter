export class SeatNotFoundError extends Error {
  constructor(seatId: string) {
    super(`Seat ${seatId} was not found.`);
    this.name = "SeatNotFoundError";
  }
}

export class InvalidSeatIdError extends Error {
  constructor(seatId: string) {
    super(`Seat id "${seatId}" is invalid.`);
    this.name = "InvalidSeatIdError";
  }
}

export class SeatAlreadyReservedError extends Error {
  constructor(seatId: string) {
    super(`Seat ${seatId} is already reserved.`);
    this.name = "SeatAlreadyReservedError";
  }
}

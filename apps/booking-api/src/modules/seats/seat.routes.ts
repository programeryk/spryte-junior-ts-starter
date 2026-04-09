import { Router } from "express";

import {
  DuplicateSeatIdsError,
  InvalidReservationRequestError,
  InvalidSeatIdsError,
  SeatsAlreadyReservedError,
  SeatsNotFoundError,
} from "./seat.errors";
import { parseReserveSeatsRequest } from "./seat.requests";
import { seatService } from "./seat.service";
import type { ApiError } from "./seat.types";

const createApiError = (error: string, message: string): ApiError => ({
  error,
  message,
});

export const seatRoutes = Router();

seatRoutes.get("/", async (_req, res) => {
  try {
    const seats = await seatService.getSeats();
    return res.status(200).json(seats);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(createApiError("INTERNAL_SERVER_ERROR", "Failed to load seats."));
  }
});

seatRoutes.post("/:seatId/reserve", async (req, res) => {
  try {
    const { seatIds } = parseReserveSeatsRequest({
      seatIds: [req.params.seatId],
    });
    const [reservedSeat] = await seatService.reserveSeats(seatIds);
    return res.status(200).json(reservedSeat);
  } catch (error) {
    if (
      error instanceof InvalidReservationRequestError ||
      error instanceof InvalidSeatIdsError ||
      error instanceof DuplicateSeatIdsError
    ) {
      return res
        .status(400)
        .json(createApiError("INVALID_SEAT_ID", error.message));
    }

    if (error instanceof SeatsNotFoundError) {
      return res.status(404).json(createApiError("SEAT_NOT_FOUND", error.message));
    }

    if (error instanceof SeatsAlreadyReservedError) {
      return res
        .status(409)
        .json(createApiError("SEAT_ALREADY_RESERVED", error.message));
    }
    console.error(error);

    return res
      .status(500)
      .json(
        createApiError(
          "INTERNAL_SERVER_ERROR",
          "Failed to reserve the requested seat.",
        ),
      );
  }
});

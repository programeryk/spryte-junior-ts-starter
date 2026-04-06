import { Router } from "express";

import {
  InvalidSeatIdError,
  SeatAlreadyReservedError,
  SeatNotFoundError,
} from "./seat.errors";
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
    const reservedSeat = await seatService.reserveSeat(req.params.seatId);
    return res.status(200).json(reservedSeat);
  } catch (error) {
    if (error instanceof InvalidSeatIdError) {
      return res
        .status(400)
        .json(createApiError("INVALID_SEAT_ID", error.message));
    }

    if (error instanceof SeatNotFoundError) {
      return res.status(404).json(createApiError("SEAT_NOT_FOUND", error.message));
    }

    if (error instanceof SeatAlreadyReservedError) {
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

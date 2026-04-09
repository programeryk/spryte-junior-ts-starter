import type { NextFunction, Request, RequestHandler, Response } from "express";

import {
  DuplicateSeatIdsError,
  InvalidReservationRequestError,
  InvalidSeatIdsError,
  SeatsAlreadyReservedError,
  SeatsNotFoundError,
} from "./seat.errors";
import type { ApiError } from "./seat.types";

const createApiError = (
  error: string,
  message: string,
  details?: ApiError["details"],
): ApiError => ({
  error,
  message,
  details,
});

export const asyncRoute =
  (
    handler: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    void handler(req, res, next).catch(next);
  };

export const seatErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ApiError>,
  next: NextFunction,
): void => {
  if (error instanceof InvalidReservationRequestError) {
    res
      .status(400)
      .json(createApiError("INVALID_RESERVATION_REQUEST", error.message));
    return;
  }

  if (error instanceof InvalidSeatIdsError) {
    res.status(400).json(
      createApiError("INVALID_SEAT_IDS", error.message, {
        seatIds: error.seatIds,
      }),
    );
    return;
  }

  if (error instanceof DuplicateSeatIdsError) {
    res.status(400).json(
      createApiError("DUPLICATE_SEAT_IDS", error.message, {
        seatIds: error.seatIds,
      }),
    );
    return;
  }

  if (error instanceof SeatsNotFoundError) {
    res.status(404).json(
      createApiError("SEATS_NOT_FOUND", error.message, {
        seatIds: error.seatIds,
      }),
    );
    return;
  }

  if (error instanceof SeatsAlreadyReservedError) {
    res.status(409).json(
      createApiError("SEATS_ALREADY_RESERVED", error.message, {
        seatIds: error.seatIds,
      }),
    );
    return;
  }

  next(error);
};

export const internalServerErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response<ApiError>,
  _next: NextFunction,
): void => {
  console.error(error);
  res.status(500).json(
    createApiError(
      "INTERNAL_SERVER_ERROR",
      "The server could not process the request.",
    ),
  );
};

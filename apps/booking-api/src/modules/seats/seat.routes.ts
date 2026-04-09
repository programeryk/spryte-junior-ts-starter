import { Router } from "express";

import { asyncRoute } from "./seat.http";
import { parseReserveSeatsRequest, parseSeatIdParam } from "./seat.requests";
import { seatService } from "./seat.service";

export const seatRoutes = Router();

seatRoutes.get(
  "/",
  asyncRoute(async (_req, res) => {
    const seats = await seatService.getSeats();
    return res.status(200).json(seats);
  }),
);

seatRoutes.post(
  "/reservations",
  asyncRoute(async (req, res) => {
    const { seatIds } = parseReserveSeatsRequest(req.body);
    const reservedSeats = await seatService.reserveSeats(seatIds);
    return res.status(200).json(reservedSeats);
  }),
);

seatRoutes.post(
  "/:seatId/reserve",
  asyncRoute(async (req, res) => {
    const seatId = parseSeatIdParam(req.params.seatId);
    const reservedSeat = await seatService.reserveSeat(seatId);
    return res.status(200).json(reservedSeat);
  }),
);

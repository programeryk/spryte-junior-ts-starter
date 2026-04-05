# Mini Cinema Booking MVP

This repository contains a small cinema seat booking MVP built with:

- `apps/booking-app`: Next.js frontend on `http://localhost:3000`
- `apps/booking-api`: Express API on `http://localhost:3001`

The goal is to keep the solution interview-friendly: simple, readable, and complete enough to demonstrate a full booking flow without overengineering the backend.

## MVP Scope

- Single room, single screening
- `5 x 8` seat layout
- Frontend supports multi-select
- Backend keeps a simple single-seat reservation endpoint
- Seat data is stored in JSON, loaded into memory on startup, and written back after successful reservations
- `selected` is frontend-only UI state and is not persisted by the API

## Planned API Contract

### `GET /seats`

- `200` with `Seat[]`

### `POST /seats/:seatId/reserve`

- `200` with the updated `Seat`
- `400` for invalid input
- `404` for unknown seat
- `409` for an already reserved seat

Normalized error shape:

```json
{
  "error": "SEAT_ALREADY_RESERVED",
  "message": "Seat R1S1 is already reserved."
}
```

Core types:

```ts
type SeatStatus = "free" | "reserved";

type Seat = {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
};
```

## Project Structure

```text
apps/
  booking-app/
  booking-api/
    data/
      seats.json
    src/
      app.ts
      index.ts
      modules/
        seats/
          seat.errors.ts
          seat.types.ts
```

The backend is being built feature-first so that seat-related types, errors, persistence, services, and routes stay grouped together as the API grows.

## Getting Started

Install dependencies from the repository root:

```powershell
corepack pnpm install
```

Start the API:

```powershell
corepack pnpm --dir apps/booking-api dev
```

Start the frontend in a separate terminal:

```powershell
corepack pnpm --dir apps/booking-app dev
```

Open:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`

## Backend Notes

- The API defaults to port `3001`
- JSON persistence is acceptable for this local MVP
- Reservations should survive an API restart because the full seat state is written back to `apps/booking-api/data/seats.json`
- This approach is not suitable for real concurrency or multi-instance deployment

## Manual Acceptance Goals

- `GET /seats` returns exactly `40` seats
- Reserved seats are visible and cannot be selected
- Free seats can be selected and deselected
- The reserve action is disabled when no seats are selected
- Reserving a free seat updates the UI after a refetch
- Reserving the same seat again returns `409`
- Unknown seat IDs return `404`
- Partial success is handled cleanly when multiple seats are selected
- Restarting the API preserves reservations from the JSON file

## Assumptions

- No authentication, payments, or user accounts
- No seat hold timeout logic
- No automated test suite in the MVP
- The single-seat reservation endpoint is an intentional scope choice

## Future Improvements

- Batch reservation endpoint
- Automated tests
- Database-backed persistence
- Atomic reservations and locking
- Multiple rooms and showtimes

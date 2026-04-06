"use client";

import { useCallback, useEffect, useState } from "react";

type SeatStatus = "free" | "reserved";

type Seat = {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
};

type ApiError = {
  error: string;
  message: string;
};

type LoadSeatsOptions = {
  keepFeedback?: boolean;
  showBlockingError?: boolean;
  signal?: AbortSignal;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const legendItems = [
  { label: "Wolne", colorClass: "border-emerald-300 bg-emerald-400" },
  { label: "Wybrane", colorClass: "border-amber-300 bg-amber-400" },
  { label: "Zarezerwowane", colorClass: "border-slate-300 bg-slate-300" },
];

const seatStyles: Record<SeatStatus, string> = {
  free: "border-slate-300 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50",
  reserved:
    "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500 opacity-70",
};

const getPolishCountForm = (
  count: number,
  singular: string,
  paucal: string,
  plural: string,
): string => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (count === 1) {
    return singular;
  }

  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) {
    return plural;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return paucal;
  }

  return plural;
};

const getSeatWord = (count: number): string =>
  getPolishCountForm(count, "miejsce", "miejsca", "miejsc");

const getFailedReservationWord = (count: number): string =>
  getPolishCountForm(count, "rezerwacja", "rezerwacje", "rezerwacji");

const getReservationSummary = (
  successCount: number,
  conflictCount: number,
  failureCount: number,
): string => {
  const parts: string[] = [];

  if (successCount > 0) {
    parts.push(`Zarezerwowano ${successCount} ${getSeatWord(successCount)}.`);
  }

  if (conflictCount > 0) {
    parts.push(
      `Nie udalo sie zarezerwowac ${conflictCount} ${getSeatWord(conflictCount)} z powodu wczesniejszej rezerwacji.`,
    );
  }

  if (failureCount > 0) {
    parts.push(
      `W ${failureCount} ${getFailedReservationWord(failureCount)} wystapil blad.`,
    );
  }

  if (parts.length === 0) {
    return "Nie wybrano miejsc do rezerwacji.";
  }

  return parts.join(" ");
};

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const loadSeats = useCallback(
    async ({
      keepFeedback = true,
      showBlockingError = true,
      signal,
    }: LoadSeatsOptions = {}): Promise<boolean> => {
      setErrorMessage(null);
      setWarningMessage(null);

      if (!keepFeedback) {
        setFeedbackMessage(null);
      }

      try {
        const response = await fetch(`${apiBaseUrl}/seats`, {
          cache: "no-store",
          signal,
        });

        if (!response.ok) {
          throw new Error("Nie udalo sie pobrac miejsc.");
        }

        const nextSeats = (await response.json()) as Seat[];

        if (signal?.aborted) {
          return false;
        }

        setSeats(nextSeats);
        setSelectedSeatIds((currentSelection) =>
          currentSelection.filter((seatId) =>
            nextSeats.some(
              (seat) => seat.id === seatId && seat.status === "free",
            ),
          ),
        );
        return true;
      } catch (error) {
        if (signal?.aborted) {
          return false;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return false;
        }

        if (showBlockingError) {
          setErrorMessage(
            "Nie udalo sie wczytac ukladu sali. Sprobuj ponownie.",
          );
        } else {
          setWarningMessage(
            "Nie udalo sie odswiezyc ukladu sali. Odswiez strone, aby pobrac najnowszy stan.",
          );
        }

        return false;
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    void loadSeats({
      signal: controller.signal,
    }).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadSeats]);

  const rows = Array.from({ length: 5 }, (_, rowIndex) => rowIndex + 1).map(
    (row) => ({
      row,
      seats: seats
        .filter((seat) => seat.row === row)
        .sort((left, right) => left.number - right.number),
    }),
  );

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === "reserved" || isSubmitting) {
      return;
    }

    setFeedbackMessage(null);
    setSelectedSeatIds((currentSelection) =>
      currentSelection.includes(seat.id)
        ? currentSelection.filter((seatId) => seatId !== seat.id)
        : [...currentSelection, seat.id],
    );
  };

  const handleReservation = async () => {
    if (selectedSeatIds.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    setWarningMessage(null);

    const seatIdsToReserve = [...selectedSeatIds];
    let successCount = 0;
    let conflictCount = 0;
    let failureCount = 0;

    try {
      for (const seatId of seatIdsToReserve) {
        try {
          const response = await fetch(
            `${apiBaseUrl}/seats/${seatId}/reserve`,
            {
              method: "POST",
            },
          );

          if (response.ok) {
            successCount += 1;
            continue;
          }

          const apiError = (await response
            .json()
            .catch(() => null)) as ApiError | null;

          if (
            response.status === 409 ||
            apiError?.error === "SEAT_ALREADY_RESERVED"
          ) {
            conflictCount += 1;
            continue;
          }

          failureCount += 1;
        } catch {
          failureCount += 1;
        }
      }

      const reservationSummary = getReservationSummary(
        successCount,
        conflictCount,
        failureCount,
      );
      const didRefreshSeats = await loadSeats({
        showBlockingError: false,
      });

      setSelectedSeatIds([]);
      setFeedbackMessage(
        didRefreshSeats
          ? reservationSummary
          : `${reservationSummary} Nie udalo sie odswiezyc widoku po rezerwacji.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#e2e8f0_42%,_#cbd5e1_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
                Mini Cinema
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Wybierz miejsca na dzisiejszy seans
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Ten widok pokazuje aktualna dostepnosc miejsc z API rezerwacji.
                Zarezerwowane miejsca sa zablokowane, a wolne miejsca mozesz
                zaznaczyc i zarezerwowac ponizej.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Uklad sali</p>
              <p>5 rzedow | 8 miejsc w rzedzie | jeden seans</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 px-6 py-8 shadow-[0_16px_60px_rgba(15,23,42,0.10)] backdrop-blur sm:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Mapa miejsc
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dostepnosc miejsc jest pobierana z API przy ladowaniu strony.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {legendItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-600"
                >
                  <span
                    className={`h-3 w-3 rounded-full border ${item.colorClass}`}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.4em] text-slate-100">
            Ekran
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
              Ladowanie miejsc...
            </div>
          ) : errorMessage ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-rose-700">
                {errorMessage}
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    void loadSeats({ keepFeedback: false }).finally(() =>
                      setIsLoading(false),
                    );
                  }}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Sprobuj ponownie
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {rows.map(({ row, seats: rowSeats }) => (
                  <div
                    key={row}
                    className="grid grid-cols-[auto_1fr] items-center gap-3 sm:gap-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
                      R{row}
                    </div>

                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => toggleSeatSelection(seat)}
                            disabled={
                              seat.status === "reserved" || isSubmitting
                            }
                            className={`h-12 rounded-2xl border text-sm font-semibold transition-transform sm:h-14 ${
                              isSelected
                                ? "border-amber-300 bg-amber-100 text-amber-950 shadow-sm"
                                : seatStyles[seat.status]
                            }`}
                            aria-pressed={isSelected}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">
                    Wybrane miejsca: {selectedSeatIds.length}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedSeatIds.length > 0
                      ? selectedSeatIds.join(", ")
                      : "Zaznacz wolne miejsca, aby je zarezerwowac."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReservation}
                  disabled={selectedSeatIds.length === 0 || isSubmitting}
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "Trwa rezerwacja..." : "Rezerwuj"}
                </button>
              </div>

              {feedbackMessage ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-800">
                  {feedbackMessage}
                </div>
              ) : null}

              {warningMessage ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
                  {warningMessage}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

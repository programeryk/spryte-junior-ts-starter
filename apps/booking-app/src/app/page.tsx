"use client";

import { useEffect, useState } from "react";

type SeatStatus = "free" | "reserved";

type Seat = {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const legendItems: Array<{ label: string; status: SeatStatus }> = [
  { label: "Wolne", status: "free" },
  { label: "Zarezerwowane", status: "reserved" },
];

const seatStyles: Record<SeatStatus, string> = {
  free: "border-slate-300 bg-white text-slate-900 shadow-sm",
  reserved: "border-slate-200 bg-slate-200 text-slate-500 opacity-70",
};

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadSeats = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`${apiBaseUrl}/seats`);

        if (!response.ok) {
          throw new Error("Nie udalo sie pobrac miejsc.");
        }

        const nextSeats = (await response.json()) as Seat[];

        if (!ignore) {
          setSeats(nextSeats);
        }
      } catch {
        if (!ignore) {
          setErrorMessage("Nie udalo sie wczytac ukladu sali. Sprobuj ponownie.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadSeats();

    return () => {
      ignore = true;
    };
  }, []);

  const rows = Array.from({ length: 8 }, (_, rowIndex) => rowIndex + 1).map((row) => ({
    row,
    seats: seats
      .filter((seat) => seat.row === row)
      .sort((left, right) => left.number - right.number),
  }));

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
                Zarezerwowane miejsca sa zablokowane, a wybor wolnych miejsc dodamy
                w nastepnym kroku.
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
              <h2 className="text-xl font-semibold text-slate-950">Mapa miejsc</h2>
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
                    className={`h-3 w-3 rounded-full border ${item.status === "free" ? "border-emerald-300 bg-emerald-400" : "border-slate-300 bg-slate-300"}`}
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
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-rose-700">
              {errorMessage}
            </div>
          ) : (
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
                    {rowSeats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={seat.status === "reserved"}
                        className={`h-12 rounded-2xl border text-sm font-semibold transition-transform sm:h-14 ${seatStyles[seat.status]} ${seat.status === "free" ? "hover:-translate-y-0.5" : "cursor-not-allowed"}`}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

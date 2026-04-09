# Mini Cinema Booking MVP

Proste MVP systemu rezerwacji miejsc w kinie zbudowane w monorepo:

- `apps/booking-app` - frontend w Next.js dostepny pod `http://localhost:3000`
- `apps/booking-api` - backend w Express dostepny pod `http://localhost:3001`

Aplikacja pokazuje aktualny uklad sali, pozwala wybrac wolne miejsca i wysyla jedna atomowa prosbe o rezerwacje calego zestawu miejsc.

## Zakres MVP

- jedna sala
- jeden seans
- uklad `5 x 8`
- wybor wielu miejsc po stronie frontendu
- atomowa rezerwacja wielu miejsc w jednym zadaniu
- kompatybilny endpoint do rezerwacji pojedynczego miejsca
- stan miejsc zapisywany w pliku JSON
- dane ladowane do pamieci przy starcie API
- `selected` istnieje tylko w stanie UI i nie jest zapisywane po stronie serwera

## Uruchomienie projektu

Najpierw zainstaluj zaleznosci w katalogu glownym repozytorium:

```powershell
corepack pnpm install
```

Uruchom backend:

```powershell
corepack pnpm --dir apps/booking-api dev
```

Uruchom frontend w drugim terminalu:

```powershell
corepack pnpm --dir apps/booking-app dev
```

Po uruchomieniu aplikacje beda dostepne pod adresami:

- frontend: `http://localhost:3000`
- API: `http://localhost:3001`

## Jak dziala rezerwacja

Frontend wysyla jedna prosbe `POST /seats/reservations` z lista wybranych miejsc.
Backend sprawdza caly zestaw miejsc i:

- rezerwuje wszystkie miejsca, jesli caly zestaw jest poprawny i dostepny
- odrzuca cale zadanie, jesli chociaz jedno miejsce jest niepoprawne, nie istnieje albo jest juz zarezerwowane

Ta gwarancja jest atomowa tylko w granicach jednej instancji API. Aplikacja nie udaje pelnej rozproszonej kontroli wspolbieznosci i nie zastapi transakcji bazodanowych.

## Startup API

Repozytorium miejsc jest inicjalizowane przed `app.listen(...)`.
Jesli `apps/booking-api/data/seats.json` jest uszkodzony albo niedostepny, backend konczy start bleduem zamiast przyjmowac ruch i wysypac sie dopiero przy pierwszym zadaniu.

## API

### `GET /seats`

Zwraca pelna liste miejsc jako `Seat[]`.

### `POST /seats/reservations`

Probuj zarezerwowac wiele miejsc atomowo.

Przykladowe body:

```json
{
  "seatIds": ["R1S1", "R1S2"]
}
```

Mozliwe odpowiedzi:

- `200` z lista zarezerwowanych miejsc
- `400` dla nieprawidlowego body, nieprawidlowych identyfikatorow lub duplikatow
- `404` gdy przynajmniej jedno miejsce nie istnieje
- `409` gdy przynajmniej jedno miejsce jest juz zarezerwowane

Przykladowy blad:

```json
{
  "error": "SEATS_ALREADY_RESERVED",
  "message": "Seats already reserved: R2S1.",
  "details": {
    "seatIds": ["R2S1"]
  }
}
```

### `POST /seats/:seatId/reserve`

Kompatybilny endpoint do rezerwacji pojedynczego miejsca. Korzysta z tej samej logiki batch reservation co endpoint `/seats/reservations`.

## Glowne typy

```ts
type SeatStatus = "free" | "reserved";

type Seat = {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
};

type ReserveSeatsRequest = {
  seatIds: string[];
};
```

## Struktura projektu

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
          seat.http.ts
          seat.repository.ts
          seat.requests.ts
          seat.routes.ts
          seat.service.ts
          seat.types.ts
```

## Ograniczenia

- zapis do JSON wystarcza dla lokalnego MVP, ale nie nadaje sie do produkcyjnej skali
- stan jest trzymany w pamieci po starcie API, wiec reczna zmiana pliku JSON wymaga restartu backendu
- gwarancja all-or-nothing dotyczy jednej instancji API, nie wielu instancji aplikacji
- brak logowania, platnosci i mechanizmu czasowego hold na miejsce
- brak automatycznych testow; w tej wersji projekt jest weryfikowany manualnie

## Manualna lista kontrolna

- `GET /seats` zwraca dokladnie `40` miejsc
- miejsca juz zarezerwowane sa widoczne i nie da sie ich zaznaczyc
- wolne miejsca mozna zaznaczac i odznaczac
- przycisk `Rezerwuj` jest wylaczony, gdy nic nie wybrano
- `POST /seats/reservations` rezerwuje kilka wolnych miejsc jednym zadaniem
- jesli jedno miejsce w batchu jest juz zajete, backend zwraca `409`, a pozostale miejsca z tego batcha nie sa rezerwowane
- nieprawidlowy format seat id zwraca `400`
- duplikaty w `seatIds` zwracaja `400`
- nieznane identyfikatory miejsc zwracaja `404`
- `POST /seats/:seatId/reserve` nadal dziala
- po udanej albo odrzuconej probie frontend odswieza uklad miejsc jednym odczytem
- restart backendu zachowuje rezerwacje zapisane w `apps/booking-api/data/seats.json`

## Przykladowe komendy curl

Na Windows warto uzyc `curl.exe`, zeby ominac alias PowerShell.

```powershell
curl.exe http://localhost:3001/seats
```

```powershell
curl.exe -X POST http://localhost:3001/seats/reservations ^
  -H "Content-Type: application/json" ^
  -d "{\"seatIds\":[\"R1S3\",\"R1S4\"]}"
```

```powershell
curl.exe -X POST http://localhost:3001/seats/R1S5/reserve
```

```powershell
curl.exe -X POST http://localhost:3001/seats/reservations ^
  -H "Content-Type: application/json" ^
  -d "{\"seatIds\":[\"BAD\"]}"
```

```powershell
curl.exe -X POST http://localhost:3001/seats/reservations ^
  -H "Content-Type: application/json" ^
  -d "{\"seatIds\":[\"R1S6\",\"R1S6\"]}"
```

```powershell
curl.exe -X POST http://localhost:3001/seats/reservations ^
  -H "Content-Type: application/json" ^
  -d "{\"seatIds\":[\"R99S99\"]}"
```

## Dalszy rozwoj

- automatyczne testy backendowe i frontendowe
- przejscie z pliku JSON na baze danych z transakcjami
- lepsza kontrola wspolbieznosci dla wielu instancji aplikacji
- obsluga wielu sal i wielu seansow
- lepsza konfiguracja srodowisk przez zmienne srodowiskowe
- czasowe holdy na miejsca i wygasanie rezerwacji

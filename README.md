# Mini Cinema Booking MVP

To proste MVP systemu rezerwacji miejsc w kinie zbudowane w monorepo:

- `apps/booking-app` - frontend w Next.js dostępny pod `http://localhost:3000`
- `apps/booking-api` - backend w Expressie dostępny pod `http://localhost:3001`

Aplikacja pozwala pobrać aktualny stan sali, zaznaczyć wolne miejsca i zarezerwować je z poziomu interfejsu użytkownika.

## Zakres MVP

- jedna sala
- jeden seans
- układ `5 x 8`
- wybór wielu miejsc po stronie frontendu
- prosty backend z endpointem rezerwującym jedno miejsce naraz
- stan miejsc zapisywany w pliku JSON
- dane ładowane do pamięci przy starcie API i zapisywane po udanej rezerwacji
- `selected` istnieje tylko w stanie UI i nie jest zapisywane po stronie serwera

## Uruchomienie projektu

Najpierw zainstaluj zależności w katalogu głównym repozytorium:

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

Po uruchomieniu aplikacje będą dostępne pod adresami:

- frontend: `http://localhost:3000`
- API: `http://localhost:3001`

## API

### `GET /seats`

Zwraca pełną listę miejsc jako `Seat[]`.

### `POST /seats/:seatId/reserve`

Próbuje zarezerwować jedno miejsce i zwraca:

- `200` z zaktualizowanym obiektem `Seat`
- `400` dla nieprawidłowego identyfikatora miejsca
- `404` gdy miejsce nie istnieje
- `409` gdy miejsce jest już zarezerwowane

Przykładowy format błędu:

```json
{
  "error": "SEAT_ALREADY_RESERVED",
  "message": "Seat R1S1 is already reserved."
}
```

## Główne typy

```ts
type SeatStatus = "free" | "reserved";

type Seat = {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
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
          seat.repository.ts
          seat.routes.ts
          seat.service.ts
          seat.types.ts
```

## Założenia

- brak logowania i kont użytkowników
- brak płatności
- brak mechanizmu czasowego "hold" na miejsce
- brak automatycznych testów w zakresie MVP
- zakres backendu celowo opiera się o pojedynczy endpoint rezerwacji miejsca

## Ograniczenia obecnego rozwiązania

- zapis do JSON jest wystarczający dla lokalnego MVP, ale nie nadaje się do środowiska produkcyjnego
- dane są trzymane w pamięci po starcie API, więc ręczna zmiana pliku JSON wymaga restartu backendu
- rozwiązanie nie obsługuje wielu instancji aplikacji ani pełnej kontroli współbieżności

## Ręczna lista kontrolna

- `GET /seats` zwraca dokładnie `40` miejsc
- miejsca już zarezerwowane są widoczne i nie da się ich zaznaczyć
- wolne miejsca można zaznaczać i odznaczać
- przycisk `Rezerwuj` jest wyłączony, gdy nic nie wybrano
- po udanej rezerwacji frontend odświeża stan miejsc
- ponowna rezerwacja tego samego miejsca kończy się konfliktem `409`
- nieznane identyfikatory miejsc zwracają `404`
- przy wyborze wielu miejsc częściowy sukces jest obsługiwany poprawnie
- restart backendu zachowuje rezerwacje zapisane w `apps/booking-api/data/seats.json`

## Dalszy rozwój

- endpoint do rezerwacji wielu miejsc w jednym żądaniu
- automatyczne testy frontendowe i backendowe
- przejście z pliku JSON na bazę danych
- atomowe rezerwacje i lepsza kontrola współbieżności
- obsługa wielu sal i wielu seansów
- lepsza konfiguracja środowisk przez zmienne środowiskowe

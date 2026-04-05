# Zadanie Rekrutacyjne: Mini Cinema Booking 🎬

Cześć! Cieszymy się, że bierzesz udział w naszym procesie rekrutacyjnym.

Chcemy sprawdzić Twoje umiejętności w praktyce, dlatego przygotowaliśmy zadanie, które odzwierciedla realne (choć uproszczone) wyzwania, z jakimi mierzymy się na co dzień. Nie szukamy perfekcyjnego kodu, który powstawał tygodniami – szukamy logicznego myślenia, znajomości TypeScripta i dobrych praktyk.

## 🎯 Cel Biznesowy

Lokalne kino potrzebuje prostego systemu rezerwacji miejsc. Twoim zadaniem jest stworzenie aplikacji, która pozwoli użytkownikowi wybrać miejsce na sali i spróbować je zarezerwować.

Aplikacja składa się z dwóch części:

1. **Frontend (Next.js):** Widok sali kinowej i interfejs użytkownika.
2. **Backend (Express.js/Nest.js):** API zarządzające stanem miejsc.

(Zamiast bazy danych możesz trzymać dane w pamięci lub pliku JSON)

## 📝 Funkcjonalności do zrealizowania

### 1. Widok Sali (Frontend)

* Wyświetl siatkę miejsc (np. 5 rzędów po 8 miejsc).
* Każde miejsce powinno mieć jeden z trzech stanów:
* **Wolne** (można kliknąć i wybrać).
* **Zajęte** (nie można wybrać, oznaczone innym kolorem).
* **Wybrane** (kliknięte przez użytkownika, gotowe do rezerwacji).

* Pod siatką powinien znajdować się przycisk "Rezerwuj", który wysyła żądanie do API dla wybranych miejsc.

### 2. API (Backend)

* Endpoint do pobrania aktualnego stanu wszystkich miejsc.
* Endpoint do rezerwacji konkretnego miejsca.

## 💡 Na co będziemy zwracać uwagę?

* Pamiętaj aby obsłużyć możliwie wszystkie przypadki brzegowe.
* Kod powinien być czytelny i zgodny z aktualnymi standardami
* Dodaj plik README.md, podaj w nim komendę/y uruchamiające aplikację

## 🚀 Jak zacząć i jak oddać zadanie?

1. Możesz wykorzystać scaffold zawarty w tym folderze lub stworzyć repozytorium od zera (tooling dowolny).
2. Nie spędzaj nad tym zadaniem całego weekendu. Zależy nam na MVP (Minimum Viable Product).
3. Rozwiązanie prześlij nam w formie linku do repozytorium na GitHubie/GitLabie.

Powodzenia!
W razie pytań dotyczących treści zadania – śmiało pisz.

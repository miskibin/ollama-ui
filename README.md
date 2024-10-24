# Prawny Asystent AI 🤖⚖️

 - inteligentny asystent prawny wspierający obywateli w zrozumieniu polskiego prawa i przepisów.
Projekt jest oparty na danych z  [sejm-stats.pl](https://sejm-stats.pl)
## ✨ Funkcjonalności

- 🤖 Inteligentny czat oparty o duże modele językowe (LLM)
- 🔍 Integracja z bazą danych sejm-stats.pl
- 💬 Proaktywne sugestie tematów prawnych
- 🎯 Precyzyjne odpowiedzi oparte o aktualne przepisy
- 🎨 Nowoczesny, responsywny interfejs

## 🚀 Jak uruchomić projekt

### Wymagania
- Node.js (v18+)
- npm/yarn/pnpm
- Konto na platformie [Together.ai](https://together.ai)
- Konto w [Auth0](https://auth0.com)
- Dostęp do API sejm-stats.pl

### Konfiguracja zmiennych środowiskowych

Utwórz plik `.env.local` w głównym katalogu projektu:

```env
TOGETHER_API_KEY=           # Klucz API do Together.ai
AUTH0_SECRET=              # Secret dla Auth0
AUTH0_BASE_URL=            # URL Twojej aplikacji
AUTH0_ISSUER_BASE_URL=     # URL wydawcy Auth0
AUTH0_CLIENT_ID=           # ID klienta Auth0
AUTH0_CLIENT_SECRET=       # Secret klienta Auth0
PATRONITE_API_KEY=         # Klucz API Patronite (opcjonalnie)
PATRONITE_API_URL=         # URL API Patronite (opcjonalnie)
```

### Instalacja i uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Build produkcyjny
npm run build

# Uruchomienie wersji produkcyjnej
npm start
```

## 🛠️ Technologie

- Next.js 14
- React
- Tailwind CSS
- LangChain
- Together.ai LLM
- Auth0
- shadcn/ui

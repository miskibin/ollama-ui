import { PromptTemplate } from "@langchain/core/prompts";
export const PROMPTS = {
  selectField: PromptTemplate.fromTemplate(`
      Zadanie: Wybierz najbardziej odpowiednie pole do przeszukania w API SejmStats.
      Pytanie: {question}
      Dostępne pola:
      - committee_sittings (posiedzenia komisji): Informacje o spotkaniach komisji parlamentarnych, gdzie omawiane są konkretne tematy.
      - interpellations (interpelacje): Pisemne zapytania OD posłów DO rządu, często dotyczące planów lub wyjaśnień. Nie zawierają informacji o konkretnych działaniach rządu.
      - prints (druki sejmowe): Projekty ustaw, uchwał i wnioski. Zawierają propozycje nowych przepisów lub zmian w prawie.
      - acts (ustawy): Już uchwalone i obowiązujące akty prawne. Najlepsze źródło informacji o konkretnych działaniach legislacyjnych.
      - votings (głosowania): Wyniki głosowań w parlamencie nad ustawami, uchwałami itp.
  
      Instrukcje:
      1. Przeanalizuj pytanie.
      2. Wybierz pole najlepiej pasujące do zapytania.
      3. Podaj tylko nazwę wybranego pola, bez dodatkowych informacji.
  
      Wybrane pole:`),

  generateSearchQuery: PromptTemplate.fromTemplate(`
        Zadanie: Wygeneruj jedno słowo kluczowe do wyszukiwania.
        
        Pytanie: {question}
        
        Instrukcje:
        1. Przeanalizuj pytanie dokładnie.
        2. Wybierz JEDNO najważniejsze słowo kluczowe.
        3. Jeśli absolutnie konieczne, możesz użyć maksymalnie dwóch słów (np. "ochrona środowiska").
        4. Użyj rzeczownika w formie podstawowej, w mianowniku liczby pojedynczej.
        5. Jeśli wybierzesz słowo złożone, rozdziel je na osobne słowa (np. "ochrona" zamiast "ochronaśrodowiska").
        6. Unikaj ogólnych słów jak "sejm", "ustawa", "interpelacja".
        7. Sprawdź, czy słowo jest poprawnie napisane (np. "budżet" zamiast "budzet").
        8. Nie używaj cudzysłowów, myślników ani innych znaków specjalnych.
        9. Użyj tylko małych liter.
        
        Słowo kluczowe (maksymalnie dwa słowa):`),
  processDataPrompt: PromptTemplate.fromTemplate(`
          Zadanie: Odpowiedz zwięźle i precyzyjnie na pytanie o polskim parlamencie.
          Pytanie: {question}
          Dane: {dataString}
          Data obecna: ${new Date().toLocaleDateString("pl-PL")}
          Instrukcje:
          0. Pamiętaj, że dane są ograniczcone do 5 najnowszych wyników.
          1. Odpowiedz bezpośrednio na pytanie w maksymalnie 2 zdaniach.
          2. Podaj tylko informacje istotne dla pytania.
          3. Jeśli brak odpowiedzi w danych, napisz to krótko.
          4. Użyj '**pogrubienia**' dla kluczowych dat lub liczb.
          5. Cytuj tytuł dokumentu tylko jeśli jest bezpośrednio związany z pytaniem.
          6. Nie opisuj dostarczonych danych ani ich zakresu.
          Odpowiedź:`),
};

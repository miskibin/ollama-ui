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
        Zadanie: Wybierz JEDNO słowo kluczowe do wyszukiwania. W skrajnych przypadkach możesz użyć kilku słów, 
        np. "ochrona praw osobowych".
        Pytanie: {question}
        
        Instrukcje:
        1. Przeanalizuj pytanie.
        2. Wybierz TYLKO JEDNO najważniejsze słowo. W skrajnych przypadkach możesz użyć kilku słów.
        3. Użyj rzeczownika w formie podstawowej.
        4. Unikaj ogólnych słów jak "sejm" czy "ustawa".
        5. Nie używaj cudzysłowów ani znaków specjalnych.
        
        Pojedyncze słowo kluczowe lub kilka słów:`),
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

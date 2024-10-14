
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
      Zadanie: Wygeneruj zapytanie wyszukiwania dla API SejmStats.
      Pytanie: {question}
  
      Instrukcje:
      1. Przeanalizuj pytanie.
      2. Zidentyfikuj główny temat lub problem, którego dotyczy pytanie.
      3. Wygeneruj jedno słowo kluczowe, które najlepiej oddaje istotę zapytania.
      4. Zapytanie powinno być w języku polskim, najlepiej formalnym.
      5. Unikaj używania słów ogólnych jak "rząd", "sprawie", "zrobił", chyba że są absolutnie kluczowe dla tematu.
      6. Skup się na konkretnym problemie lub zagadnieniu, np. "powódź", "ustawa", "budżet".
  
      Zapytanie wyszukiwania (jedno słowo):`),
  
    processData: PromptTemplate.fromTemplate(`
      Zadanie: Odpowiedz zwięźle i precyzyjnie na pytanie o polskim parlamencie.
      Pytanie: {question}
      Dane: {dataString}
      Data obecna: ${new Date().toLocaleDateString("pl-PL")}
      Instrukcje:
      1. Odpowiedz bezpośrednio na pytanie w maksymalnie 2 zdaniach.
      2. Podaj tylko informacje istotne dla pytania.
      3. Jeśli brak odpowiedzi w danych, napisz to krótko.
      4. Użyj '**pogrubienia**' dla kluczowych dat lub liczb.
      5. Cytuj tytuł dokumentu tylko jeśli jest bezpośrednio związany z pytaniem.
      6. Nie opisuj dostarczonych danych ani ich zakresu.
      Odpowiedź:`),
  };
  
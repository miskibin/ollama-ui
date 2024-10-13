"use client";
import { ChatOllama } from "@langchain/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SejmStatsCommunicator, SejmStatsResponse } from "./sejmstats-server";

const PROMPTS = {
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

    Przykłady:
    Pytanie: "Co rząd zrobił w sprawie powodzi?"
    Poprawne zapytanie: powódź

    Pytanie: "Jakie ustawy przyjęto w sprawie ochrony środowiska?"
    Poprawne zapytanie: środowisko

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
      Odpowiedź:
    `),
};

const log = (step: string, message: string, data?: any) => {
  console.log(
    `[${step}] ${message}${data ? ": " + JSON.stringify(data, null, 2) : ""}`
  );
};

const selectField = async (question: string, model: ChatOllama) => {
  log("SELECT_FIELD", "Starting field selection", { question });
  const selectedField = await PROMPTS.selectField
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question });
  log("SELECT_FIELD", "Selected field", { selectedField });
  return selectedField.trim().toLowerCase();
};

const generateSearchQuery = async (question: string, model: ChatOllama) => {
  log("GENERATE_QUERY", "Generating search query", { question });
  const searchQuery = await PROMPTS.generateSearchQuery
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question });
  log("GENERATE_QUERY", "Generated search query", { searchQuery });
  return searchQuery.trim();
};

const processData = async (
  data: SejmStatsResponse,
  question: string,
  model: ChatOllama
) => {
  log("PROCESS_DATA", "Processing data", { question });
  const dataString = JSON.stringify(data);
  const answer = await PROMPTS.processData
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question, dataString });
  log("PROCESS_DATA", "Processed answer", { answer });
  return answer;
};

export const createSejmStatsTool = (
  model: ChatOllama,
  setPluginData: (data: string) => void,
  setPromptStatus: (status: string) => void
) => {
  return RunnableSequence.from([
    new RunnablePassthrough(),
    async (input) => {
      setPromptStatus("Rozpoczynanie wyboru pola...");
      const field = await selectField(input, model);
      setPromptStatus("Pole wybrane. Generowanie zapytania wyszukiwania...");
      const searchQuery = await generateSearchQuery(input, model);
      setPromptStatus(
        "Zapytanie wyszukiwania wygenerowane. Pobieranie danych..."
      );
      const communicator = new SejmStatsCommunicator();
      const data = await communicator.searchOptimized(searchQuery, field);
      setPluginData(JSON.stringify(data, null, 2));
      console.log(data);
      setPromptStatus("Dane pobrane. Przetwarzanie danych...");
      const answer = await processData(data, input, model);
      setPromptStatus("Dane przetworzone. Odpowiedź gotowa.");
      return `${answer}`;
    },
    new StringOutputParser(),
  ]);
};

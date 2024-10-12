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
      Zadanie: Odpowiedz na pytanie o polskim parlamencie na podstawie dostarczonych danych.
      Pytanie: {question}
      Dane: {dataString}
      Instrukcje:
      1. Przeanalizuj dane i udziel zwięzłej, konkretnej odpowiedzi (maks. 3-6 zdań).
      2. Użyj formatowania Markdown dla lepszej czytelności:
         - Użyj '**pogrubienia**' dla kluczowych terminów lub liczb.
         - Użyj list punktowanych lub numerowanych dla wyliczenia informacji.
         - Jeśli to stosowne, użyj cytatów '>' dla bezpośrednich odniesień do danych.
      3. Zacznij od krótkiego podsumowania, a następnie podaj szczegóły.
      4. Unikaj spekulacji - opieraj się tylko na dostarczonych danych.
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
  setPluginData: (data: string) => void
) => {
  return RunnableSequence.from([
    new RunnablePassthrough(),
    async (input) => {
      const field = await selectField(input, model);
      const searchQuery = await generateSearchQuery(input, model);
      const communicator = new SejmStatsCommunicator();
      const data = await communicator.searchOptimized(searchQuery, field);
      setPluginData(JSON.stringify(data, null, 2));

      const answer = await processData(data, input, model);
      return `${answer}`;
    },
    new StringOutputParser(),
  ]);
};

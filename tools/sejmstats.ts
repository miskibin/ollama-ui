"use client";
import { ChatOllama } from "@langchain/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SejmStatsCommunicator, SejmStatsEndpoint } from "./sejmstats-server";
import { useChatStore } from "@/lib/store";

const PROMPTS = {
  extractQueryInfo: PromptTemplate.fromTemplate(`
    Zadanie: Wyodrębnij kluczowe informacje z pytania o polskim parlamencie.
    Pytanie: {question}
    Instrukcje:
    1. Zidentyfikuj główne tematy i pojęcia.
    2. Uwzględnij nazwy partii, osób, lub instytucji.
    3. Zwróć uwagę na daty lub okresy czasowe.
    4. Podaj tylko kluczowe słowa lub krótkie frazy.
    5. Oddziel informacje przecinkami.

    Kluczowe informacje:`),

  selectEndpoint: PromptTemplate.fromTemplate(`
      Zadanie: Wybierz najbardziej odpowiedni endpoint API do uzyskania informacji.
      Pytanie: {question}
      Kluczowe informacje: {keyInfo}
      Dostępne endpointy:
      - interpellations (interpelacje)
      - clubs (kluby parlamentarne)
      - envoys (posłowie)
      - acts (ustawy)
      - votings (głosowania)
  
      Instrukcje:
      1. Przeanalizuj pytanie i kluczowe informacje.
      2. Wybierz endpoint najlepiej pasujący do zapytania.
      3. Podaj tylko nazwę wybranego endpointu, bez dodatkowych informacji.
  
      Wybrany endpoint:`),

  processData: PromptTemplate.fromTemplate(`
    Zadanie: Odpowiedz na pytanie o polskim parlamencie na podstawie dostarczonych danych.
    Pytanie: {question}
    Źródło danych: {endpoint}
    Dane: {dataString}
    Uwaga: Dla większości endpointów analizujesz tylko ostatnie 20 obiektów, z wyjątkiem endpointu 'clubs', gdzie analizujesz wszystkie kluby.
    Instrukcje: Przeanalizuj dane, udziel zwięzłej odpowiedzi (maks. 3-4 zdania). Zaznacz, jeśli informacja jest niedostępna.
    Odpowiedź:`),
};

const log = (step: string, message: string, data?: any) => {
  console.log(
    `[${step}] ${message}${data ? ": " + JSON.stringify(data, null, 2) : ""}`
  );
};

const extractQueryInfo = async (input: string, model: ChatOllama) => {
  log("EXTRACT_QUERY", "Extracting query information", { input });
  const keyInfo = await PROMPTS.extractQueryInfo
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question: input });
  log("EXTRACT_QUERY", "Extracted key information", { keyInfo });
  return keyInfo;
};

const selectEndpoint = async (
  question: string,
  keyInfo: string,
  model: ChatOllama
) => {
  log("SELECT_ENDPOINT", "Starting endpoint selection", { question, keyInfo });
  const chain = PROMPTS.selectEndpoint
    .pipe(model)
    .pipe(new StringOutputParser());
  const selectedEndpoint = await chain.invoke({ question, keyInfo });
  log("SELECT_ENDPOINT", "Selected endpoint", { selectedEndpoint });
  return selectedEndpoint.trim().toLowerCase() as SejmStatsEndpoint;
};
const processData = async (
  data: any,
  question: string,
  endpoint: SejmStatsEndpoint,
  model: ChatOllama
) => {
  log("PROCESS_DATA", "Processing data", { question, endpoint });
  const dataString = JSON.stringify(data);
  const answer = await PROMPTS.processData
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question, endpoint, dataString });
  log("PROCESS_DATA", "Processed answer", { answer });
  return answer;
};

export const createSejmStatsTool = (
  model: ChatOllama,
  setPluginData: (data: string) => void
) => {
  return RunnableSequence.from([
    {
      original_input: new RunnablePassthrough(),
      key_info: (input) => extractQueryInfo(input, model),
    },
    async (input) => {
      const endpoint = await selectEndpoint(
        input.original_input,
        input.key_info,
        model
      );

      if (!Object.values(SejmStatsEndpoint).includes(endpoint)) {
        log("ERROR", "Invalid endpoint", { endpoint });
        return "Przepraszam, nie mogę uzyskać odpowiednich informacji w tym momencie.";
      }

      const communicator = new SejmStatsCommunicator();
      const data = await communicator.fetchOptimizedData(endpoint);
      setPluginData(JSON.stringify(data, null, 2));
      log("FETCH_DATA", "Fetched data from endpoint", {
        endpoint,
        dataLength: data.results ? data.results.length : 0,
      });

      const answer = await processData(
        data,
        input.original_input,
        endpoint,
        model
      );
      return `Oto informacje o polskim parlamencie: ${answer}`;
    },
    new StringOutputParser(),
  ]);
};

import { ChatOllama } from "@langchain/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SejmStatsCommunicator, SejmStatsEndpoint } from "./sejmstats-server";

// Consolidated prompts
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

    Instrukcje:
    1. Przeanalizuj dane i znajdź odpowiednie informacje.
    2. Udziel zwięzłej i konkretnej odpowiedzi.
    3. Jeśli informacja nie jest dostępna, wyraźnie to zaznacz.
    4. Użyj maksymalnie 3-4 zdań.

    Odpowiedź:`),
};

// Logging function
const log = (step: string, message: string, data?: any) => {
  console.log(`[${step}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const extractQueryInfo = async (input: string, model: ChatOllama) => {
  log("EXTRACT_QUERY", "Starting query information extraction", { input });
  const chain = PROMPTS.extractQueryInfo
    .pipe(model)
    .pipe(new StringOutputParser());
  const keyInfo = await chain.invoke({ question: input });
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
  log("PROCESS_DATA", "Starting data processing", { question, endpoint });
  const dataString = JSON.stringify(data);
  const chain = PROMPTS.processData.pipe(model).pipe(new StringOutputParser());
  const answer = await chain.invoke({ question, endpoint, dataString });
  log("PROCESS_DATA", "Processed answer", { answer });
  return answer;
};

export const createSejmStatsTool = (model: ChatOllama) => {
  return RunnableSequence.from([
    {
      original_input: new RunnablePassthrough(),
      key_info: (input) => extractQueryInfo(input, model),
    },
    async (input) => ({
      ...input,
      selected_endpoint: await selectEndpoint(
        input.original_input,
        input.key_info,
        model
      ),
    }),
    async (input) => {
      const endpoint = input.selected_endpoint as SejmStatsEndpoint;

      if (!Object.values(SejmStatsEndpoint).includes(endpoint)) {
        log("ERROR", `Invalid endpoint: ${endpoint}`);
        return "Przepraszam, nie mogę uzyskać odpowiednich informacji w tym momencie.";
      }

      log("FETCH_DATA", `Fetching data from ${endpoint}`);
      const communicator = new SejmStatsCommunicator();
      const data = await communicator.fetchOptimizedData(endpoint);

      log("PROCESS_ANSWER", "Processing fetched data");
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

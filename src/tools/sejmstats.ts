import { ChatOllama } from "@langchain/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Club, fetchPolishParliamentClubs } from "./sejmstats-server";
import { useChatStore } from "@/lib/store";

const extractQueryInfo = async (input: string, model: ChatOllama) => {
  console.log("Extracting query information from:", input);
  const prompt = PromptTemplate.fromTemplate(
    "Wyodrębnij kluczowe informacje potrzebne do odpowiedzi na poniższe pytanie o polskich klubach parlamentarnych. Podaj tylko niezbędne słowa kluczowe lub frazy, oddzielone przecinkami.\n\nPytanie: {question}\nKluczowe informacje:"
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const keyInfo = await chain.invoke({ question: input });
  console.log("Extracted key information:", keyInfo);
  return keyInfo;
};

const processClubsData = async (
  clubs: Club[],
  question: string,
  keyInfo: string,
  model: ChatOllama
) => {
  console.log("Processing clubs data for question:", question);
  console.log("Using key information:", keyInfo);
  const clubsData = JSON.stringify(clubs);
  const prompt = PromptTemplate.fromTemplate(
    `Odpowiedz na poniższe pytanie o polskich klubach parlamentarnych, korzystając z podanych danych. Bądź zwięzły i konkretny. Jeśli informacja nie jest dostępna, powiedz o tym.

    Pytanie: {question}
    Kluczowe informacje: {keyInfo}
    Dane o klubach: {clubsData}

    Odpowiedź:`
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const answer = await chain.invoke({ question, keyInfo, clubsData });
  console.log("Processed answer:", answer);
  return answer;
};

export const createPolishParliamentClubsTool = (model: ChatOllama) => {
  return RunnableSequence.from([
    {
      original_input: new RunnablePassthrough(),
      key_info: (input) => extractQueryInfo(input, model),
    },
    async (input) => {
      console.log("Fetching clubs data...");
      const clubs = await fetchPolishParliamentClubs();
      console.log("Processing clubs data...");
      const answer = await processClubsData(
        clubs,
        input.original_input,
        input.key_info,
        model
      );
      return `Oto informacje o polskich klubach parlamentarnych: ${answer}`;
    },
    new StringOutputParser(),
  ]);
};

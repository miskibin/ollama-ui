import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  processDataPrompt: PromptTemplate.fromTemplate(`
      Based on the document:\n{dataString}\n
      Answer the question precisely and concisely:\n{question}\n
      Instructions:
      1. Cross-reference key terms in the question with related sections in the document to determine applicable rules.
      2. If the question implies a context (e.g., multi-lane traffic for "autostrada"), apply relevant rules or exceptions in that context.
      3. For direct article references, quote the article with the document name and article number.
      4. AVOID adding information beyond the document but apply general implications as needed.
      Answer in Polish:
  `),

  respondWithContextPrompt: PromptTemplate.fromTemplate(`
    Given a context, respond to user question. If question is completly irrelevant write 'Zacznij nowy czat, by rozmawiać o czymś nowym.
    Question: {question}
    `),
  selectRelevantItem: PromptTemplate.fromTemplate(`
      Given a list of legal acts, analyze their titles, chapters, and summaries to identify the SINGLE most relevant one for answering the question.
      
      Question: {question}
      
      Available Acts:
      {acts}
      
      Instructions:
      1. Consider only the high-level information (titles, chapters, summaries)
      2. Select the one or two most relevant acts
      3. Return only index or TWO indexes of the chosen acts (e.g., "1" for the first act, "2,3" for second and third.)
      4. If none are relevant, return "NONE"
      
      Respond with numbers or "NONE".
      `),
};

export const SummarizePromptPlaceholder = `Streść mi to`;
export const ContinuePromptPlaceholder = `Kontynuuj`;

export const FirstIrrelevantUserQuestion = `Przepraszam, nie znalazłem odpowiedzi na to pytanie. Zostałem stworzony by rozmawiać o [polskim prawie](https://monitorpolski.gov.pl/DU).

**Co możesz zrobić:**
* Jeśli pytasz o prawo - kliknij ✍ pod poprzednią wiadomością. Użyj słów kluczowych związanych z przepisami.
* Jeśli to nie pomoże - użyj innego modelu

Wciąż się uczę, więc jeśli odpowiedź nie jest pomocna, użyj 👎 pod odpowiedzią.`;

import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  generateSearchQuery: PromptTemplate.fromTemplate(`
Task: Rewrite the question to create a concise, legally-relevant search query for a vector database. Use formal terminology and specific legal keywords directly related to the topic. Exclude unnecessary phrases like "zgodne z polskim prawem" since the context is already Polish law.

Original Question: {question}

Answer with specific keywords in Polish:
    `),
  analyzeToolRelevance: PromptTemplate.fromTemplate(`
      Given:
      - User Question: {query}
      - Last Assistant Response: {previousResponse}
      - Tool Purpose: {toolDescription}
      
      Check two conditions:
      1. Does the question specifically ask about what this tool provides?
      2. Is this a new topic (not following up on previous response)?
      
      Answer format:
      RELEVANT: [YES or NO]`),
  initialToolRelevance: PromptTemplate.fromTemplate(`
      Given:
      - User Question: {query}
      - Tool Purpose: {toolDescription}
      
      Does the question specifically ask about what this tool provides?
      
      Answer format:
      RELEVANT: [YES or NO]
      REASON: [single clear explanation why]`),
  processDataPrompt: PromptTemplate.fromTemplate(`
    Based on the document:\n{dataString}\n
    Answer the question precisely and concisely:\n{question}\n
    Instructions:
    1. Use Markdown for clarity.
    2. If a matching quote is found, include it with the document name and article number.
    3. Avoid adding any information beyond the content of the document.
    4. If the document does not contain relevant information to answer the question, respond with:
       "Nie znalazłem odpowiedzi na to pytanie."
    Answer in Polish language:`),

  generateResponse: PromptTemplate.fromTemplate(`
    Question: {question}
    Tool Results: {tool_results}`),
};

export const SummarizePromptPlaceholder = `Streść mi to`;
export const ContinuePromptPlaceholder = `Kontynuuj`;

export const FirstIrrelevantUserQuestion = `
Przepraszam Aktualnie potrafię odpowiadać tylko na pytania dotyczące **obowiązujących aktów prawnych** znajdujących się w [Monitorze Polskim](https://monitorpolski.gov.pl/MP) oraz [Dzienniku ustaw](https://monitorpolski.gov.pl/MP)

---

W przyszłości będę umiał rozmawiać również o:
- 🗳️ głosowaniach
- 🏛️ posiedzeniach sejmu 
- 📝 interpelacjach poselskich
- 📊 i innych danych


> **Wskazówka**: Jeśli uważasz, że twoje pytanie dotyczy prawa
1. Użyj lepszego modelu.
2. Użyj słów kluczowych abym zrozumiał, że pytasz o obowiązujące prawo w polsce
3. kliknij przycisk 🔁 poniżej`;

import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  processDataPrompt: PromptTemplate.fromTemplate(`
      Based on the document:\n{dataString}\n
      Answer the question precisely and concisely:\n{question}\n
      Instructions:
      2. Cross-reference key terms in the question with related sections in the document to determine applicable rules.
      3. If the question implies a context (e.g., multi-lane traffic for "autostrada"), apply relevant rules or exceptions in that context.
      4. For direct article references, quote the article with the document name and article number.
      5. AVOID adding information beyond the document but apply general implications as needed.
      Answer in Polish:
  `),

  generateResponse: PromptTemplate.fromTemplate(`
    Question: {question}
    Tool Results: {tool_results}`),
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

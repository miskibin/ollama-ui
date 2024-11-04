import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  processDataPrompt: PromptTemplate.fromTemplate(`
      Based on the document:\n{dataString}\n
      Answer the question precisely and concisely:\n{question}\n
      Instructions:
      1. Use Markdown for clarity.
      2. Cross-check relevant terms from the question with similar terms or concepts in the document (e.g., "przemoc domowa," "sprawca," "ofiara") to determine if an answer can be implied.
      3. If a matching quote is found, include it with the document name and article number.
      4. Avoid adding any information beyond the content of the document.
      Answer in Polish language:
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
      3. Return only index or in rare cases TWO indexes of the chosen acts (e.g., "1" for the first act, "2,3" for second and third.)
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

import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  generateSearchQuery: PromptTemplate.fromTemplate(`
    Task: Select the most relevant keyword or short phrase for searching.

    Question: {question}

    Instructions:
    1. Identify the core issue or event, ignoring procedural aspects.
    2. Choose short phrase (max 10 words) in Polish.
    3. Omit words like "projekt", "ustawa", "sejm", "głosowanie", "pomoc".
    4. Use keywords that could be helpful for embeding model to search.
    Example: "Cześć, co grozi za znęcanie się nad zwierzętami?" -> "kary za znęcanie nad zwierzętami"
    Odpowiedź (in Polish):`),

  analyzeToolRelevance: PromptTemplate.fromTemplate(`
      Given:
      - User Question: {query}
      - Last Assistant Response: {previousResponse}
      - Tool Purpose: {toolDescription}
      
      Check two conditions:
      1. Does the question specifically ask about what this tool provides?
      2. Is this a new topic (not following up on previous response)?
      
      Answer format:
      RELEVANT: [YES or NO]
      REASON: [single clear explanation why]`),
  initialToolRelevance: PromptTemplate.fromTemplate(`
      Given:
      - User Question: {query}
      - Tool Purpose: {toolDescription}
      
      Does the question specifically ask about what this tool provides?
      
      Answer format:
      RELEVANT: [YES or NO]
      REASON: [single clear explanation why]`),
  processDataPrompt: PromptTemplate.fromTemplate(` 
    Task: Give a short, precise answer basing on artifact:
    Question: {question}
    Current date: ${new Date().toLocaleDateString("pl-PL")}
    Instructions:
    1. LIMIT answer to 3 sentences.
    2. Provide url with label to MOST relevant document.
    3. Answer in Polish. Avoid extra details.
    Base answer ONLY on the provided Data. No external info.
    Answer in polish:
  `),

  answerQuestion: PromptTemplate.fromTemplate(
    "Bazując na dokumencie, odpowiedz konkretnie i krótko na pytanie:\n{question}\n\n1. Używaj formatowania markdown.\n2. Jeśli znajdziesz pasujący cytat, wprowadź go."
  ),
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

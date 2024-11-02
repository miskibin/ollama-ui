import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  generateSearchQuery: PromptTemplate.fromTemplate(`
  Task: Rewrite question using formal language. Question must be understandable for embeding model. Be specific and concise. Add context that might be useful for the model to understand the question.
  Don't include words like "please" or "can you" in the question.

  Question: {question}
    Answer in Polish language:
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
    "Bazując na dokumencie, odpowiedz konkretnie i krótko na pytanie:\n{question}\n\n1. Używaj formatowania markdown.\n2. Jeśli znajdziesz pasujący cytat, wprowadź go wraz z nazwą dokumentu i artykułem."y do odpowiedzialności karnej za czyny zabronione, a sąd oceniając szkodliwość czynu uwzględnia okoliczności popełnienia, motywację i rodzaj naruszonego dobra. Mienie o wartości powyżej 200 000 zł uznaje się za mienie znacznej wartości, a powyżej 1 000 000 zł – za mienie wielkiej wartości. Kradzież charakteryzująca się lekceważącym zachowaniem wobec właściciela lub użyciem przemocy to kradzież szczególnie zuchwała. Osoba niepełnoletnia w chwili popełnienia czynu, ale poniżej 24 lat w czasie wyroku, jest uważana za młodocianego.",
            "content": "Rozdział XIV\nObjaśnienie wyrażeń ustawowych\nArt. 115. § 1. Czynem zabronionym jest zachowanie o znamionach określonych w ustawie karnej.\n§ 2.78) Przy ocenie stopnia społecznej szkodliwości czynu sąd bierze pod uwagę rodzaj i charakter naruszonego lub\nzagrożonego dobra, rozmiary wyrządzonej lub grożącej szkody, sposób i okoliczności popełnienia czynu, wagę naruszonych\nprzez sprawcę obowiązkó
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

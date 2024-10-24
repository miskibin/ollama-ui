import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPTS = {
  generateSearchQuery: PromptTemplate.fromTemplate(`
    Task: Select the most relevant keyword or short phrase for searching.

    Question: {question}

    Instructions:
    1. Identify the core issue or event, ignoring procedural aspects.
    2. Choose ONE keyword or short phrase (max 4-5 words) in Polish.
    3. Use a noun or noun phrase in its basic form.
    4. Focus on the primary subject, not actions related to it.
    6. Omit words like "projekt", "ustawa", "sejm", "głosowanie", "pomoc".
    7. Use lowercase letters, correct Polish spelling, no special characters.
    Example: For "Jakie ustawy uchwalono w sprawie ochrony środowiska?" use "ochrona środowiska"
    Example: For "prawo dotyczące aborcji ?" use "przerywanie ciąży"

    Keyword or short phrase (in Polish):`),

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
  // context could be moved
  processDataPrompt: PromptTemplate.fromTemplate(` 
    Context: You are an AI that can ONLY see and use the data provided in the "Data:" field below. You have NO access to any other information.
    Task: Answer concisely and precisely to the question:
    Question: {question}
    Data: {dataString}
    Current date: ${new Date().toLocaleDateString("pl-PL")}
    Instructions:
    1. Answer the question directly in maximum 6 sentences.
    5. Quote document title only if directly related to the question.
    6. Don't describe the provided data or its scope.
    7. ALWAYS Wrap act name with markdown link like this: [ELI value](url value). Wrap only 1 most relevant document with **bold**.
    IMPORTANT: Base your answer ONLY on the provided Data. Do not use any external knowledge.
    Answer in Polish:`),

  generateResponse: PromptTemplate.fromTemplate(`
    Question: {question}
    Tool Results: {tool_results}`),

  answerQuestion: PromptTemplate.fromTemplate(`
      Bazując na dokumencie, odpowiedz na pytanie:
      {question}
      
      Format odpowiedzi:
      📝 GŁÓWNA ODPOWIEDŹ:
      > [zwięzła odpowiedź 1-2 zdania, zawiera najważniejsze informacje]
      
      🔍 KLUCZOWE FRAGMENTY Z DOKUMENTU:
      > [dosłowny fragment z dokumentu z najistotniejszymi informacjami]
      
      💡 DODATKOWE INFORMACJE:
      - [data] lub [liczba] pogrubione jako **data** lub **liczba**
      - Max 2 punkty dodatkowych informacji
      - Tylko istotne szczegóły
      
      Używaj prostego języka i zachowaj emotikony.`),
};

export const SummarizePrompt = `Przygotuj proste podsumowanie aktu prawnego.
Jeśli jakaś informacja nie występuje w dokumencie, pomiń dany punkt.

🎯 Cel: 
[Jedno proste zdanie rozpoczynające się od "Ustawa..."]

📋 Główne zmiany (jeśli są):
- [zmiana 1]
- [zmiana 2]
- [zmiana 3]

⏰ Data wejścia w życie: [**data**]

Pisz prostym językiem, liczby i daty zapisuj w **pogrubieniu**.`;

export const FirstIrrelevantUserQuestion = `
Przepraszam Aktualnie potrafię odpowiadać tylko na pytania dotyczące **obowiązujących aktów prawnych** znajdujących się w [Monitorze Polskim](https://monitorpolski.gov.pl/MP)

---

W przyszłości będę umiał rozmawiać również o:
- 🗳️ głosowaniach
- 🏛️ posiedzeniach sejmu 
- 📝 interpelacjach poselskich
- 📊 i innych danych


> **Wskazówka**: Jeśli chcesz porozmawiać o czymś innym wyłącz rozszerzenie sejm-stats.`;

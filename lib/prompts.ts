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
      Question: {query}
      Previous Response: {previousResponse}
      Tool: {toolName} - {toolDescription}
        
      Evaluate if tool is needed by checking ALL:
      1. Query directly relates to tool's specific domain
      2. Info NOT found in previous response
        
      RELEVANT: YES/NO
      (reason in one line)`),
  // context could be moved
  processDataPrompt: PromptTemplate.fromTemplate(` 
    Context: You are an AI that can ONLY see and use the data provided in the "Data:" field below. You have NO access to any other information.
    Task: Answer concisely and precisely to the question:
    Question: {question}
    Data: {dataString}
    Current date: ${new Date().toLocaleDateString("pl-PL")}
    Instructions:
    1. Answer the question directly in maximum 7 sentences.
    2. Provide only information relevant to the question.
    4. Use '**bold**' for key dates or numbers.
    5. Quote document title only if directly related to the question.
    6. Don't describe the provided data or its scope.
    7. If there is url field provided - Wrap act name with markdown link like this: [ELI value](url value). Wrap only 1 most relevant document with **bold**.
    IMPORTANT: Base your answer ONLY on the provided Data. Do not use any external knowledge.
    Answer in Polish:`),

  generateResponse: PromptTemplate.fromTemplate(`
    Question: {question}
    Tool Results: {tool_results}`),

  answerQuestion: PromptTemplate.fromTemplate(`
    Odpowiedz na pytanie użytkownika na podstawie przekazanego dokumentu.
    Pytanie: {question}

    Format odpowiedzi:
    📝 Odpowiedź: [krótka odpowiedź max 2 zdania]
    
    🔍 Szczegóły (jeśli są istotne):
    - [konkretny szczegół 1]
    - [konkretny szczegół 2]
    
    📖 Źródło: [podaj nr artykułu tylko jeśli jest kluczowy]
    
    Instrukcje:
    - Używaj prostego języka
    - Podawaj daty i liczby w **pogrubieniu**
    - Max 3 punkty w szczegółach
    - Zachowaj emotikony w odpowiedzi`),
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

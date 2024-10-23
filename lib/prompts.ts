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
    
    Tool Information:
    Name: {toolName}
    Description: {toolDescription}
    
    Is this tool needed to answer the question?
    Answer with either:
    RELEVANT: YES
    or
    RELEVANT: NO`),

  processDataPrompt: PromptTemplate.fromTemplate(`
    Zadanie: Odpowiedz zwięźle i precyzyjnie na pytanie o polskim parlamencie.
    Pytanie: {question}
    Dane: {dataString}
    Data obecna: ${new Date().toLocaleDateString("pl-PL")}
    Instrukcje:
    0. Pamiętaj, że dane są ograniczcone do 5 najnowszych wyników.
    1. Odpowiedz bezpośrednio na pytanie w maksymalnie 2 zdaniach.
    2. Podaj tylko informacje istotne dla pytania.
    3. Jeśli brak odpowiedzi w danych, napisz to krótko.
    4. Użyj '**pogrubienia**' dla kluczowych dat lub liczb.
    5. Cytuj tytuł dokumentu tylko jeśli jest bezpośrednio związany z pytaniem.
    6. Nie opisuj dostarczonych danych ani ich zakresu.
    Odpowiedź:`),

  generateResponse:
    PromptTemplate.fromTemplate(`You are a helpful AI assistant. Using the information gathered from the tools, provide a clear and direct answer to the user's question.
    Focus on being concise and informative based on the tool outputs provided.
    
    Question: {question}
    Tool Results: {tool_results}`),
};

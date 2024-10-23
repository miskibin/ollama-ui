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

    Tool: {toolName} - {toolDescription}

    If question uses pronouns (ten/ta/to) or lacks clear subject:
    RELEVANT: NO (requires missing context)

    Otherwise, answer YES only if:
    1. Query needs THIS EXACT tool's data
    2. Can't be answered without it

    RELEVANT: YES/NO
    (reason in one line)`),

  processDataPrompt: PromptTemplate.fromTemplate(`
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
    7. If there is url field provided - Wrap act name with markdown link like this: [ELI value](url value)
    IMPORTANT: Base your answer ONLY on the provided Data. Do not use any external knowledge.
    Answer in Polish:`),

  generateResponse:
    PromptTemplate.fromTemplate(`You are a helpful AI assistant. Using the information gathered from the tools, provide a clear and direct answer to the user's question.
    Focus on being concise and informative based on the tool outputs provided.
    
    Question: {question}
    Tool Results: {tool_results}`),
};

export const SummarizePrompt = `Przygotuj zwięzłe podsumowanie aktu prawnego w prostym języku:

1. 🎯 Cel: [1 zdanie o głównym celu]

2. ⚡ Kluczowe zmiany:
- [zmiana 1]
- [zmiana 2]
- [zmiana 3]

3. 👥 Dla kogo: [kogo dotyczy]

4. ⏰ Od kiedy: [**data wejścia w życie**]

❗ Używaj prostego języka. Wyjaśniaj terminy prawne. Podawaj konkretne daty i kwoty w **pogrubieniu**.`;

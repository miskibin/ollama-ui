import { ChatPlugin } from "./types";

// FILE: pluginEnums.ts
export enum PluginNames {
  Wikipedia = "Wikipedia",
  SejmStats = "sejm-stats",
  Python = "Python",
}

export const plugins: ChatPlugin[] = [
  {
    name: PluginNames.Wikipedia,
    relevancePrompt:
      "Determine if the following question requires a Wikipedia search. Respond with only 'Yes' or 'No'.\n\nQuestion: {question}\nAnswer:",
    enabled: false,
  },
  {
    name: PluginNames.SejmStats,
    relevancePrompt: `Determine if the following question is about Polish parliamentary clubs or requires information from the Polish Parliament API. Answer 'Yes' or 'No' only.

    Consider:
    1. Mentions of Polish political parties or clubs
    2. Questions about members, contact information, or structure of Polish parliament
    3. Specific inquiries about Sejm (lower house of Polish parliament)
    4. Requests for current data on Polish parliamentary representation

    Question: {question}
    Answer:`,
    enabled: true,
  },
  {
    name: PluginNames.Python,
    relevancePrompt: `Determine if the following question requires Python code execution. Answer 'Yes' or 'No' only.
    
    Consider:
    1. Calculations or data manipulation
    2. Python explicitly mentioned
    3. Complex operations (beyond basic math)
    4. Data structures (lists, dictionaries, etc.)
    5. String manipulation or pattern matching
    6. Iteration or looping
    7. Use of Python libraries
    8. Code generation or debugging
    
    Question: {question}
    Answer:`,
    enabled: false,
  },
];

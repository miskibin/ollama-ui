import { ChatPlugin } from "./types";

// FILE: pluginEnums.ts
export enum PluginNames {
  Wikipedia = "Wikipedia",
  SejmStats = "sejm-stats.pl",
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
    relevancePrompt: `Determine if the question requires information from the Polish Parliament API (SejmStats). Answer 'Yes' or 'No' only.

      Consider if the question involves:
      1. Polish political parties, parliamentary clubs, or coalitions
      2. Members of Sejm or Senat (Polish parliament)
      3. Legislative processes, bills, or acts in Polish parliament
      4. Voting records or results in Polish parliament
      5. Interpellations or parliamentary inquiries
      6. Statistics or data related to Polish parliament
      7. Parliamentary committees or their activities
      8. Composition or changes in parliamentary fractions
      9. Parliamentary debates or discussions
      10. Specific mention of "sejm-stats" or Polish Parliament API

      Question: {question}
      Use SejmStats plugin (Yes/No):`,
    enabled: true,
  },
];

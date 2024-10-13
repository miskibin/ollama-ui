import { ChatPlugin } from "./types";

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
    relevancePrompt: `Czy pytanie dotyczy polskiej polityki, parlamentu lub powiązanych tematów? Odpowiedz 'Tak' lub 'Nie'.

    Uwzględnij:
    1. Sejm, Senat, posłowie, partie, rząd, prezydent
    2. Ustawy, głosowania, debaty, interpelacje, komisje
    3. Bieżące i historyczne wydarzenia polityczne w Polsce
    4. Skutki decyzji politycznych (społeczne, gospodarcze)
    
    Przykłady 'Tak':
    - Jakie ustawy uchwalono ostatnio?
    - Kto jest Marszałkiem Sejmu?
    - Jak głosowano nad budżetem?
    - Czy planują zmiany w podatkach?
    
    Pytanie: {question}
    Użyć SejmStats (Tak/Nie):`,
    enabled: true,
  },
];

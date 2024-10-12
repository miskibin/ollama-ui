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
    relevancePrompt: `Czy pytanie choć w małym stopniu dotyczy polskiego parlamentu, polityki lub powiązanych tematów? Odpowiedz 'Tak' lub 'Nie'.

      Uwzględnij:
      1. Sejm, Senat, posłowie, senatorowie
      2. Ustawy, głosowania, interpelacje
      3. Partie polityczne, kluby parlamentarne
      4. Komisje, posiedzenia, debaty
      5. Bieżące i historyczne wydarzenia polityczne
      6. Politycy, ministrowie, premier, prezydent, rząd, opozycja, koalicja

      Pytanie: {question}
      Użyć SejmStats (Tak/Nie):`,
    enabled: true,
  },
];

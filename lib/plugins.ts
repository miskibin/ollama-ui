import { ChatPlugin } from "./types";

export enum PluginNames {
  SejmStats = "sejm-stats.pl",
}

export const plugins: ChatPlugin[] = [
  {
    name: PluginNames.SejmStats,
    enabled: true,
  },
];

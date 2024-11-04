import { ChatPlugin } from "./types";

export enum PluginNames {
  SejmStats = "sejm-stats.pl",
  Wikipedia = "wikipedia",
}

export const plugins: ChatPlugin[] = [
  {
    name: PluginNames.SejmStats,
    enabled: true,
  },
  // {
  //   name: PluginNames.Wikipedia,
  //   enabled: false,
  // },
];

import { createSejmStatsTool } from "@/tools/sejmstats";
import { ChatPlugin } from "./types";
import { createWikipediaTool } from "@/tools/wikipedia";

export enum PluginNames {
  SejmStats = "sejm-stats.pl",
  Wikipedia = "wikipedia",
}

export const plugins: ChatPlugin[] = [
  {
    name: PluginNames.SejmStats,
    enabled: true,
  },
  {
    name: PluginNames.Wikipedia,
    enabled: false,
  },
];

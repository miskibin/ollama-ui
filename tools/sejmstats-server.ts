import { z } from "zod";

export const SEJM_STATS_BASE_URL = "https://sejm-stats.pl/apiInt";

const responseSchema = z.object({
  committee_sittings: z.array(z.unknown()),
  interpellations: z.array(z.unknown()),
  processes: z.array(z.unknown()),
  prints: z.array(z.unknown()),
  acts: z.array(z.unknown()),
  votings: z.array(z.unknown()),
});

export type SejmStatsResponse = z.infer<typeof responseSchema>;

export class SejmStatsCommunicator {
  async search(searchQuery: string, field: string): Promise<SejmStatsResponse> {
    const url = new URL(`${SEJM_STATS_BASE_URL}/search`);
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("range", "3m");
    url.searchParams.append(field, "true");
    console.log(`Fetching search data from: ${url.toString()}`);
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return responseSchema.parse(data);
    } catch (error) {
      console.error(`Error fetching search data:`, error);
      throw error;
    }
  }
  optimizeForLLM(
    data: SejmStatsResponse,
    limit: number = 5
  ): SejmStatsResponse {
    const optimizedData: SejmStatsResponse = {
      committee_sittings: [],
      interpellations: [],
      processes: [],
      prints: [],
      acts: [],
      votings: [],
    };

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        optimizedData[key as keyof SejmStatsResponse] = value
          .slice(0, limit)
          .map((item: any) => {
            const optimizedItem: any = {};
            for (const [itemKey, itemValue] of Object.entries(item)) {
              if (!/photo|url|link|id|pk/i.test(itemKey)) {
                if (itemValue instanceof Date) {
                  optimizedItem[itemKey] = itemValue.toISOString();
                } else if (
                  typeof itemValue === "string" &&
                  /^\d{4}-\d{2}-\d{2}$/.test(itemValue)
                ) {
                  optimizedItem[itemKey] = new Date(itemValue).toISOString();
                } else {
                  optimizedItem[itemKey] = itemValue;
                }
              }
            }
            return optimizedItem;
          });
      }
    }

    return optimizedData;
  }
  async searchOptimized(
    searchQuery: string,
    field: string
  ): Promise<SejmStatsResponse> {
    const data = await this.search(searchQuery, field);
    return this.optimizeForLLM(data);
  }
}

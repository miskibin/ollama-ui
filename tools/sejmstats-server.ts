import { z } from "zod";

export enum SejmStatsEndpoint {
  INTERPELLATIONS = "interpellations",
  CLUBS = "clubs",
  ENVOYS = "envoys",
  ACTS = "acts",
  VOTINGS = "votings",
}

export const SEJM_STATS_BASE_URL = "https://sejm-stats.pl/apiInt";

const responseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.unknown()),
});

export type SejmStatsResponse = z.infer<typeof responseSchema>;

export class SejmStatsCommunicator {
  private pageSize: number;

  constructor(pageSize: number = 20) {
    this.pageSize = pageSize;
  }

  async fetchData(endpoint: SejmStatsEndpoint): Promise<SejmStatsResponse> {
    const url = new URL(
      `${SEJM_STATS_BASE_URL}/${endpoint.trim()}?page_size=${this.pageSize}`
    );

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return responseSchema.parse(data);
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }

  setPageSize(pageSize: number): void {
    this.pageSize = pageSize;
  }

  optimizeForLLM(data: SejmStatsResponse): Partial<SejmStatsResponse> {
    const optimizedResults = data.results.map((item: any) => {
      const optimizedItem: any = {};
      for (const [key, value] of Object.entries(item)) {
        // Skip fields containing 'photo', 'url', 'link', 'id', or 'pk'
        if (!/photo|url|link|id|pk/i.test(key)) {
          // Convert dates to ISO format for consistency
          if (value instanceof Date) {
            optimizedItem[key] = value.toISOString();
          } else if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value)
          ) {
            // If it's a date string, convert to ISO format
            optimizedItem[key] = new Date(value).toISOString();
          } else {
            optimizedItem[key] = value;
          }
        }
      }
      return optimizedItem;
    });

    return {
      count: data.count,
      results: optimizedResults,
    };
  }

  async fetchOptimizedData(
    endpoint: SejmStatsEndpoint
  ): Promise<Partial<SejmStatsResponse>> {
    const data = await this.fetchData(endpoint);
    return this.optimizeForLLM(data);
  }
}

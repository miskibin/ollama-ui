"use server";

class SejmStatsCommunicator {
  private static readonly SEJM_STATS_BASE_URL = "https://sejm-stats.pl/apiInt";

  async search(searchQuery: string, field: string): Promise<object> {
    console.debug("Search function started");
    const url = new URL(`${SejmStatsCommunicator.SEJM_STATS_BASE_URL}/search`);
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("limit", "5");
    url.searchParams.append("range", "6m");
    url.searchParams.append(field, "true");

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`HTTP error! status: ${response.status}`);
        console.error(`Response text: ${responseText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.debug("Received search data");
      return data;
    } catch (error) {
      console.error(`Error in search function:`, error);
      throw error;
    }
  }

  optimizeForLLM(data: object): any[] {
    let result: any[] = [];

    for (const value of Object.values(data)) {
      if (Array.isArray(value)) {
        result = value.map((item: any) => {
          const optimizedItem: any = {};
          for (const [itemKey, itemValue] of Object.entries(item)) {
            if (!/photo/i.test(itemKey)) {
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
        break; // We only process the first non-empty array
      }
    }
    return result;
  }

  async searchOptimized(searchQuery: string, field: string): Promise<any[]> {
    const data = await this.search(searchQuery, field);
    return this.optimizeForLLM(data);
  }
}

export const searchOptimized = async (
  searchQuery: string,
  field: string
): Promise<any[]> => {
  console.debug("searchOptimized function started");
  const communicator = new SejmStatsCommunicator();
  try {
    const result = await communicator.searchOptimized(searchQuery, field);
    console.debug("searchOptimized completed successfully");
    return result;
  } catch (error) {
    console.error(`Error in searchOptimized:`, error);
    throw error;
  }
};

"use server";

class SejmStatsCommunicator {
  private static readonly SEJM_STATS_BASE_URL = "https://sejm-stats.pl/apiInt";

  async search(searchQuery: string, field: string): Promise<object> {
    console.log("Search function started");
    const url = new URL(`${SejmStatsCommunicator.SEJM_STATS_BASE_URL}/search`);
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("limit", "5");
    url.searchParams.append("range", "3m");
    url.searchParams.append(field, "true");
    console.log(`Fetching search data from: ${url.toString()}`);

    try {
      console.log("Initiating fetch request");
      // const response = await fetch(url.toString(), {});
      const response = await fetch("https://sejm-stats.pl/apiInt/home/");

      console.log("Fetch request completed");

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        const responseText = await response.text();
        console.error(`Response text: ${responseText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Parsing JSON response");
      const data = await response.json();
      console.log(
        "Received search data:",
        JSON.stringify(data).slice(0, 200) + "..."
      );
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
  console.log("searchOptimized function started");
  const communicator = new SejmStatsCommunicator();
  try {
    console.log("Calling searchOptimized method");
    const result = await communicator.searchOptimized(searchQuery, field);
    console.log(
      `searchOptimized completed successfully. Result length: ${result.length}`
    );
    return result;
  } catch (error) {
    console.error(`Error in searchOptimized:`, error);
    throw error;
  }
};

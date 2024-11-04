"use server";

import { ActResponse } from "@/lib/types";

class SejmStatsCommunicator {
  private static readonly SEJM_STATS_BASE_URL =
    process.env.SEJM_STATS_BASE_URL || "https://sejm-stats.pl/apiInt";
  async search(searchQuery: string): Promise<ActResponse[]> {
    console.debug("Search function started");
    const url = new URL(
      `${SejmStatsCommunicator.SEJM_STATS_BASE_URL}/vector-search`
    );
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("n", "2");

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
  async searchOptimized(searchQuery: string): Promise<ActResponse[]> {
    const data = await this.search(searchQuery);
    if (data.length === 0 || data[0].similarity_score < 0.7) {
      return [
        {
          act_title:
            "Nie znalazłem niczego zgodnego, spróbuj napisać pytanie inaczej",
          similarity_score: data[0].similarity_score,
          act_url: "",
          summary: `Znaleziony akt: ${data[0].summary}`,
          content: "",
          chapters: "",
          act_announcement_date: "",
        },
      ];
    }
    if (
      data.length > 1 &&
      data[0].similarity_score - data[1].similarity_score < 0.01
    ) {
      return data.slice(0, 2);
    }
    return [data[0]];
  }
}

export const searchOptimized = async (
  searchQuery: string
): Promise<ActResponse[]> => {
  console.debug("searchOptimized function started");
  const communicator = new SejmStatsCommunicator();
  try {
    const result = await communicator.searchOptimized(searchQuery);
    console.debug("searchOptimized completed successfully");
    return result;
  } catch (error) {
    console.error(`Error in searchOptimized:`, error);
    throw error;
  }
};

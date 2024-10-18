"use server";

const PATRONITE_API_URL = process.env.PATRONITE_API_URL;
const PATRONITE_API_TOKEN = process.env.PATRONITE_API_KEY;

interface CacheItem {
  data: string[];
  timestamp: number;
}

let cache: CacheItem | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

export const getPatrons = async (): Promise<string[]> => {
  // Check if cache is valid
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    console.debug("Returning cached patrons");
    return cache.data;
  }

  const url = `${PATRONITE_API_URL}patrons/active`;
  console.debug(`Downloading patrons from ${url}`);
  const headers = {
    Authorization: `token ${PATRONITE_API_TOKEN}`,
    "Content-Type": "application/json",
  };
  console.debug(`Headers: ${JSON.stringify(headers)}`);

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    const emails = data.results.map((patron: any) => patron.email);
    const result = [
      ...emails,
      "michalskibinski109@gmail.com",
      "d4nielp0l0k@gmail.com",
    ];

    // Update cache
    cache = {
      data: result,
      timestamp: Date.now(),
    };

    return result;
  } catch (error) {
    console.error("Error fetching patrons:", error);
    return ["michalskibinski109@gmail.com"];
  }
};

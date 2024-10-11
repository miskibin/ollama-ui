"use client";
export interface Club {
  id: string;
  name: string;
  phone: string;
  fax: string;
  email: string;
  membersCount: number;
  photo_url: string;
}

export async function fetchPolishParliamentClubs(): Promise<Club[]> {
  try {
    console.log("Fetching Polish Parliament Clubs data...");
    const response = await fetch("https://sejm-stats.pl/apiInt/clubs");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched clubs data:", JSON.stringify(data, null, 2));
    return data.results;
  } catch (error) {
    console.error("Error fetching Polish Parliament Clubs:", error);
    return [];
  }
}

import { Artifact, SummarableText } from "@/lib/types";

export function extractSummarableTexts(
  artifacts: Artifact[]
): SummarableText[] {
  const result: SummarableText[] = [];
  const urlRegex = /^(?!.*video).*(url|transcript|link)/i;

  for (const artifact of artifacts) {
    if (artifact.type !== "sejm_stats" || !artifact.data) continue;

    try {
      // If data is a string, try to parse it
      const data =
        typeof artifact.data === "string"
          ? JSON.parse(artifact.data)
          : artifact.data;

      // Ensure we're working with an array
      const itemsArray = Array.isArray(data) ? data : [];

      itemsArray.forEach((item: any) => {
        let title = item.title || item.topic || item.description || item.agenda;
        let url = "";

        // Look for URL in item properties
        for (const key in item) {
          if (urlRegex.test(key)) {
            url = item[key];
            break;
          }
        }

        if (title && url) {
          result.push({ title, url });
        }
      });
    } catch (error) {
      console.error("Error processing artifact data:", error);
    }
  }

  console.log("Extracted summarable texts:", result);
  return result;
}

// Helper to check if data contains summarable texts
export function hasSummarableTexts(artifacts: Artifact[]): boolean {
  return extractSummarableTexts(artifacts).length > 0;
}

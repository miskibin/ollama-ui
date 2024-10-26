import { Artifact, SummarableText } from "@/lib/types";

export function extractSummarableTexts(
  artifacts: Artifact[]
): SummarableText[] {
  const result: SummarableText[] = [];

  for (const artifact of artifacts) {
    try {
      // If data is a string, try to parse it
      let data;
      try {
        data =
          typeof artifact.data === "string"
            ? JSON.parse(artifact.data)
            : artifact.data;
      } catch (error) {
        console.debug("Failed to parse JSON:", error);
        continue;
      }

      // Ensure we're working with an array
      const itemsArray = Array.isArray(data) ? data : [data];

      itemsArray.forEach((item: any) => {
        // Check if item has required fields for SummarableText
        if (
          item.title &&
          item.url &&
          item.summary &&
          item.similarity &&
          typeof item.text_length === "number"
        ) {
          result.push({
            title: item.title,
            summary: item.summary,
            text_length: item.text_length,
            url: item.url,
            similarity: item.similarity,
          });
        }
      });
    } catch (error) {
      console.error("Error processing artifact data:", error);
    }
  }

  return result;
}

// Helper to check if data contains summarable texts
export function hasSummarableTexts(artifacts: Artifact[]): boolean {
  return extractSummarableTexts(artifacts).length > 0;
}

import { SummarableText } from "./types";

export function extractTitlesAndUrls(json: string): SummarableText[] {
  const data = JSON.parse(json);
  console.log(data);
  const result: SummarableText[] = [];
  const urlRegex = /^(?!.*video).*(url|transcript|link)/i;
  if (!Array.isArray(data)) {
    return result;
  }
  data.forEach((item: any) => {
    let title = item.title || item.topic || item.description || item.agenda;
    let url = "";

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

  return result;
}

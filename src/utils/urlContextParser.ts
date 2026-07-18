interface ScrapedSource {
  url: string;
  content: string;
}

export function urlsContextParser(urls: ScrapedSource[]): string {
  if (!urls?.length) return "";

  return urls
    .map(
      (source, index) =>
        `Source ${index + 1}: ${source.url}\n${source.content}`,
    )
    .join("\n\n---\n\n");
}

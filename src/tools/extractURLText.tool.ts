import * as cheerio from "cheerio";

const DEFAULT_TEXT_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "article",
  "section",
  "main",
  "pre",
  "code",
  "blockquote",
  "q",
  "li",
  "span",
  "a",
];

export function extractURLText(
  html: string,
  tags: string[] = DEFAULT_TEXT_TAGS,
): string {
  const $ = cheerio.load(html);

  $("script, style, noscript").remove();

  return tags
    .flatMap((tag) =>
      $(tag)
        .map((_, el) => $(el).text().trim())
        .get(),
    )
    .filter(Boolean)
    .join("\n\n");
}

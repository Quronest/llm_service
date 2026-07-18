export const language = {
  CPP: "CPP",
  JAVASCRIPT: "JAVASCRIPT",
  TYPESCRIPT: "typescript",
  PYTHON: "PYTHON",
  JAVA: "JAVA",
  CSHARP: "CSHARP",
  GO: "GO",
  PHP: "PHP",
  RUBY: "RUBY",
  KOTLIN: "KOTLIN",
  SWIFT: "SWIFT",
  RUST: "RUST",
  DART: "DART",
  HTML: "HTML",
  CSS: "CSS",
  SQL: "SQL",
  BASH: "BASH",
} as const;

export type Language = (typeof language)[keyof typeof language];

export const languageEnumList = Object.values(language) as [
  Language,
  ...Language[],
];

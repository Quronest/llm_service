export const language = {
	CPP: "cpp",
	JAVASCRIPT: "javascript",
	TYPESCRIPT: "typescript",
	PYTHON: "python",
	JAVA: "java",
	CSHARP: "csharp",
	GO: "go",
	PHP: "php",
	RUBY: "ruby",
	KOTLIN: "kotlin",
	SWIFT: "swift",
	RUST: "rust",
	DART: "dart",
	HTML: "html",
	CSS: "css",
	SQL: "sql",
	BASH: "bash",
} as const;

export type Language = (typeof language)[keyof typeof language];

export const languageEnumList = Object.values(language) as [
	Language,
	...Language[],
];

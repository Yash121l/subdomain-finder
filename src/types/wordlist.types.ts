export type Wordlist = {
  id: string;
  name: string;
  entries: string[];
  source: "builtin" | "custom";
};

export type Role = "user" | "assistant" | "system";

export const isValidRole = (v: unknown): v is Role =>
  v === "user" || v === "assistant" || v === "system";

export interface Preferences {
  host: string;
  port: string;
  base?: string;
  http: "http" | "https";
  apiKey: string;
  futureDays?: "7" | "14" | "30" | "180";
}

export interface SonarrConfig {
  url: string;
  apiKey: string;
}

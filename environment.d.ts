declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SECRET: string;
      REFRESH_SECRET: string;
      PORT?: string;
    }
  }
}
export {};

env: ProcessEnv;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      DATABASE_URL: string;
      SECRET: string;
      REFRESH_SECRET: string;
      PORT?: string;
    }
  }
  namespace Express {
    interface Request {
      userEmail?: string;
    }
  }
}
export {};

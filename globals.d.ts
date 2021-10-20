declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SERVER: string;
      NEXT_PUBLIC_DEFAULT_USER_EMAIL: string;
      NEXT_PUBLIC_DEFAULT_USER_PASSWORD: string;

      EMAIL_USER: string;
      EMAIL_PASSWORD: string;
      EMAIL_SERVER: string;
      EMAIL_PORT: string;
      EMAIL_FROM: string;
      LOG_SQL: string;
    }
  }
}

export {};

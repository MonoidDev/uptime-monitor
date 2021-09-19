import 'tailwindcss/tailwind-config';

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare module 'tailwindcss/tailwind-config' {
  export interface TailwindColorConfig {
    primary: readonly string;
    'primary-dark': readonly string;
    secondary: readonly string;
    'secondary-dark': readonly string;
  }
}

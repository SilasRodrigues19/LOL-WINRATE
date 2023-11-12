export const checkDotEnv = (variable: string): string | undefined => {
  const value = process.env[variable];

  if (!value) console.error(`Missing environment variable ${variable}`);

  return value;
};

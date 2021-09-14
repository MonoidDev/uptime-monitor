import LocalizedStrings, { GlobalStrings } from 'react-localization';

export const createStrings = <T>(obj: GlobalStrings<T>, lang?: string) => {
  return new LocalizedStrings(
    obj,
    {
      logsEnabled: false,
      ...lang && {
        customLanguageInterface: () => lang,
      },
    },
  );
};

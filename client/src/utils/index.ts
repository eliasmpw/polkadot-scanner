export const convertCamelCaseToSentence = (camelCaseString: string): string => {
  return camelCaseString
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
};

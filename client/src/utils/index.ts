export const convertCamelCaseToSentence = (camelCaseString: string) => {
  return camelCaseString
    .replace(/([A-Z])/g, match => ` ${match}`)
    .replace(/^./, match => match.toUpperCase())
    .trim()
}

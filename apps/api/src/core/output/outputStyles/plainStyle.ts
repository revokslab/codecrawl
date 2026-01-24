const PLAIN_SEPARATOR = '='.repeat(16)
const PLAIN_LONG_SEPARATOR = '='.repeat(64)

export const getPlainTemplate = () => {
  return `
${PLAIN_LONG_SEPARATOR}
Files
${PLAIN_LONG_SEPARATOR}

{{#each processedFiles}}
${PLAIN_SEPARATOR}
File: {{{this.path}}}
${PLAIN_SEPARATOR}
{{{this.content}}}
{{/each}}

${PLAIN_LONG_SEPARATOR}
End of Codebase
${PLAIN_LONG_SEPARATOR}
`
}

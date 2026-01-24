export const getXmlTemplate = () => {
  return /* xml */ `
  <files>  
  {{#each processedFiles}}
  <file path="{{{this.path}}}">
  {{{this.content}}}
  </file>
  
  {{/each}}
  </files>
  `
}

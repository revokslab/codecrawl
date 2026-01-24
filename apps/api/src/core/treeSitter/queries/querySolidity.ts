export const querySolidity = `
;; Comments
(comment) @comment

;; Contract declarations
(contract_declaration
  name: (identifier) @name.definition.class) @definition.class

;; Interface declarations
(interface_declaration
  name: (identifier) @name.definition.interface) @definition.interface

;; Function declarations
(function_definition
  name: (identifier) @name.definition.function) @definition.function

;; Import statements
(import_directive) @definition.import

; Event definitions
(event_definition
  name: (identifier) @name.definition.event) @definition.event

; Modifier definitions
(modifier_definition
  name: (identifier) @name.definition.modifier) @definition.modifier
`

export const queryTypescript = `
(import_statement
  (import_clause (identifier) @name.reference.module)) @definition.import

(import_statement
  (import_clause 
    (named_imports
      (import_specifier 
        name: (identifier) @name.reference.module))) @definition.import)

(comment) @comment

(function_signature
  name: (identifier) @name.definition.function) @definition.function

(method_signature
  name: (property_identifier) @name.definition.method) @definition.method

(abstract_method_signature
  name: (property_identifier) @name.definition.method) @definition.method

(abstract_class_declaration
  name: (type_identifier) @name.definition.class) @definition.class

(module
  name: (identifier) @name.definition.module) @definition.module

(interface_declaration
  name: (type_identifier) @name.definition.interface) @definition.interface

(type_annotation
  (type_identifier) @name.reference.type) @reference.type

(new_expression
  constructor: (identifier) @name.reference.class) @reference.class

(function_declaration
  name: (identifier) @name.definition.function) @definition.function

(method_definition
  name: (property_identifier) @name.definition.method) @definition.method

(class_declaration
  name: (type_identifier) @name.definition.class) @definition.class

(interface_declaration
  name: (type_identifier) @name.definition.class) @definition.class

(type_alias_declaration
  name: (type_identifier) @name.definition.type) @definition.type

(enum_declaration
  name: (identifier) @name.definition.enum) @definition.enum

(lexical_declaration
    (variable_declarator
      name: (identifier) @name.definition.function
      value: (arrow_function)
    )
  ) @definition.function

(variable_declaration
    (variable_declarator
      name: (identifier) @name.definition.function
      value: (arrow_function)
    )
) @definition.function

(assignment_expression
    left: [(identifier) @name.definition.function]
    right: (arrow_function)
) @definition.function
`

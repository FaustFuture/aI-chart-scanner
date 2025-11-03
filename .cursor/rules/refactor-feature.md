Refactor the code to comply with the project architecture:

- Move UI to /features/<feature>/components
- Move state logic to /features/<feature>/hooks
- Move API/data logic to /features/<feature>/services
- Move utility functions to /features/<feature>/utils
- Move Zod + TS types to /features/<feature>/types
- Use naming conventions:
  * camelCase vars & API
  * PascalCase components
  * snake_case DB only
- Replace useEffect with hooks/data libraries when suitable

Ask my confirmation before renaming or creating a new feature folder.
Return the refactored file in the correct structure.

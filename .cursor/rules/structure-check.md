Check the given code for my project architecture and coding standards:

- Feature folders for each domain (features/<domain>/components, hooks, services, utils, types)
- Reusable components in /components/ui or /components/shared
- camelCase for TS/JS & API props
- PascalCase for React components
- snake_case only for DB fields
- React Hook Form + Zod for forms
- Avoid useEffect unless necessary for side effects
- Use SWR / React Query or custom hooks for data fetching
- No repeated logic. Extract reusable patterns into components/hooks

If code violates rules, rewrite the file.
If it follows rules, respond with: "Compliant ✅".

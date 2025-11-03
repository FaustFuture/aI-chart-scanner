## Code Standards for AI Suite

### Architecture
- Use feature-based folder structure (/features/<feature>/components, hooks, services, types, utils)
- Reusable UI components go in /components/ui or /components/shared
- Global helpers only in /lib, /hooks, /utils

### Naming
- JavaScript/TypeScript: camelCase
- React components and files: PascalCase
- Database fields: snake_case
- API route + JSON keys: camelCase

### React Rules
- Avoid useEffect unless required
- Use React Hook Form + Zod for forms
- Limit prop drilling to 3 levels max
- Use custom hooks instead of global state unless needed
- Prefer SWR/React Query for server data and caching

### Code Quality
- Must type everything (no any unless absolutely required)
- Lint errors must be fixed before commit
- No duplicated UI or logic: extract components/hooks

### File Structure Reminder
/features/<domain> 
  components/
  hooks/
  services/
  types/
  utils/

/components/ui = shadcn primitives
/components/shared = reused app components
/lib = shared services, validators, auth helpers

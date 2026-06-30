# TanStack React Query Hooks

Manage server state cache, background polling operations, mutations, and pagination indicators here.

## Structure
- Use separate hooks files for each module context, e.g., `useAuthQueries.ts`, `useSuggestionQueries.ts`.
- Coordinate mutations with the `apiClient` instance in [api-client.ts](file:///c:/Users/ROG/Desktop/HIS/HIS2/apps/frontend-web/src/services/api-client.ts).

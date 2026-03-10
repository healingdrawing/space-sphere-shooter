# CLIENT

# bun

To install dependencies:

```bash
bun i
```

To run:

```bash
bun run dev
```

Created using bun 1.2.21:
- `cd vite`
- `bun create vite` name:**ts** -> framework:**vanilla** -> variant:**TypeScript**
- `cd ts`
- `bun i`
- `bun run dev` ... to test created template. **Ctrl+c** to stop dev run.
- `bun add jotai` to manage state using jotai atoms.
- `bun add react` otherwise jotai complains.
- `bun add babylonjs` .
- `bun add --dev @types/babylonjs` .
- `bun add -g typescript@latest`
- `bun add @types/node` to manage **path** in vite project and read .env from root level
- comment in `tsconfig.json` **"erasableSyntaxOnly": true,** and **"noUncheckedSideEffectImports": true** since it looks like impossible to satisfy all this magic in same time use typescript properly.
- `tsc --v` output: **Version 5.9.2** .

After that everything red disappeared from the project template, and project was ready to development.  

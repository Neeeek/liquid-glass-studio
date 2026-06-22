<!-- FILE: docs/07-tooling-setup.md -->

# 07 — Tooling & Setup (Vite + React 19 + TypeScript)

## 7.1 package.json

```json
{
  "name": "liquid-glass-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.0",
    "vite": "^6.0.0"
  }
}
```

> Use the latest patch of each at install time. React 19 requires
> `@types/react@^19` and `@types/react-dom@^19`.

## 7.2 vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
```

## 7.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "src"
  ],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

## 7.4 tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": [
    "vite.config.ts"
  ]
}
```

## 7.5 Root entry HTML

Vite uses a single root-level `index.html` as its build entry point (it parses this file and injects the bundled
module). This is NOT the Create-React-App `public/index.html` pattern, and there is no `public/` folder for it. Do not
move it into a subfolder; `npm run dev` and `npm run build` both require it at the project root. Keep it minimal — all
UI is rendered by React into `#root`.

## 7.6 main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>
	<App/>
</React.StrictMode>);
```

## 7.7 Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run preview  # preview the build
```

## 7.8 Recommended extras (optional)

- `.gitignore`: `node_modules`, `dist`, `.DS_Store`, `*.local`.
- A root `README.md` summarizing the project + the browser‑support story (great for
  a portfolio repo). Reuse content from `01` and `02`.
- Deploy target: Vercel or Netlify (zero‑config for Vite). Build command
  `npm run build`, output dir `dist`.

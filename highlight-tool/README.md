# Session Highlight Timer App

This is a simple web app built with React, TypeScript, and Vite. It allows you to:

- Start a session timer
- Highlight moments during the session with a description
- Stop the timer manually
- Export the session (timestamps, descriptions, session name, and date) as a CSV file

## Usage

1. **Start**: Click the Start button to begin the timer.
2. **Highlight**: While the timer is running, click Highlight to mark a moment and enter a description.
3. **Stop**: Click Stop to end the session.
4. **Export**: Enter a session name and click Export CSV to download your session data.

## Development

To run the app locally:

```bash
npm install
npm run dev
```

To build for production:

```bash
npm run build
```

---

This project was bootstrapped with Vite's React + TypeScript template.
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all', // only error on unused args after the last used one
          argsIgnorePattern: '^_', // ignore params starting with "_"
          varsIgnorePattern: '^_', // also ignore local vars starting with "_"
          caughtErrorsIgnorePattern: '^_', // ignore caught errors like `catch (_err)`
        },
      ],
    },
  },
  { ignores: ['dist/**/*', 'node_modules/**/*', '.next/**/*'] },
]

export default eslintConfig

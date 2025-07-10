// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist', 'node_modules', '.vite'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: {
            react: { version: '18.3' }
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,

            // React specific rules
            'react/jsx-no-target-blank': 'off',
            'react/prop-types': 'off', // We'll use TypeScript later
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],

            // Code quality rules
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',

            // Formatting rules (will be handled by Prettier)
            'indent': 'off',
            'quotes': 'off',
            'semi': 'off',
            'comma-dangle': 'off',
            'object-curly-spacing': 'off',
            'array-bracket-spacing': 'off',

            // JSX formatting rules
            'react/jsx-indent': 'off',
            'react/jsx-indent-props': 'off',
            'react/jsx-closing-bracket-location': 'off',
            'react/jsx-closing-tag-location': 'off',
        },
    },
]
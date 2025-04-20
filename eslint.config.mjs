import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    globalIgnores(['projects/**/*', '**/www']),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint
        }
    },
    {
        files: ['**/*.ts'],

        extends: compat.extends(
            'plugin:@angular-eslint/recommended',
            'plugin:@angular-eslint/template/process-inline-templates',
            'plugin:@typescript-eslint/recommended-requiring-type-checking'
        ),

        languageOptions: {
            ecmaVersion: 5,
            sourceType: 'script',

            parserOptions: {
                project: ['tsconfig.json'],
                createDefaultProgram: true
            }
        },

        rules: {
            curly: 'error',
            'no-underscore-dangle': 'error',
            'no-console': 'warn',
            'no-empty-function': 'error',
            'spaced-comment': 'error',
            '@typescript-eslint/member-ordering': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',

            '@typescript-eslint/unbound-method': [
                'error',
                {
                    ignoreStatic: true
                }
            ],

            '@angular-eslint/component-class-suffix': [
                'error',
                {
                    suffixes: ['Page', 'Component']
                }
            ],

            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'app',
                    style: 'kebab-case'
                }
            ],

            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'app',
                    style: 'camelCase'
                }
            ],

            '@angular-eslint/prefer-standalone': 'off'
        }
    },
    {
        files: ['**/*.html'],
        extends: compat.extends('plugin:@angular-eslint/template/recommended'),
        rules: {}
    }
]);

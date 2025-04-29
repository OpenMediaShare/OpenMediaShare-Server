// import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
// const eslint = require('@eslint/js')
// const tseslint = require('typescript-eslint')

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores:['./dist/*'],
        'rules': {
            'indent': [
                'error',
                4,
                {
                    'SwitchCase': 1
                }
            ],
            'linebreak-style': [
                'error',
                'windows'
            ],
            'quotes': [
                'error',
                'single'
            ],
            'semi': [
                'error',
                'always'
            ],
            'no-unused-vars':'off',
            '@typescript-eslint/no-unused-vars': 'warn'
        }
    }
);

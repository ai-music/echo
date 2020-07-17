module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        '@typescript-eslint/ban-types': ['off'],
        '@typescript-eslint/no-empty-interface': ['off'],
        '@typescript-eslint/interface-name-prefix': ['off'],
        '@typescript-eslint/no-use-before-define': ['off'],
        '@typescript-eslint/ban-ts-comment': ['off'],
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: true
                }
            }
        ],
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/quotes': ['error', 'single', { allowTemplateLiterals: true }],
        '@typescript-eslint/no-explicit-any': ['off']
    },
    ignorePatterns: ['*.spec.ts']
}

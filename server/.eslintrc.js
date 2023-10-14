module.exports = {
  'env': {
    'commonjs': true,
    'es2021': true,
    'node': true
  },
  'extends': ['eslint:recommended', 'google'],
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'rules': {
    'linebreak-style': 0,
    'comma-dangle': 0,
    'object-curly-spacing': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    'max-len': ['error', {
      'code': 120,
      'ignoreComments': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true
    }],
    'operator-linebreak': ['error', 'before'],
    'valid-jsdoc': 0,
    'indent': ['error', 2, { 'MemberExpression': 1 }]
  }
};

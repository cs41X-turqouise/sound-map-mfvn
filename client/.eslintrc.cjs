module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'google',
  ],
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    'vue',
  ],
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
    'indent': ['error', 2, { 'MemberExpression': 1 }],
    'new-cap': 0,
  },
};

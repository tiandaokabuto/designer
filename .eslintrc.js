module.exports = {
  env: {
    //指定代码的运行环境
    browser: true,
    node: true,
  },
  extends: [
    'airbnb',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  settings: {
    'import/resolver': {
      webpack: {
        config: require.resolve('./configs/webpack.config.renderer.dev.babel'),
      },
    },
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  rules: {
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-fragments': 'off',
    'no-else-return': 'off',
    'no-restricted-syntax': 0,
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [0],
    'import/no-extraneous-dependencies': 0,
    'react/display-name': 0,
    'no-param-reassign': 0,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};

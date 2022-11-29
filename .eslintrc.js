module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "commonjs": true, // 支持对commonjs全局变量的识别
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/jsx-runtime"
  ],
  "overrides": [
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }, // 支持jsx
    "ecmaVersion": "latest"
  },
  "plugins": [
    "react",
    "@typescript-eslint"
  ],
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-var-requires": "off",
  },

}

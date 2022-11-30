## 一些预备知识

### git 杂项知识

1. 提交 dist 目录到 gh-pages，远端没有就立刻创建

```bash
git subtree push --prefix dist origin gh-pages
```

2. 重看远端分支有啥

```bash
git remote -v
# 有的话，就先删除，再关联到远端
git remote rm origin
```

3. 修改上一次的 commit message

```bash
git commit --amend --message
```

### node 杂项知识

1. 管理 npm 仓库镜像的

```npm
npm install Pana/nrm -g
```

2. Error: EPERM: operation not permitted, uv_cwd
   报这个错是因为文件目录不纯净，在~就可以

3. 列出所有全局安装的包

```js
 npm list -g --dpath=0 列出全局安装的包
```

## lint&项目初始化

ts 使用注意 📢 事项：tsc --watch name.ts 监听 ts 文件变化生成同名 js 文件
ts-node 命令可以直接运行 ts 文件，而不用先 tsc 编译，再执行

### 各种 lint 配置

需要使用 eslint 配置和 ts 下的支持，还有 commitlint 的配置（前提是仓库是 git 仓库）：

1. 先安装

```js
npm install eslint eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser  --save-dev

```

2. 使用 eslint 生成配置：

```js
// bash命令
npx eslint —init // 按照需要选择相关项即可

// .eslintrc.js文件内容
module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    // add
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
    // add
    // jsx-uses-react必须增加对import React from 'react';的引入，在 React 17 之后，jsx 的页面已经不再需要引入 React了，所以我们去掉这条 lint 规则
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    // 禁用使用 require 来定义，node 很多相关的依赖没有对 es module 的定义，所以我们也去掉这条 lint 规则
    "@typescript-eslint/no-var-requires": "off",
  },
  // add 很重要
  "settings": {
    "react": {
      "pragma": 'React',
      "version": 'detect',
    }
  }
}

```

3. commit lint

安装：

```js
npm install --save-dev @commitlint/config-conventional @commitlint/cli

echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js

// 修改commitlint.config.js
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 常用的commit消息前缀
    "type-enum": [2, "always", ["feat", "fix", "revert"]],
    // 实际的 commit 长度（不包括前缀），这里我们设置为30
    "subject-max-length": [1, "always", 30],
  },
};

// 简单的测试命令
echo 'add commitlint config' | npx commitlint
echo 'feat: add commitlint config' | npx commitlint
```

4. 使用 git hook 进行提交前的校验
   安装 husky:

```js
npm install husky --save-dev
npx husky install
npx husky add .husky/commit-msg

```

修改 🪝 函数内容：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# undefined
# 提交之前先eslint
npx eslint src/**
# 提交时执行commitlint
npx --no-install commitlint --edit $1
```

### 编写 server 配置打包

1. 编写 server 端代码，使用 express 来快速实现：

```js
npm install express  --save
npm install @types/express --save-dev
// 还有express的ts的定义

// ./src/index.js 的极简代码
const express = require("express");
const childProcess = require("child_process");

const app = express();

app.get("*", (req, res) => {
  res.send(`
    <html
      <body>
        <div>hello-ssr</div>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("ssr-server listen on 3000");
});

childProcess.exec("start http://127.0.0.1:3000");

```

2. 安装各种 loader 和 webpack

```js
npm install @babel/preset-env babel-loader ts-loader webpack webpack-merge webpack-cli --save-dev

```

3. 编写 webpack 配置文件，由于我们需要有客户端和服务端，两者很有可能有相同的配置，所以分为一个基础配置 base 的和 server 配置 client 配置，然后 先把 base 和 server,merge 到一起

```js
// webpack.base.js
const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: "/node_modules/",
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /.(ts|tsx)?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
};

// webpack.server.js就很简单了
const path = require("path");

const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base");

module.exports = merge(baseConfig, {
  mode: "development",
  entry: "./src/server/index.tsx",
  target: "node",
  output: {
    filename: "bundle.js",
    path: path.resolve(process.cwd(), "server_build"),
  },
});
```

4. 可以修改刚才的 server 了

```js
// ./src/server/index.tsx 就改成ESM引用方式就行
import express from "express";
import childProcess from "child_process";
```

5. 初始化 tsconfig.json

```json
// tsc --init 生成下面的json
// tsconfig.json
{
  "compilerOptions": {
    "module": "CommonJS",
    "types": ["node"], // 声明类型，使得ts-node支持对tsx的编译
    "jsx": "react-jsx", // 全局导入, 不再需要每个文件定义react
    "target": "es6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

5. 监控打包的命令：

```js
npx webpack build --config ./webpack.server.js --watch
```

6. 通过 nodemon 实时监控 js 文件

```json
npm install nodemon --save-dev

// package.json 添加命令
"scripts": {
    "start": "npx nodemon ./server_build/bundle.js",
    "start2": "npx nodemon --watch src server_build/bundle.js --ext tsx,ts",
    "build:server": "npx webpack build --config ./webpack.server.js --watch",
 }

```

## 实现 SSR 的静态页面渲染

### 什么是真正的 SSR

### 实现模板渲染

1. 安装 react

```js
npm install react react-dom --save
npm install @types/react @types/react-dom --save-dev
```

### 同构

### client 页面引入打包文件

### 路由匹配

安装路由：

```js
npm install react-router-dom --save

```

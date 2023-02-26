# Tracker

## Init

输入以下命令初始化一个项目。

```js

npm init

tsc --init

npm install rollup -D
npm install rollup-plugin-dts -D
npm install rollup-plugin-typescript2 -D
npm install typescript -D

```

版本号为

```json
{
  "rollup": "^2.77.0",
  "rollup-plugin-dts": "^4.2.2",
  "rollup-plugin-typescript2": "^0.32.1",
  "typescript": "^4.9.5"
}
```

新建基础目录结构

`src/core/index.ts`---核心代码

`src/types/index.ts`---工具函数

`score/utils/pv.ts`---声明文件

新建 `rollup.config.js`进行 rollup 配置。

```js
// rollup.config.js

import ts from "rollup-plugin-typescript2";
import path from "path";
import dts from "rollup-plugin-dts";
export default [
  {
    //入口文件
    input: "./src/core/index.ts",
    output: [
      //打包esModule
      {
        file: path.resolve(__dirname, "./dist/index.esm.js"),
        format: "es",
      },
      //打包common js
      {
        file: path.resolve(__dirname, "./dist/index.cjs.js"),
        format: "cjs",
      },
      //打包 AMD CMD UMD
      {
        input: "./src/core/index.ts",
        file: path.resolve(__dirname, "./dist/index.js"),
        format: "umd",
        name: "tracker",
      },
    ],
    //配置ts
    plugins: [ts()],
  },
  {
    //打包声明文件
    input: "./src/core/index.ts",
    output: {
      file: path.resolve(__dirname, "./dist/index.d.ts"),
      format: "es",
    },
    plugins: [dts()],
  },
];
```

增加打包命令

```json
{
  "scripts": {
    "build": "rollup -c"
  }
}
```

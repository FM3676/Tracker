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

## Init Tracker

```ts
// core/index.ts

export default class Tracker {
  constructor(options) {}

  private initDef() {}
}
```

初始化一个`Tracker`类，`constructor`接受一些 options，接下来在`types/index.ts`定义一些类型。

```ts
// core/index.ts

/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersionsdk版本
 * @extra透传字段
 * @jsError js 和 promise 报错异常上报
 */
export interface DefaultOptons {
  uuid: string | undefined;
  requestUrl: string | undefined;
  historyTracker: boolean;
  hashTracker: boolean;
  domTracker: boolean;
  sdkVersion: string | number;
  extra: Record<string, any> | undefined;
  jsError: boolean;
}

//必传参数 requestUrl
export interface Options extends Partial<DefaultOptons> {
  requestUrl: string;
}

//版本
export enum TrackerConfig {
  version = "1.0.0",
}
```

首先此处`DefaultOptions`定义了`options`的属性，将其使用在`initDef`上，让其初始化配置

```ts
export default class Tracker {
  // ...
  private initDef(): DefaultOptons {
    return <DefaultOptons>{
      sdkVersion: TrackerConfig.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
    };
  }
}
```

其次`Options`则为`constructor`内参数的类型，此处使用`Partial`去扩展`DefaultOptions`，使其内所有参数都变得可选，而`requestUrl`是必写参数，因此再把他加上，同时定义一个`TrackerConfig`储存 version。

最后，在类里面定义一个`data`变量，储存初始化后得到的`options`。

```ts
import { DefaultOptons, Options, TrackerConfig } from "../types/index";

export default class Tracker {
  public data: Options;
  constructor(options: Options) {
    this.data = Object.assign(this.initDef(), options);
  }

  private initDef(): DefaultOptons {
    return <DefaultOptons>{
      sdkVersion: TrackerConfig.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
    };
  }
}
```

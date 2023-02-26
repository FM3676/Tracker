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

## PV(Page View)

PV 页面访问量，即 PageView，用户每次对网站的访问均被记录

主要监听了 history 和 hash

history 的 API 包括：`go`、` back`、`forward`、`pushState`、`replaceState`

hash 可以使用 `hashchange` 监听。

但是对于 history，`popState`可以监听浏览器的前进后退操作（历史记录的上一页和下一页），和 history 方法的`go`、`back`方法，对于`pushState`、`replaceState` 无法有效监听，因此我们在 `utils/pv.ts`重写方法。

```ts
// utils/pv.ts

export const createHistoryEvent = <T extends keyof History>(type: T) => {
  const origin = history[type];

  return function (this: any) {
    const res = origin.apply(this, arguments);

    const e = new Event(type);

    window.dispatchEvent(e);

    return res;
  };
};
```

> Event 创建自定义事件
>
> dispatchEvent 派发事件
>
> addEventListener 监听事件
>
> removeEventListener 删除事件
>
> 其实也就是 发布订阅模式

这里首先先获取原先 history 里面对应的方法（例如`go`方法），获取到以后返回一个高阶函数，里面调用`origin`方法并获取结果`res`并返回。然后在里面创建自定义事件然后将它 dispatch 出去。

再回到`core/index.ts`调用它

```tsx
// core/index.ts

export default class Tracker {
  // ...
  private initDef(): DefaultOptons {
    window.history["pushState"] = createHistoryEvent("pushState");
    window.history["replaceState"] = createHistoryEvent("replaceState");
  }
  // ...
}
```

这样，我们就修改了原来 history 上的方法，使其变的可以被监听。

接下来可以根据用户的选项，来进行调用决定是否监听 history 和 hash。

```ts
export default class Tracker {
  // ...
  private captureEvent<T>(
    mouseEventList: string[],
    targetKey: string,
    data?: T
  ) {
    mouseEventList.forEach((event) =>
      window.addEventListener(event, () => {
        console.log("Tracking!");
      })
    );
  }

  private installTracker() {
    if (this.data.historyTracker)
      this.captureEvent(
        ["pushState", "replaceState", "popstate"],
        "history-pv"
      );

    if (this.data.hashTracker) this.captureEvent(["hashchange"], "hash-pv");
  }
}
```

在这里的第二个参数`targetKey`，通常是与后端协商的。例如，触发监听后，需要给回一些东西。

新建一个`index.html`，引入打包好的 js 文件，并启用 tracker。

```html
<script src="./dist/index.js"></script>
<script>
  new tracker({
    historyTracker: true,
  });
</script>
```

通过 live server 打开 html 文件，在控制台输入如 `history.pushState("123", "", "/a")`，会看到控制台输出`Tracking！`。表面已经成功监听，若此时点击返回上一页按钮，控制台也会输出语句。

## UV(Unique Visitor)

Unique Visitor，访问网站的一台电脑客户端为一个访客。
用户唯一标识：可以在登陆过后生成一个 UUId 后储存在 localStorage 里面，然后上报。也可以使用 canvas 指纹追踪技术。
登录之后，后台会返回一个 id，所以我们暴露一个`setUserId`的方法，用于设置并储存 id。

```ts
export default class Tracker {
  public setUserId<T extends DefaultOptons["uuid"]>(uuid: T) {
    this.data.uuid = uuid;
  }

  public setExtra<T extends DefaultOptons["extra"]>(extra: T) {
    this.data.extra = extra;
  }
}
```

暴露两个方法，用于设置id，和用户的一些自定义选项extra。


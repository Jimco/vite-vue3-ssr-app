# @zqd/naco

封装的 Vite + Koa 渲染和构建的相关逻辑，支持 SSR。

## 目录结构

```bash
├── client                      # 同构相关逻辑
│   ├── head                    # TDK 同构组件
│   ├── async-data.ts           # 异步数据同构封装
│   ├── define-server-entry.ts
│   ├── error-handle.ts
│   ├── error.ts
│   ├── index.d.ts
│   ├── index.js
│   ├── inject.ts
│   ├── link.ts
│   ├── meta.ts
│   ├── no-ssr.ts
│   ├── request.ts
│   ├── use-naco-data.ts
│   └── use.ts
├── src                         # SSR 构建相关逻辑
│   ├── build.ts
│   ├── index.ts
│   ├── plugin.ts
│   ├── render.ts
│   └── ssr-style.ts
├── README.md
└── package.json
```

## 如何使用

**TDK 同构**：

```vue
<template>
    <naco-head>
        <title>Home</title>
        <meta name="description" content="站点描述" />
        <meta name="keywords" content="关键字1,关键字2,关键字3" />
        <naco-script src="https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js" />
    </naco-head>
</template>
```

**异步数据同构**：

```js
import { defineComponent } from 'vue';
import { useAsyncData } from '@zqd/naco/client';
import { request } from '../../services/request';

export default defineComponent({
    async setup() {
        const { data: friendSitesList } = useAsyncData(
            async () => {
                try {
                    const resp = await request.get('/api/friend-sites');
                    return resp.data || [];
                } catch (err) {
                    return [];
                }
            },
            { initData: [] },
        );

        return {
            friendSitesList,
        };
    }
});
```


# vite-plugin-env

读取项目 env.ts 的环境变量

vite.config.ts
```typescript
import { ViteEnvPlugin } from '@zqd/vite-plugin-env';
import { defineConfig } from 'vite';

export default defineConfig((env) => ({
    plugins: [
        ViteEnvPlugin(),
    ],
}));

```

env.ts
```ts
import pkg from './package.json';
export default {
    VERSION: pkg.version,
}
```

app.ts
```ts
console.log(import.meta.env.VERSION);
// 打印 package.json 的 version 值
```

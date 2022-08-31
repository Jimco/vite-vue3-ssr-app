# Vite SSR

**Vite + Vue3 + Koa + Pnpm + Changeset + CI-Task-Runner** SSR Starter.

## 目录结构

```bash
.
├── apps                    # 应用目录
│   ├── admin
│   └── www
├── packages                # 公共包目录
│   ├── load-es             # Node 环境 es/ts 加载器
│   ├── naco                # Vite + Koa SSR 构建及渲染相关逻辑封装
│   └── vite-plugin-env     # Vite 环境变量插件
├── scripts                 # 打包构建脚本
├── server                  # Node 服务
├── README.md
├── dockerfile
├── lerna-debug.log
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── shims.d.ts
```

## 开发维护

**本地开发服务**：

```bash
# 下载依赖
pnpm run install

# 启动本地开发服务
pnpm run dev
```

**打包构建**：

```bash
# 下载依赖
pnpm run install

# 打包构建
pnpm run build

# 构建 docker 镜像
docker build -t @jimcox/vite-ssr
```

> **注意**：package.json 中 `preinstall` 限制了只能使用 pnpm 作为包管理器，可根据业务需求自行调整。


## 应用规范

子应用目录必须符合以下结构：

```bash
.
├── src
│   ├── ...
│   ├── app.vue
│   ├── entry-client.ts
│   ├── entry-server.ts
│   ├── main.ts
│   ├── router.ts
│   └── ...
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

> **注意**：因渲染及构建逻辑耦合在 @zqd/naco 库中，当前所有的子应用需严格遵循以上目录结构及文件命名。

## 常用命令

| 命令 | 说明 |
| ---- | ---- |
| `pnpm run dev` | 启动开发服务，包括 server, apps, packages |
| `pnpm run build` | 启动构建，通常由 DevOps 执行 |
| `pnpm run change` | 开始交互式填写变更集 |
| `pnpm run ver:pkgs` | 统一提升版本号 |
| `pnpm run publish:beta` | 发包，指定 tag 为 beta |
| `pnpm run publish:next` | 发包，指定 tag 为 next |


<!--
发包流程：

1. `pnpm run change` 填写变更集
2. `pnpm run ver:pkgs` 消耗变更集
3. `pnpm run publish:beta` / `pnpm run publish:next` 正式发包（with beta/next tag）
-->

## 参考文档

- [Koa](https://koajs.docschina.org/)
- [Vue3](https://v3.cn.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [PNPM](https://pnpm.io/)
- [Changesets](https://github.com/changesets/changesets#documentation)
- [CI-TASK-RUNNER](https://github.com/gaoding-inc/ci-task-runner)

# iframe-embed-sdk

一款通用且轻量级的 iframe 嵌出 (Embed) SDK，提供稳定、极简的双向通信协议层，帮助外部业务系统无缝集成 AI Agent 或其他 Web 应用能力。

---

## 一、安装 SDK

推荐使用 pnpm 安装：

```bash
pnpm add iframe-embed-sdk
```

---

## 二、基础集成

最简单的使用方式，仅需提供容器节点和平台配置标识（`configId`）。容器的尺寸完全由宿主的 CSS 控制。

```tsx
import { useEffect, useRef } from 'react'
import { createAgentClient } from 'iframe-embed-sdk'

export default function AgentPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const client = createAgentClient({
      container: containerRef.current,
      baseURL: 'https://api.your-platform.com',
      // 以下为自定义透传参数，会自动拼接到 iframe 的 URL 参数中
      configId: 'your_config_id', 
      token: 'user-token',
      theme: 'dark', // 任意额外参数

      onReady: () => {
        console.log('Agent Client 已经加载完毕并准备好通信')
      },

      onError: (err) => {
        console.error('Agent Client 发生严重错误:', err)
      }
    })

    // 组件卸载时销毁实例
    return () => {
      client.destroy()
    }
  }, [])

  // 宿主自由控制 iframe 容器的尺寸
  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
}
```

---

## 三、动态配置更新 (Patch Config)

在不重新加载 iframe 的前提下，业务侧可根据用户场景动态覆盖（Patch）某些能力。例如切换知识库或可用的 agents 白名单：

```ts
client.patchConfig({
  agents: ['agent_A', 'agent_B'],
  knowledge_bases:'kb_user_123'
})
```

---

## 四、事件监听与通信

SDK 提供了一个纯粹的底层通信桥梁。宿主可以监听来自 iframe 的自定义事件，也可以主动向 iframe 发送指令。

### 1. 监听事件

```tsx
// 监听 iframe 内部发出的关闭请求
client.on('CLOSE', () => {
  console.log('用户在内部点击了关闭，宿主可以隐藏容器')
  containerRef.current.style.display = 'none'
})

// 监听自定义业务事件（如 AI 分析完成）
client.on('AI_ANALYSIS_DONE', (data) => {
  console.log('收到 AI 结果:', data)
})
```

### 2. 发送自定义指令

除了内置的 `patchConfig` 和 `close`，你可以通过 `send` 发送任何自定义事件供 iframe 内部消费：

```ts
// 告诉 iframe 内部：外部业务系统的选中项发生了变化
client.send('UPDATE_CONTEXT', { partId: 'P1001' })

// 触发 iframe 内部的某个图表生成动作
client.send('GENERATE_CHART', { type: 'pie' })
```

### 3. 请求式调用（带返回结果）

如果你需要等待内部执行完毕并获取返回值，可以使用 Promise 形式的 `request` 方法：

```ts
async function fetchChartData() {
  try {
    const result = await client.request('FETCH_CHART_DATA', { chartId: '123' });
    console.log('数据获取成功:', result);
  } catch (error) {
    console.error('数据获取失败:', error);
  }
}
```

---

## 五、API 参考 (API Reference)

### `createAgentClient(options)`

初始化并挂载 iframe，返回 `AgentClient` 实例。

**参数 (AgentClientOptions):**
- `container` (string | HTMLElement): 挂载的目标 DOM 元素或选择器 (必填)。
- `baseURL` (string): 目标平台的基础 URL (必填)。
- `width` (string): iframe 的宽度，默认 '100%' (可选)。
- `height` (string): iframe 的高度，默认 '100%' (可选)。
- `onReady` (function): 初始化加载完成后的回调 (可选)。
- `onError` (function): 发生核心错误时的回调 (可选)。
- `[key: string]: any`: 任何额外的自定义参数（如 `configId`、`token`、`theme` 等），都会被自动作为 URL Query 参数透传给目标 iframe。

### `AgentClient 实例方法`

- `client.patchConfig(payload: object)`: 运行时动态覆盖/更新配置。
- `client.close()`: 向内部发送关闭指令。
- `client.send(type: string, payload?: any)`: 单向发送自定义事件到 iframe。
- `client.request<T>(type: string, payload?: any): Promise<T>`: 发起双向请求并等待内部响应。
- `client.on(event: string, handler: function)`: 监听来自 iframe 的事件（内置支持 `ERROR`, `READY`, `CLOSE`, `PATCH_CONFIG` 以及任意自定义字符串）。
- `client.off(event: string, handler: function)`: 取消事件监听。
- `client.destroy()`: 销毁实例，清理 DOM 节点和事件监听。

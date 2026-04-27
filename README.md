# iframe-embed-sdk

A universal and lightweight iframe embed SDK that provides a stable, minimalist two-way communication protocol layer, helping external business systems seamlessly integrate AI Agents or other Web application capabilities.

---

## 1. Install SDK

Installation via pnpm is recommended:

```bash
pnpm add iframe-embed-sdk
```

---

## 2. Basic Integration

The simplest way to use it requires only a container node and a platform configuration identifier (`configId`). The dimensions of the container are fully controlled by the host's CSS.

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
      // The following are custom pass-through parameters that will be automatically appended to the iframe's URL parameters
      configId: 'your_config_id', 
      token: 'user-token',
      theme: 'dark', // Any extra parameters

      onReady: () => {
        console.log('Agent Client has loaded and is ready to communicate')
      },

      onError: (err) => {
        console.error('Agent Client encountered a critical error:', err)
      }
    })

    // Destroy the instance when the component unmounts
    return () => {
      client.destroy()
    }
  }, [])

  // The host freely controls the dimensions of the iframe container
  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
}
```

---

## 3. Dynamic Configuration Update (Patch Config)

Without reloading the iframe, the business side can dynamically override (Patch) certain capabilities based on user scenarios. For example, switching knowledge bases or available agents whitelists:

```ts
client.patchConfig({
  agents: ['agent_A', 'agent_B'],
  knowledge_bases:'kb_user_123'
})
```

---

## 4. Event Listening and Communication

The SDK provides a pure underlying communication bridge. The host can listen to custom events from the iframe, or proactively send instructions to the iframe.

### 4.1 Listen to Events

```tsx
// Listen to the close request sent from within the iframe
client.on('CLOSE', () => {
  console.log('The user clicked close inside, the host can hide the container')
  containerRef.current.style.display = 'none'
})

// Listen to custom business events (e.g., AI analysis completed)
client.on('AI_ANALYSIS_DONE', (data) => {
  console.log('Received AI result:', data)
})
```

### 4.2 Send Custom Instructions

Besides the built-in `patchConfig` and `close`, you can use `send` to dispatch any custom events for the iframe to consume:

```ts
// Tell the iframe: the selection in the external business system has changed
client.send('UPDATE_CONTEXT', { partId: 'P1001' })

// Trigger a specific chart generation action within the iframe
client.send('GENERATE_CHART', { type: 'pie' })
```

### 4.3 Request-style Calls (with Return Value)

If you need to wait for the internal execution to complete and get a return value, you can use the Promise-based `request` method:

```ts
async function fetchChartData() {
  try {
    const result = await client.request('FETCH_CHART_DATA', { chartId: '123' });
    console.log('Data fetched successfully:', result);
  } catch (error) {
    console.error('Data fetch failed:', error);
  }
}
```

---

## 5. API Reference

### `createAgentClient(options)`

Initializes and mounts the iframe, returning an `AgentClient` instance.

**Parameters (AgentClientOptions):**
- `container` (string | HTMLElement): The target DOM element or selector to mount on (Required).
- `baseURL` (string): The base URL of the target platform (Required).
- `width` (string): The width of the iframe, default is '100%' (Optional).
- `height` (string): The height of the iframe, default is '100%' (Optional).
- `onReady` (function): Callback when initial loading is complete (Optional).
- `onError` (function): Callback when a core error occurs (Optional).
- `[key: string]: any`: Any additional custom parameters (such as `configId`, `token`, `theme`, etc.) will be automatically passed to the target iframe as URL Query parameters.

### `AgentClient Instance Methods`

- `client.patchConfig(payload: object)`: Dynamically override/update configurations at runtime.
- `client.close()`: Send a close instruction to the inside.
- `client.send(type: string, payload?: any)`: Unidirectionally send custom events to the iframe.
- `client.request<T>(type: string, payload?: any): Promise<T>`: Initiate a two-way request and wait for the internal response.
- `client.on(event: string, handler: function)`: Listen to events from the iframe (built-in support for `ERROR`, `READY`, `CLOSE`, `PATCH_CONFIG`, and any custom string).
- `client.off(event: string, handler: function)`: Remove event listener.
- `client.destroy()`: Destroy the instance, clean up DOM nodes and event listeners.

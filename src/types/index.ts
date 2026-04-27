export interface ClientOptions {
  /**
   * 挂载容器，可以是选择器字符串或 DOM 元素
   */
  container: string | HTMLElement;
  /**
   * 目标嵌入平台的 baseURL
   */
  baseURL: string;

  /**
   * 宽度
   */
  width?: string;
  /**
   * 高度
   */
  height?: string;

  // Lifecycle Callbacks
  /**
   * 嵌入的 iframe 加载完成并准备好接收消息时的回调
   */
  onReady?: () => void;
  /**
   * 发生错误时的回调
   */
  onError?: (err: Error) => void;

  /**
   * 其他透传给 iframe 的 URL 参数
   */
  [key: string]: any;
}

/**
 * 跨端通信的消息体结构
 */
export interface Message<T = any> {
  /**
   * 消息事件类型
   */
  type: string;
  /**
   * 消息唯一标识符（用于请求/响应匹配）
   */
  requestId?: string;
  /**
   * 消息载荷数据
   */
  payload?: T;
}

export type EventHandler = (payload: any) => void;

/**
 * 支持的内部事件类型 (极简版)
 * 注意：这里的 READY 和 ERROR 是 iframe 通过 postMessage 发给宿主的“信号类型”
 * 宿主接收到这两个信号后，才会去触发 SDK 暴露的 onReady / onError 回调函数。
 */
export type EventType = 
  | 'READY'          // iframe 通知宿主：我准备好了
  | 'ERROR'          // 错误事件
  | 'PATCH_CONFIG'   // 动态更新配置（增量覆盖当前配置）
  | 'CLOSE'          // 宿主请求关闭 iframe/Agent 或 iframe 通知宿主要关闭自己
  | string;

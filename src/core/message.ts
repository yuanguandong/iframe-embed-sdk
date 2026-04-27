import { EventHandler, Message } from '../types';
import { uuid } from '../utils/uuid';

export class Messenger {
  private iframeWindow: Window | null = null;
  private baseURL: string;
  private pendingRequests: Record<string, { resolve: Function; reject: Function }> = {};
  private listeners: Record<string, EventHandler[]> = {};

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.handleMessage);
  }

  public setIframeWindow(win: Window | null) {
    this.iframeWindow = win;
  }

  private handleMessage(event: MessageEvent) {
    // 提取真正的 origin (去除可能带有的 URL 参数/路径，以匹配 event.origin)
    const expectedOrigin = this.baseURL === '*' ? '*' : new URL(this.baseURL).origin;
    
    // 校验 Origin，确保安全
    if (event.origin !== expectedOrigin && expectedOrigin !== '*') return;

    const data = event.data as Message;
    if (!data || !data.type) return;

    // 处理 request 响应
    if (data.requestId && this.pendingRequests[data.requestId]) {
      if (data.type === 'ERROR') {
        this.pendingRequests[data.requestId].reject(data.payload);
      } else {
        this.pendingRequests[data.requestId].resolve(data.payload);
      }
      delete this.pendingRequests[data.requestId];
    }

    // 触发监听事件
    if (this.listeners[data.type]) {
      this.listeners[data.type].forEach((handler) => handler(data.payload));
    }
  }

  public send(type: string, payload?: any) {
    if (!this.iframeWindow) {
      console.warn('IframeEmbedSDK: iframe is not ready to send messages.');
      return;
    }
    const message: Message = { type, payload };
    const targetOrigin = this.baseURL === '*' ? '*' : new URL(this.baseURL).origin;
    this.iframeWindow.postMessage(message, targetOrigin);
  }

  public request<T = any>(type: string, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = uuid();
      this.pendingRequests[requestId] = { resolve, reject };
      
      if (!this.iframeWindow) {
        return reject(new Error('IframeEmbedSDK: iframe is not ready to send requests.'));
      }
      
      const message: Message = { type, payload, requestId };
      const targetOrigin = this.baseURL === '*' ? '*' : new URL(this.baseURL).origin;
      this.iframeWindow.postMessage(message, targetOrigin);
    });
  }

  public on(type: string, handler: EventHandler) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  public off(type: string, handler: EventHandler) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((h) => h !== handler);
  }

  public destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.listeners = {};
    this.pendingRequests = {};
    this.iframeWindow = null;
  }
}

import { ClientOptions, EventHandler } from '../types';
import { Messenger } from './message';
import { createIframe } from './iframe';

export class Client {
  private iframe: HTMLIFrameElement;
  private messenger: Messenger;
  
  constructor(options: ClientOptions) {
    this.iframe = createIframe(options);
    this.messenger = new Messenger(options.baseURL);

    this.iframe.onload = () => {
      this.messenger.setIframeWindow(this.iframe.contentWindow);
      if (options.onReady) {
        options.onReady();
      }
    };

    // 绑定核心错误事件
    this.messenger.on('ERROR', (err) => {
      if (options.onError) {
        options.onError(new Error(err));
      }
    });
  }

  public patchConfig(payload: Record<string, any>) {
    this.messenger.send('PATCH_CONFIG', payload);
  }

  public close() {
    this.messenger.send('CLOSE');
  }

  public send(type: string, payload?: any) {
    this.messenger.send(type, payload);
  }

  public request<T = any>(type: string, payload?: any): Promise<T> {
    return this.messenger.request<T>(type, payload);
  }

  public on(type: string, handler: EventHandler) {
    this.messenger.on(type, handler);
  }

  public off(type: string, handler: EventHandler) {
    this.messenger.off(type, handler);
  }

  public destroy() {
    this.messenger.destroy();
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
  }
}

export function createClient(options: ClientOptions): Client {
  return new Client(options);
}

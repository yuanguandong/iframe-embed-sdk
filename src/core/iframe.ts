import { ClientOptions } from '../types';

export function createIframe(options: ClientOptions): HTMLIFrameElement {
  const { container, baseURL, width = '100%', height = '100%', onReady, onError, ...restParams } = options;

  let containerEl: HTMLElement | null = null;
  if (typeof container === 'string') {
    containerEl = document.querySelector(container);
  } else {
    containerEl = container;
  }

  if (!containerEl) {
    throw new Error(`IframeEmbedSDK: Cannot find container element.`);
  }

  const iframe = document.createElement('iframe');
  
  // 拼接 URL 参数
  const url = new URL(baseURL);
  
  // 将剩余的参数作为查询参数透传
  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  iframe.src = url.toString();
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.allow = 'microphone; camera; clipboard-read; clipboard-write';

  containerEl.appendChild(iframe);
  return iframe;
}

import bridge from '@vkontakte/vk-bridge';

export async function initVKApp(): Promise<void> {
  try {
    await bridge.send('VKWebAppInit');
  } catch {
    // ignore in web
  }
}

export async function setSwipeSettings(enabled: boolean): Promise<void> {
  try {
    await bridge.send('VKWebAppSetSwipeSettings', { history: enabled });
  } catch {
    // ignore
  }
}

export async function openLink(url: string): Promise<void> {
  try {
    // VK Bridge doesn't support VKWebAppOpenLink, use share instead or window.open
    await bridge.send('VKWebAppShare', { link: url });
  } catch {
    window.open(url, '_blank');
  }
}

export async function hapticError(): Promise<void> {
  try {
    await bridge.send('VKWebAppTapticNotificationOccurred', { type: 'error' });
  } catch {
    // ignore
  }
}

export async function hapticSuccess(): Promise<void> {
  try {
    await bridge.send('VKWebAppTapticNotificationOccurred', { type: 'success' });
  } catch {
    // ignore
  }
}

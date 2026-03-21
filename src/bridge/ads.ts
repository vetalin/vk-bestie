import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';

export async function checkAds(type: 'reward' | 'interstitial'): Promise<boolean> {
  try {
    const format = type === 'reward' ? EAdsFormats.REWARD : EAdsFormats.INTERSTITIAL;
    const result = await bridge.send('VKWebAppCheckNativeAds', { ad_format: format });
    return result.result;
  } catch {
    return false;
  }
}

export async function showInterstitial(): Promise<boolean> {
  const available = await checkAds('interstitial');
  if (!available) return false;
  try {
    await bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL });
    return true;
  } catch {
    return false;
  }
}

export async function showRewarded(): Promise<boolean> {
  const available = await checkAds('reward');
  if (!available) return false;
  try {
    const result = await bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.REWARD });
    return result.result;
  } catch {
    return false;
  }
}

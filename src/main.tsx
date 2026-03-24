import bridge from '@vkontakte/vk-bridge';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@vkontakte/vkui/dist/vkui.css';
import { App } from './App';

// ОБЯЗАТЕЛЬНО: вызвать до рендера — VK клиент ждёт этот сигнал в течение 30 секунд
bridge.send('VKWebAppInit');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

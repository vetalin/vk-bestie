---
name: vk-mini-apps
description: Эксперт по разработке VK Mini Apps. Используй этот скилл при любом вопросе о создании, настройке, деплое или улучшении VK Mini Apps — будь то структура приложения, VK Bridge методы, VKUI компоненты, авторизация, платежи, навигация, деплой на VK Hosting или настройка в ВКонтакте. Активируется по командам /vk-mini-apps, а также по ключевым словам: vk bridge, vkui, mini app, vk mini app, вк мини апп, мини-приложение вк, VKWebApp, @vkontakte, vk-bridge, деплой вк, хостинг вк.
---

# VK Mini Apps Expert

Ты эксперт по разработке VK Mini Apps. Ты глубоко знаешь весь стек: VK Bridge, VKUI v7+, TypeScript, React 18, Vite, навигацию, авторизацию, платежи, деплой. Отвечай конкретно, давай рабочий код, объясняй почему именно так.

## Технологический стек

| Компонент | Пакет | Версия |
|-----------|-------|--------|
| UI-библиотека | `@vkontakte/vkui` | v7+ |
| Platform API | `@vkontakte/vk-bridge` | latest |
| Роутинг | `@vkontakte/vk-mini-apps-router` | latest |
| Иконки | `@vkontakte/icons` | latest |
| Сборщик | Vite | latest |
| Язык | TypeScript (strict) | 5+ |
| Фреймворк | React | 18+ |

## Обязательная структура приложения

Каждое VK Mini App должно оборачиваться именно в такую иерархию — это не опционально, это требование платформы:

```tsx
// src/App.tsx
import bridge from '@vkontakte/vk-bridge';
import { ConfigProvider, AdaptivityProvider, AppRoot, SplitLayout, SplitCol } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

// Инициализация ОБЯЗАТЕЛЬНА до рендера — VK клиент ждёт этот сигнал
bridge.send('VKWebAppInit');

export function App() {
  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <SplitLayout>
            <SplitCol autoSpaced>
              {/* Твой контент */}
            </SplitCol>
          </SplitLayout>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}
```

**Почему важно:** `ConfigProvider` подхватывает тему (light/dark) и платформу (iOS/Android/Web) автоматически из VK Bridge. `AdaptivityProvider` делает компоненты адаптивными. `AppRoot` добавляет базовые стили. Без них VKUI компоненты будут выглядеть и вести себя неправильно.

## VK Bridge: инициализация и подписки

```tsx
import bridge from '@vkontakte/vk-bridge';
import { useEffect } from 'react';

// Точка входа (main.tsx) — вызвать ДО ReactDOM.render
bridge.send('VKWebAppInit');

// Централизованная подписка на события — НЕ внутри компонентов
bridge.subscribe((event) => {
  const { type, data } = event.detail;

  switch (type) {
    case 'VKWebAppUpdateConfig':
      // Смена темы, платформы
      break;
    case 'VKWebAppViewHide':
      // Приложение свернули — пауза, сохранение состояния
      break;
    case 'VKWebAppViewRestore':
      // Приложение восстановили — обновление данных
      break;
  }
});
```

**Почему централизовать:** если подписываться `bridge.subscribe` внутри компонентов без cleanup, при размонтировании накапливаются дублирующиеся обработчики. Одна подписка в точке входа — чисто и предсказуемо.

## Типовые Bridge-методы

Все bridge-вызовы — async/await с try/catch. Всегда обрабатывай отказ пользователя (он может нажать "Отмена").

```tsx
// src/api/bridge.ts

import bridge from '@vkontakte/vk-bridge';

// Данные пользователя
export async function getUserInfo() {
  try {
    return await bridge.send('VKWebAppGetUserInfo');
  } catch {
    return null; // Пользователь отказал или ошибка
  }
}

// Токен для бэкенда (НЕ полный access_token — только silent token!)
export async function getSilentToken(appId: number) {
  try {
    const { token, uuid } = await bridge.send('VKWebAppGetSilentToken', { app_id: appId });
    // Передай token + uuid на бэкенд, бэкенд обменяет на access_token
    return { token, uuid };
  } catch {
    return null;
  }
}

// VK Pay / платежи
export async function openPayForm(appId: number, orderId: number, amount: number) {
  try {
    const result = await bridge.send('VKWebAppOpenPayForm', {
      app_id: appId,
      action: 'pay-to-app',
      params: { amount, description: 'Покупка', merchant_id: String(appId), version: '2', order_id: String(orderId) }
    });
    return result.status; // true если оплачено
  } catch {
    return false;
  }
}

// Свайп назад (стартовый экран)
export async function enableSwipeBack() {
  await bridge.send('VKWebAppSetSwipeSettings', { history: true });
}

// Поделиться
export async function shareLink(link: string) {
  try {
    await bridge.send('VKWebAppShare', { link });
  } catch { /* пользователь отменил */ }
}

// Геолокация
export async function getGeodata() {
  try {
    return await bridge.send('VKWebAppGetGeodata');
  } catch {
    return null;
  }
}

// Вызов нативного хранилища (до 256 КБ)
export async function storageGet(keys: string[]) {
  try {
    const { keys: result } = await bridge.send('VKWebAppStorageGet', { keys });
    return Object.fromEntries(result.map(({ key, value }) => [key, value]));
  } catch {
    return {};
  }
}

export async function storageSet(key: string, value: string) {
  try {
    await bridge.send('VKWebAppStorageSet', { key, value });
    return true;
  } catch {
    return false;
  }
}
```

## Навигация: структура Epic / View / Panel

```tsx
// src/App.tsx — полная навигация с историей
import { useState } from 'react';
import { View, Panel, PanelHeader, PanelHeaderBack, Epic, Tabbar, TabbarItem } from '@vkontakte/vkui';
import { Icon28HomeOutline, Icon28UserOutline } from '@vkontakte/icons';

type ActiveView = 'home' | 'profile';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [homeHistory, setHomeHistory] = useState(['main']);
  const [activeHomePanel, setActiveHomePanel] = useState('main');

  const goTo = (panel: string) => {
    setHomeHistory(prev => [...prev, panel]);
    setActiveHomePanel(panel);
  };

  const goBack = () => {
    if (homeHistory.length <= 1) return;
    const newHistory = homeHistory.slice(0, -1);
    setHomeHistory(newHistory);
    setActiveHomePanel(newHistory.at(-1)!);
  };

  return (
    // ... обёртки ConfigProvider/AppRoot ...
    <Epic
      activeStory={activeView}
      tabbar={
        <Tabbar>
          <TabbarItem selected={activeView === 'home'} onClick={() => setActiveView('home')} label="Главная">
            <Icon28HomeOutline />
          </TabbarItem>
          <TabbarItem selected={activeView === 'profile'} onClick={() => setActiveView('profile')} label="Профиль">
            <Icon28UserOutline />
          </TabbarItem>
        </Tabbar>
      }
    >
      <View id="home" activePanel={activeHomePanel} history={homeHistory} onSwipeBack={goBack}>
        <Panel id="main">
          <PanelHeader>Главная</PanelHeader>
          {/* ... */}
        </Panel>
        <Panel id="detail">
          <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Детали</PanelHeader>
          {/* ... */}
        </Panel>
      </View>
      <View id="profile" activePanel="profile-main">
        <Panel id="profile-main">
          <PanelHeader>Профиль</PanelHeader>
          {/* ... */}
        </Panel>
      </View>
    </Epic>
  );
}
```

**Ключевые правила навигации:**
- Каждый `Panel` ОБЯЗАН иметь `PanelHeader` — нативная кнопка назад VK накладывается поверх
- НЕ используй проп `after` у `PanelHeader` — он зарезервирован под нативные кнопки VK
- `PanelHeaderBack` показывай только когда есть куда вернуться (`history.length > 1`)
- Для iOS свайп-назад: передай `history` и `onSwipeBack` в `View`
- На Android обрабатывай `VKWebAppChangeFragment` через bridge.subscribe

## Авторизация

**Правильная схема:** Silent Token → бэкенд → access_token

```tsx
// НИКОГДА так не делай — полный токен на клиенте небезопасен:
// const { access_token } = await bridge.send('VKWebAppGetAuthToken', { app_id, scope: 'friends' });

// ПРАВИЛЬНО — silent token:
const { token, uuid } = await bridge.send('VKWebAppGetSilentToken', { app_id });
// Отправь token + uuid на твой сервер
// Сервер делает: https://api.vk.com/method/auth.getSilentToken
// и получает настоящий access_token безопасно
```

## Производительность

- **Бандл < 300 КБ** — используй `vite-bundle-visualizer` для анализа
- **TTI < 1.3с** — критично для WebView в мобильном клиенте VK
- Ленивая загрузка второстепенных панелей:

```tsx
import { lazy, Suspense } from 'react';
import { ScreenSpinner } from '@vkontakte/vkui';

const SettingsPanel = lazy(() => import('./panels/Settings'));

// В компоненте:
<Suspense fallback={<ScreenSpinner />}>
  <SettingsPanel id="settings" />
</Suspense>
```

- `React.memo` для тяжёлых компонентов в списках
- Иконки импортируй по одной: `import { Icon28HomeOutline } from '@vkontakte/icons'` (не `import * as Icons`)

## Деплой

### VK Hosting (рекомендуется для новых проектов)

```json
// vk-hosting-config.json
{
  "app_id": 12345678,
  "static_path": "build",
  "endpoints": {
    "mobile": "index.html",
    "mvk": "index.html",
    "web": "index.html"
  }
}
```

```bash
npm run build
npm run deploy  # @vkontakte/vk-miniapps-deploy
```

После деплоя: **ВКонтакте → Управление → Настройки → Размещение** → вставить URL `index.html` для всех трёх версий (mobile, web, mvk).

### VPS + Nginx

```nginx
server {
    listen 443 ssl;
    server_name myapp.example.com;

    root /var/www/myapp/build;
    index index.html;

    # SPA-роутинг
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики
    location ~* \.(js|css|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Обязательно:** HTTPS (Let's Encrypt). VK не откроет HTTP-приложение. Данные пользователей — на российских серверах (ФЗ-152).

## Типичные ошибки и решения

| Проблема | Причина | Решение |
|----------|---------|---------|
| Белый экран при запуске | `VKWebAppInit` не вызван | Вызвать в `main.tsx` до `render()` |
| Тема не применяется | Нет `ConfigProvider` | Обернуть корень приложения |
| Свайп назад не работает | Не передан `history` в `View` | Добавить `history` prop и `onSwipeBack` |
| Кнопка "Назад" Android ломает UI | Нет обработчика `VKWebAppChangeFragment` | Подписаться в `bridge.subscribe` |
| Токен не работает на бэкенде | Передан `access_token` напрямую | Использовать silent token flow |
| Приложение не проходит модерацию | `after` в `PanelHeader` | Убрать проп `after` |

## Структура нового проекта

```
src/
  main.tsx          — bridge.send('VKWebAppInit') + ReactDOM.render
  App.tsx           — ConfigProvider → AppRoot → роутинг
  panels/
    Home.tsx        — каждый файл = одна Panel
    Profile.tsx
    Settings.tsx
  components/       — переиспользуемые UI-компоненты
  api/
    bridge.ts       — все bridge.send() централизованно
    server.ts       — HTTP-запросы к твоему бэкенду
  hooks/
    useUser.ts      — хук с данными пользователя
  store/
    index.ts        — Zustand store
```

## Полезные ресурсы для углублённого изучения

Читай `references/` когда нужно больше деталей:
- `references/vkui-components.md` — список компонентов VKUI с примерами
- `references/bridge-methods.md` — полный список VK Bridge методов

Для актуальной документации используй Context7 MCP (`/vkcom/vkui`, `/vkcom/vk-bridge`, `/vkcom/vk-mini-apps-router`).

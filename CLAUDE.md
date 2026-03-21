# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Назначение репозитория

Шаблон для быстрого старта VK Mini-Apps. Используется как основа для новых проектов в рамках автоматизированного pipeline: идея → разработка → деплой → публикация в VK → монетизация.

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| Frontend | React 18+ (functional components only) |
| UI Library | VKUI v7+ |
| Platform API | VK Bridge (`@vkontakte/vk-bridge`) |
| Language | TypeScript (strict mode) |
| Icons | `@vkontakte/icons` |
| Build | Vite |
| Tests | Vitest |

## Команды разработки

```bash
npm run dev        # Локальный dev-сервер
npm run build      # Сборка для продакшена (output: build/)
npm run lint       # Проверка ESLint
npm run lint:fix   # Автоисправление ESLint
npm run tsc        # Проверка типов TypeScript
npm run test       # Запуск unit-тестов
npm run deploy     # Деплой через @vkontakte/vk-miniapps-deploy
```

## Структура проекта

```
src/
  App.tsx           — Корневой компонент: ConfigProvider → AppRoot → SplitLayout → Router
  panels/           — Экраны приложения (один файл = одна Panel)
  components/       — Переиспользуемые UI-компоненты
  api/              — VK Bridge вызовы и серверные запросы
  hooks/            — Кастомные React-хуки
  store/            — Стейт-менеджмент (Zustand)
docs/               — Архитектурные решения, схемы, ADR
.claude/
  skills/           — Многоразовые воркфлоу (/deploy-vk, /generate-panel и т.д.)
vk-hosting-config.json  — Конфиг деплоя на хостинг ВКонтакте
```

## Соглашения по коду

**VKUI Layout:** Обязательная обёртка — `ConfigProvider` → `AppRoot` → `AdaptivityProvider` → `SplitLayout` → `SplitCol`.

**VK Bridge Init:** Вызывать `bridge.send('VKWebAppInit')` в точке входа до загрузки основных ресурсов (в течение первых 30 секунд).

**Навигация:** Структура `Epic/Root` → `View` → `Panel`. Каждый экран обязан иметь `PanelHeader`. **Не использовать параметр `after` у `PanelHeader`** — он зарезервирован под нативные кнопки VK.

**Bridge вызовы:** Все `bridge.send(...)` — async, обёрнуты в `try/catch`. Обрабатывать сценарий отказа пользователя. Централизовать подписки через `bridge.subscribe`, не внутри компонентов.

**TypeScript:** Запрет на `any`. Все пропсы и API-ответы типизируются интерфейсами. Только именованные экспорты (no default exports).

**Авторизация:** Использовать `VKWebAppGetSilentToken` → обмен на `access_token` на бэкенде. Никогда не передавать полный `access_token` на клиент.

**Производительность:** Бандл < 300 КБ, TTI < 1.3с. `React.lazy` + `Suspense` для второстепенных панелей. `React.memo` для предотвращения лишних ре-рендеров.

**Swipeback:** На стартовом экране включать системный свайп назад через `VKWebAppSetSwipeSettings`. Обрабатывать аппаратную кнопку «Назад» на Android.

## Деплой

### VK Hosting (основной способ)
```bash
# vk-hosting-config.json должен содержать: app_id, static_path: "build"
npm run build && npm run deploy
```

### VPS (Nginx)
- Обязателен HTTPS (Let's Encrypt / Certbot)
- Nginx: `try_files $uri $uri/ /index.html` для SPA-роутинга
- Данные пользователей хранятся на российских серверах (ФЗ-152)

### Настройка в VK
После деплоя: Настройки → Размещение → URL → вставить адрес `index.html` для мобильной, веб и mvk версий.

## VK Mini-App Pipeline

Этот шаблон — часть pipeline полного цикла:
1. **Идея** — анализ, MVP-скоуп
2. **Дизайн** — VKUI гайдлайны, мобильный WebView
3. **Разработка** — Claude Code с этим шаблоном
4. **Деплой** — VPS/VK Hosting
5. **Публикация** — модерация VK
6. **Монетизация** — VK Pay (`VKWebAppOpenPayForm`), реклама, подписки

## Next.js + PostgreSQL Pattern (Backend Apps)

When building apps that require a backend (multiplayer, real-time, persistent data), use Next.js instead of Vite:

### Stack
- **Next.js 14** (App Router, TypeScript) — frontend + API Routes
- **PostgreSQL** — via Coolify Postgres service
- **Prisma v5** (NOT v7 — breaking API changes) — ORM
- **HTTP Polling every 2s** — simpler than WebSockets for MVP
- **Zustand** — state management with polling logic

### Setup
```bash
npx create-next-app@latest <app-name> --typescript --app --no-tailwind --eslint --no-src-dir --import-alias "@/*"
npm install @vkontakte/vk-bridge @vkontakte/vkui @vkontakte/icons prisma@^5 @prisma/client@^5 zustand
```

### Prisma Singleton (lib/db.ts)
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### VK Bridge (lib/vk.ts) — client-only
```typescript
'use client';
import bridge from '@vkontakte/vk-bridge';
export { bridge };

export async function getVKUser() {
  const userInfo = await bridge.send('VKWebAppGetUserInfo');
  return userInfo;
}
export async function initVKBridge() {
  await bridge.send('VKWebAppInit');
}
```

### Polling pattern in Zustand store
```typescript
startPolling: (code: string) => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) { clearInterval(interval); return; }
      const data = await res.json();
      set({ room: data });
      // sync app state from room status
    } catch { /* ignore silently */ }
  }, 2000);
  set({ pollingInterval: interval });
},
stopPolling: () => {
  const { pollingInterval } = get();
  if (pollingInterval) { clearInterval(pollingInterval); set({ pollingInterval: null }); }
},
```

### IMPORTANT: Prisma version
Always use `prisma@^5` NOT v7. Prisma v7 moved DATABASE_URL config to `prisma.config.ts` (breaking change).

### Build script (package.json)
```json
"build": "prisma generate && next build"
```
This ensures Prisma client is generated before Next.js build even without DB connection.

### Next.js API Route params (Next.js 14+ async params)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params; // Must await params in Next.js 14+
}
```

## Reusable Bridge Patterns (extracted from vk-bolt-sort-puzzle)

### VK Bridge Utilities (src/bridge/vkBridge.ts)
- `initVKApp()` - VKWebAppInit wrapper
- `setSwipeSettings(enabled)` - swipe back settings
- `openLink(url)` - open external link via VKWebAppShare or window.open fallback
- `hapticError()` / `hapticSuccess()` - taptic notifications

### Ads Utilities (src/bridge/ads.ts)
- `checkAds(type)` - check ad availability ('reward' | 'interstitial')
- `showInterstitial()` - show interstitial ad
- `showRewarded()` - show rewarded ad, returns boolean (user watched)
- Uses `EAdsFormats` enum from `@vkontakte/vk-bridge` — always import enum, don't pass strings directly

### VKUI v7 API Notes
- `ConfigProvider` uses `colorScheme` prop (not `appearance`): `<ConfigProvider platform="ios" colorScheme="dark">`
- `ModalCard` uses `open` prop (not controlled via ModalRoot): `<ModalCard open={isOpen} title="..." description="...">`
- `Alert` is a popout — conditionally render it: `{show && <Alert ... />}` — no `open` prop
- `ModalCardBase` props: `title`, `description`, `actions` (not `header`/`subheader`)
- Icons: `Icon24ArrowUturnLeftOutline` (not `Icon24ArrowUturnLeft`), `Icon24ExternalLinkOutline` (not `Icon16ExternalLinkOutline`)
- `AlertActionInterface.action` receives optional args object

### Zustand Store Pattern with localStorage
```typescript
const STORAGE_KEY = 'app_progress_v1';

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlayerProgress;
  } catch { /* ignore */ }
  return createDefaultProgress();
}

function saveProgressToStorage(p: PlayerProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}
```

### Canvas Game Pattern
- Use `canvas.getBoundingClientRect()` for touch/click coordinate mapping
- Apply `devicePixelRatio` scaling: `canvas.width = rect.width * dpr; ctx.scale(dpr, dpr);`
- Use `ctx.save()` / `ctx.restore()` around scaled drawing
- `touchAction: 'none'` CSS on canvas to prevent scroll conflict
- Handle both `onClick` and `onTouchEnd` for cross-platform support

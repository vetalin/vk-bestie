# VK Bridge Methods Reference

Полный справочник методов VK Bridge. Источник: @vkontakte/vk-bridge

## Инициализация
| Метод | Описание |
|-------|---------|
| `VKWebAppInit` | Инициализация приложения. Вызывать ПЕРВЫМ, до любого UI |
| `VKWebAppGetClientVersion` | Версия клиента VK |

## Пользователь
| Метод | Параметры | Возвращает |
|-------|-----------|-----------|
| `VKWebAppGetUserInfo` | — | `{ id, first_name, last_name, photo_100, photo_200, timezone, ... }` |
| `VKWebAppGetEmail` | — | `{ email, sign }` |
| `VKWebAppGetPhoneNumber` | — | `{ phone_number, sign }` |
| `VKWebAppGetGeodata` | — | `{ available, lat, long }` |

## Авторизация
| Метод | Параметры | Описание |
|-------|-----------|---------|
| `VKWebAppGetSilentToken` | `{ app_id }` | Безопасный токен для обмена на бэкенде |
| `VKWebAppGetAuthToken` | `{ app_id, scope }` | **Устарел для клиентов** — токен виден фронту |

## Навигация и UI
| Метод | Параметры | Описание |
|-------|-----------|---------|
| `VKWebAppSetSwipeSettings` | `{ history: boolean }` | Включить/выключить системный свайп назад |
| `VKWebAppSetLocation` | `{ location, replace_state? }` | Обновить URL-хэш |
| `VKWebAppChangeFragment` | — | **Событие** от клиента при нажатии "Назад" |

## Монетизация
| Метод | Описание |
|-------|---------|
| `VKWebAppOpenPayForm` | Открыть форму VK Pay / донат |
| `VKWebAppShowOrderBox` | Показать диалог покупки VK товара |
| `VKWebAppShowLeaderBoardBox` | Показать таблицу лидеров |
| `VKWebAppShowAds` | Показать рекламу (interstitial) |
| `VKWebAppCheckBannerAd` | Проверить доступность баннерной рекламы |
| `VKWebAppShowBannerAd` | Показать баннерную рекламу |
| `VKWebAppHideBannerAd` | Скрыть баннер |

## Хранилище
| Метод | Параметры | Описание |
|-------|-----------|---------|
| `VKWebAppStorageGet` | `{ keys: string[] }` | Получить значения (макс 256 КБ суммарно) |
| `VKWebAppStorageSet` | `{ key, value }` | Сохранить значение |
| `VKWebAppStorageGetKeys` | `{ count, offset? }` | Получить список ключей |

## Социальные
| Метод | Параметры | Описание |
|-------|-----------|---------|
| `VKWebAppShare` | `{ link }` | Поделиться ссылкой |
| `VKWebAppShowWallPostBox` | `{ message, ... }` | Опубликовать на стену |
| `VKWebAppAddToFavorites` | — | Добавить мини-апп в закладки |
| `VKWebAppJoinGroup` | `{ group_id }` | Вступить в группу |
| `VKWebAppAllowNotifications` | — | Разрешить push-уведомления |

## Системные / платформенные
| Метод | Описание |
|-------|---------|
| `VKWebAppGetConfig` | Конфигурация: тема, цветовая схема, платформа |
| `VKWebAppUpdateConfig` | **Событие**: смена темы/конфигурации |
| `VKWebAppViewHide` | **Событие**: приложение свернули |
| `VKWebAppViewRestore` | **Событие**: приложение развернули |
| `VKWebAppCopyText` | Скопировать текст в буфер |
| `VKWebAppOpenApp` | Открыть другой Mini App |
| `VKWebAppClose` | Закрыть Mini App |

## Скоупы авторизации
```
friends    — список друзей
photos     — фото
video      — видео
pages      — вики-страницы
status     — статус
notes      — заметки
messages   — сообщения (только для сервисных ключей)
wall       — публикации на стену
groups     — группы
offline    — офлайн-доступ (не рекомендуется для фронта)
```

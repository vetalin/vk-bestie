# VKUI Components Reference

Ключевые компоненты VKUI v7+ для VK Mini Apps. Импорт: `@vkontakte/vkui`.

## Обёртки (обязательно в корне)

```tsx
import { ConfigProvider, AdaptivityProvider, AppRoot, SplitLayout, SplitCol } from '@vkontakte/vkui';
```

| Компонент | Роль |
|-----------|------|
| `ConfigProvider` | Тема, платформа, локаль. Принимает `colorScheme`, `platform`, `locale` |
| `AdaptivityProvider` | Адаптивность: мобайл / таблет / десктоп |
| `AppRoot` | Базовые глобальные стили, порталы для модалок |
| `SplitLayout` | Двухколоночный layout (колонка меню + основной контент) |
| `SplitCol` | Одна колонка. Prop `autoSpaced` добавляет боковые отступы на широких экранах |

## Навигация

| Компонент | Использование |
|-----------|--------------|
| `Epic` | Корневой контейнер для нескольких View с таббаром |
| `Root` | Корневой контейнер для нескольких View без таббара |
| `View` | Контейнер панелей одного раздела. Props: `activePanel`, `history`, `onSwipeBack` |
| `Panel` | Один экран. Обязателен уникальный `id` |
| `PanelHeader` | Шапка панели. Prop `before` — иконка назад/закрыть |
| `PanelHeaderBack` | Кнопка "Назад" для `before` PanelHeader |
| `Tabbar` | Нижняя навигационная панель |
| `TabbarItem` | Элемент таббара. Props: `selected`, `label`, `onClick` |

## Типичный экран (Panel)

```tsx
import { Panel, PanelHeader, PanelHeaderBack, Group, SimpleCell } from '@vkontakte/vkui';

interface Props {
  id: string;
  onBack: () => void;
}

export function SettingsPanel({ id, onBack }: Props) {
  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        Настройки
      </PanelHeader>
      <Group>
        <SimpleCell>Уведомления</SimpleCell>
        <SimpleCell>Приватность</SimpleCell>
      </Group>
    </Panel>
  );
}
```

## Списки и ячейки

| Компонент | Описание |
|-----------|---------|
| `Group` | Секция с разделителем. Prop `header` — заголовок секции |
| `SimpleCell` | Простая строка. Props: `before`, `after`, `indicator`, `subtitle` |
| `Cell` | Ячейка для навигации/выбора. Props аналогичны SimpleCell |
| `MiniInfoCell` | Компактная строка с иконкой |
| `InfoRow` | Строка ключ-значение |
| `Header` | Заголовок секции (вставлять в `header` Group) |

## Формы

| Компонент | Описание |
|-----------|---------|
| `FormItem` | Обёртка для поля ввода с лейблом и ошибкой |
| `Input` | Текстовое поле |
| `Textarea` | Многострочный ввод |
| `Select` | Выпадающий список |
| `CustomSelect` | Кастомизируемый выпадающий список |
| `Checkbox` | Чекбокс |
| `Radio` | Радиокнопка |
| `Switch` | Переключатель вкл/выкл |
| `Slider` | Ползунок |
| `DatePicker` | Выбор даты |

```tsx
<FormItem top="Email" htmlFor="email" status="error" bottom="Введите корректный email">
  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
</FormItem>
```

## Кнопки

| Компонент | Описание |
|-----------|---------|
| `Button` | Основная кнопка. Props: `size` (s/m/l), `mode` (primary/secondary/tertiary/outline/link), `appearance` |
| `IconButton` | Кнопка с иконкой без текста |
| `ButtonGroup` | Группа кнопок |
| `FloatingActionButton` | FAB-кнопка (плавающая) |
| `CellButton` | Кнопка в стиле ячейки |

## Модальные окна

```tsx
import { ModalRoot, ModalPage, ModalPageHeader, ModalCard } from '@vkontakte/vkui';

// В корне приложения — передавать в SplitLayout как modal prop
<SplitLayout modal={
  <ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
    <ModalPage id="filters" header={<ModalPageHeader>Фильтры</ModalPageHeader>}>
      {/* контент */}
    </ModalPage>
    <ModalCard id="confirm" header="Удалить?" subheader="Это действие нельзя отменить">
      <Button onClick={confirm}>Удалить</Button>
    </ModalCard>
  </ModalRoot>
}>
```

## Загрузка и состояния

| Компонент | Использование |
|-----------|--------------|
| `ScreenSpinner` | Полноэкранный спиннер загрузки |
| `Spinner` | Инлайн-спиннер |
| `Skeleton` | Скелетон-плейсхолдер |
| `Placeholder` | Пустое состояние с иконкой и текстом |
| `PullToRefresh` | Обёртка для свайпа вниз = обновить |

```tsx
// Пустое состояние
<Placeholder
  icon={<Icon56GhostOutline />}
  header="Ничего не найдено"
  action={<Button onClick={reset}>Сбросить</Button>}
>
  Попробуйте изменить параметры поиска
</Placeholder>
```

## Медиа

| Компонент | Описание |
|-----------|---------|
| `Avatar` | Аватар пользователя/группы. Props: `size`, `src`, `initials` |
| `Image` | Изображение с placeholder |
| `Gallery` | Слайдер изображений |
| `Carousel` | Горизонтальный скролл карточек |

## Уведомления

```tsx
import { useSnackbar, Snackbar } from '@vkontakte/vkui';

const [snackbar, setSnackbar] = useState<React.ReactNode>(null);

const showSuccess = () => setSnackbar(
  <Snackbar onClose={() => setSnackbar(null)} before={<Icon28CheckCircleOutline />}>
    Сохранено успешно
  </Snackbar>
);

// В JSX:
{snackbar}
```

## Адаптивность

```tsx
import { useAdaptivityConditionalRender, usePlatform } from '@vkontakte/vkui';

const { viewWidth } = useAdaptivityConditionalRender();
const platform = usePlatform(); // 'ios' | 'android' | 'vkcom'

// Показать только на мобильных:
{viewWidth.tabletMinus && <div className={viewWidth.tabletMinus.className}>Мобайл</div>}

// Показать только на планшете и больше:
{viewWidth.tabletPlus && <div className={viewWidth.tabletPlus.className}>Десктоп</div>}
```

## Иконки

Пакет: `@vkontakte/icons`. Импортировать по одной:

```tsx
import { Icon28HomeOutline, Icon24Add, Icon16Clear } from '@vkontakte/icons';
```

Размеры: 12, 16, 20, 24, 28, 32, 36, 44, 48, 56, 96.
Стиль: `Outline` (контур), без суффикса (залитые), `Badge` (с индикатором).

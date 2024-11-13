# nexus-state

Лёгкая и гибкая библиотека для управления состоянием в React-приложениях с поддержкой строгой типизации. Подходит для построения сложных структур состояния с минимальным количеством перерендеров.

## Установка

Установите библиотеку, выполнив команду:

```bash
npm install <nexus-state>
```

# Начало работы

## 1. Определение начальных состояний и экшенов

Создайте файл `nexusConfig.ts`, где определите состояния и экшены:

```typescript
Копировать код
import { PopupState, createAction } from '<название_вашей_библиотеки>';

export const initialStates = {
  popupState: {} as PopupState,
  // другие состояния...
};

export const actions = {
  POPUP_OPEN: createAction((state, action) => ({
    ...state,
    popupState: { ...action.payload, popupVisible: true },
  })),
  POPUP_CLOSE: createAction((state) => ({
    ...state,
    popupState: { popupVisible: false },
  })),
};
```

## 2. Использование `NexusProvider` в корневом компоненте

Оберните ваше приложение в `NexusProvider`, передавая начальные состояния и экшены:

```typescript
Копировать код
import { NexusProvider } from '<название_вашей_библиотеки>';
import { initialStates, actions } from './nexusConfig';

const App = () => (
  <NexusProvider initialStates={initialStates} actions={actions}>
    <YourComponent />
  </NexusProvider>
);
```

## 3. Доступ к состояниям с помощью `useNexus`

Для получения значения состояния используйте `useNexus`:

```typescript
Копировать код
import { useNexus } from '<название_вашей_библиотеки>';

const YourComponent = () => {
  const popupState = useNexus('popupState');

  return popupState.popupVisible ? <Popup /> : null;
};
```

## 4. Вызов экшенов с помощью `nexusDispatch`

Для изменения состояния воспользуйтесь `nexusDispatch`:

```typescript
Копировать код
import { nexusDispatch } from '<название_вашей_библиотеки>';

const openPopup = () => {
  nexusDispatch({
    type: 'POPUP_OPEN',
    payload: { dialogEmersion: 'show' },
  });
};

const closePopup = () => nexusDispatch({ type: 'POPUP_CLOSE' });
```

## 5. Использование `useSelector` для вычисленных значений

Если вам нужно вычислить данные из состояния, используйте `useSelector`:

```typescript
Копировать код
import { useSelector } from '<название_вашей_библиотеки>';

const YourComponent = () => {
  const dialogEmersion = useSelector(state => state.popupState.dialogEmersion);

  return <div className={dialogEmersion}>Content</div>;
};
```

# API

- `NexusProvider`: провайдер для оборачивания приложения.
- `useNexus`: хук для получения состояния по ключу.
- `useSelector`: хук для выборки вычисленных значений.
- `nexusDispatch`: функция для вызова экшенов.
- `createAction`: утилита для создания экшенов.

```typescript
Копировать код
import { useNexus, nexusDispatch } from '<название_вашей_библиотеки>';

const PopupComponent = () => {
  const popupState = useNexus('popupState');
  const closePopup = () => nexusDispatch({ type: 'POPUP_CLOSE' });

  return (
    popupState.popupVisible && (
      <div>
        <h2>Popup Content</h2>
        <button onClick={closePopup}>Close</button>
      </div>
    )
  );
};
```

## Заключение

Эта библиотека предназначена для простого и эффективного управления состоянием в React, минимизируя количество перерендеров и поддерживая строгую типизацию.

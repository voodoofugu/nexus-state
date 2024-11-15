# nexus-state ✨

Лёгкая и гибкая библиотека для управления состоянием в React-приложениях с поддержкой строгой типизации TypeScript. С `nexus-state `удобно строить сложные структуры состояния с минимальными перерендерингами. Для полного раскрытия возможностей автозаполнения типов рекомендуется использовать TypeScript, но `nexus-state` работает и с JavaScript.

Эта библиотека появилась случайно. Я не планировал использовать готовые state-менеджеры и просто обновлял состояния на основе flux-архитектуры. Со временем захотелось выделить управление состояниями в отдельный компонент, что и привело к созданию библиотеки.

Название "Nexus" пришло ко мне из игры "Demon's Souls", где "Nexus" является убежищем для игрока и отправной точкой. Так и при использовании `nexus-state` я хотел что бы пользователь ощущал связь в любой момент с местом вроде "Nexus" или костром из игры "Dark Souls" откуда можно попасть куда угодно что бы продолжить приключение.
🔥🗡️

## Установка

Вы можете установить библиотеку, выполнив команду:

```bash
npm install nexus-state
```

---

# Начало работы

## 1. Определение initialStates, actions и использование createAction

Создайте файл с именем например `nexusConfig`, где определите `initialStates` и `actions`, для определения `actions` есть вспомогательная функция `createAction`:

```javascript
import { createAction } from "nexus-state";

export const initialStates = {
  strength: 10,
  secretPower: 5,
  // другие states...
};

export const actions = {
  LEVEL_UP: createAction((state, action) => ({
    ...state,
    strength: state.strength + action.payload,
  })),
  // другие actions...
};
```

Не забывайте что вы можете выносить код из `actions` в отдельные переменные и ханить где вам удобно:

```javascript
import { createAction } from "nexus-state";

const LEVEL_UP = createAction((state, action) => ({
  ...state,
  strength: state.strength + action.payload,
}));

export const actions = {
  LEVEL_UP,
  // другие actions...
};
```

Для `typescript` советую вам расширить глобальные типы `StatesT` и `ActionsT` поставляемые библиотекой и самый короткий способ будет сделать это через `typeof`

🔮 _Не забудьте правильно настроить `tsconfig`_

```typescript
type InitialStatesT = typeof initialStates;
type InitialActionsT = typeof actions;

declare global {
  interface StatesT extends InitialStatesT {}
  interface ActionsT extends InitialActionsT {}
}
```

🔮 _Если вы используете `eslint`он выдаст вам ошибку о том что объект в типах пуст`@typescript-eslint/no-empty-object-type`, но это легко исправить_

Вот способы по избежанию ошибки `@typescript-eslint/no-empty-object-type`:

### 1. Добавить правило в eslint

```typescript
rules: {
      "@typescript-eslint/no-empty-object-type": "off",
}
```

### 2. Оставить основной вариант и просто передать дополнительный states и actions

```typescript
type InitialStatesT = typeof initialStates;
type InitialActionsT = typeof actions;

declare global {
  interface StatesT extends InitialStatesT {
    anyState: string;
  }
  interface ActionsT extends InitialActionsT {
    ANY_ACTION: string;
  }
}
```

### 3. Передать все типы и actions если их немного напрямую

```javascript
declare global {
  interface StatesT {
    strength: number;
    secretPower: number;
  }
  interface ActionsT {
    LEVEL_UP: string;
  }
}
```

### 4. Просто игнорировать 🙌

---

## 2. Использование `NexusProvider` в корневом компоненте

Оберните ваше приложение в `NexusProvider`, передавая `initialStates` и `actions`:

```javascript
import { NexusProvider } from "nexus-state;
import { initialStates, actions } from "./nexusConfig";

const App = () => (
  <NexusProvider initialStates={initialStates} actions={actions}>
    <YourComponent />
  </NexusProvider>
);
```

---

## 3. Доступ к состояниям с помощью useNexus

Для получения значения состояния используйте `useNexus`:

```javascript
import { useNexus } from "nexus-state";

const YourComponent = () => {
  const strength = useNexus("strength");

  return <p>`🧙‍♂️ Your strength is ${strength}`</p>;
};
```

---

## 4. Использование useSelector для вычисленных значений

Если вам нужно вычислить данные из состояния, используйте `useSelector`:

```typescript
import { useSelector } from "nexus-state;

const YourComponent = () => {
  const fullPower = useSelector(
    (state) => state.strength + state.secretPower
  );

  return <p>`🧙‍♂️ Your full power is ${fullPower}`</p>;
};
```

---

## 5. Вызов actions с помощью nexusDispatch

Для изменения состояния воспользуйтесь `nexusDispatch`:

```typescript
import { nexusDispatch } from "nexus-state;

const levelUp = () => {
  nexusDispatch({
    type: "LEVEL_UP",
    payload: 5,
  });
};

const YourButton= () => {
  return <button onClick={levelUp}>`🧙‍♂️ Raise the level`</button>;
};
```

🔮 _Так же если вы правильно настроили глобальные типы, то в `useNexus`, `useSelector`и`nexusDispatch`в поле`type` будет выведение типов_

---

# API

- `NexusProvider`: провайдер для оборачивания приложения.
- `useNexus`: хук для получения state по ключу.
- `useSelector`: хук для выборки вычисленных значений.
- `nexusDispatch`: функция для вызова actions.
- `createAction`: утилита для создания actions.

---

## Заключение

Надеюсь, использование `nexus-state` сделает разработку вашего приложения приятной и продуктивной! ✨

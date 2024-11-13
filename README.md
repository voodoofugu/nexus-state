# nexus-state ✨

Это лёгкая и гибкая библиотека для управления состоянием в React-приложениях основанная на React Hooks с поддержкой строгой типизации. Подходит для построения сложных структур состояния с минимальным количеством перерендеров. Вы можете использовать `nexus-state` на js, но что бы раскрыть всю мощь удобства автоматического заполнения типов при использовании я рекомендую использовать ts.

Эта библиотека появилась на свет как это бывает путём стечения обстоятельств. В своём проекте я не хотел использовать какой либо state-manager, а просто обновлял состояния когда мне это было нужно основываясь на flux архитектуре. Но в какой-то момент я увлёкся и решил что было бы круто изолировать часть кода отвечающую за обновление состояний, так я начал переписывать код, что в конечном итоге вылилось в отдельную библиотеку.

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

Вы можете создать файл с именем например `nexusConfig`, где вы определите `initialStates` и `actions`, так же для определения `actions` есть вспомогательная функция `createAction`:

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

  return <p>`🧙‍♂️ Your hero's strength is ${strength}`</p>;
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

  return <p>`🧙‍♂️ Your hero's true powers have awakened and are equal to ${fullPower}, use them wisely`</p>;
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
- `useNexus`: хук для получения `state` по ключу.
- `useSelector`: хук для выборки вычисленных значений.
- `nexusDispatch`: функция для вызова `actions`.
- `createAction`: утилита для создания `actions`.

---

## Заключение

Надеюсь описание было понятным не скучным, а использование `nexus-state` будет весёлым! ✨

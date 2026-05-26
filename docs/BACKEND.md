# Правила — бек

Дополнение к [PRINCIPLES.md](./PRINCIPLES.md). Только специфичное для серверной части.

## Стек

**Firebase** (Firestore + Firebase Auth).

- Хостинг фронта: Vercel
- БД: Firestore (NoSQL документы)
- Auth: Firebase Auth (Google OAuth + Anonymous)
- API: Firebase SDK напрямую с фронта (`firebase/auth`, `firebase/firestore`)
- Безопасность: Firestore Security Rules
- Миграций нет — Firestore бессхемен; структура документов задаётся кодом в [queries.ts](../frontend/src/lib/queries.ts)

**Своего бекенд-сервиса нет.**

## Структура Firestore

```
users/{uid}                        → { currentWorkoutId: string | null }
users/{uid}/exercises/{id}         → Exercise (name, muscleGroup, exerciseType, isCustom, description)
users/{uid}/workouts/{id}          → Workout (name, date, isArchived, isTrial, exerciseIds: string[])
users/{uid}/sessions/{id}          → Session (workoutId, workoutName, exerciseCount, nextWorkoutId,
                                              nextWorkoutDate, finishedAt, exercises: embedded[])
```

- `workouts` хранят `exerciseIds: string[]` — join делается на клиенте при гидратации
- `sessions.exercises` — embedded snapshot на момент завершения (имена/группы не меняются с историей)
- Новый пользователь (нет документа `users/{uid}`) — `fetchHydration` сидирует seed-данные через `writeBatch`

## Контракт с фронтом

Эталон domain-моделей — [src/types/index.ts](../frontend/src/types/index.ts). Маппинг в [queries.ts](../frontend/src/lib/queries.ts).

## Mapping reducer-actions → Firestore-операции

Полный mapping вынесен в [TDR.md](./TDR.md). Дублировать не будем — единая точка правды.

## Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Применяются в Firebase Console → Firestore → Rules.

## Правила работы с Firebase

### 1. Никогда не hardcode-ить credentials
Только переменные `VITE_FIREBASE_*` из `.env.local`. Конфиг публичный (apiKey в Firebase — не секрет, доступ контролируется Rules), но хранить в `.gitignore`-файлах — правильная привычка.

### 2. Security Rules — обязательны
Без правил Firestore открыт всем. Шаблон выше — минимум. Всегда проверять после добавления новой коллекции.

### 3. Don't trust the client
Rules защищают доступ к документам. Бизнес-ограничения («только свои данные») — в Rules. Сложная логика (если появится) — Firebase Functions (но это Blaze-план).

### 4. Структура — subcollections на uid
Все данные пользователя живут под `users/{uid}/...`. Никаких глобальных коллекций без фильтрации по uid.

### 5. Что НЕ делать
- Не хранить `photoURL`/`displayName` в Firestore — они есть в Firebase Auth user object
- Не использовать `getDoc` в цикле (N+1) — всегда `getDocs` на коллекцию

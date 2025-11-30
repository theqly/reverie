# GraphQL Integration

## Что сделано

Интегрировал GraphQL API из `content-service` во Flutter приложение:

### 1. Зависимости
- `graphql_flutter: ^5.1.2` - GraphQL клиент
- `http: ^1.1.0` - HTTP клиент

### 2. Структура

```
lib/
├── config/
│   └── app_config.dart          # Конфигурация (GraphQL endpoint)
├── models/
│   └── pin.dart                 # Модели: Pin, PinImage, CommentToPin
├── services/
│   ├── graphql_service.dart     # GraphQL клиент и queries
│   └── pin_service.dart         # Сервис для работы с пинами
└── pages/
    ├── pins_page.dart           # Список пинов с загрузкой из API
    └── pin_view_page.dart       # Детальный просмотр пина
```

### 3. Реализованный функционал

**PinsPage:**
- Загрузка пинов пользователя через `pinsByUser(userId)` query
- Pull-to-refresh для обновления списка
- Превью изображений и информация о пинах
- Переход на детальную страницу при клике

**PinViewPage:**
- Отображение полной информации о пине
- Карусель фотографий с Navigation (стрелки + свайп)
- Загрузка статистики (количество реакций и комментариев)
- Адаптивный UI в зависимости от наличия данных

### 4. GraphQL Queries

Используются следующие запросы из `content-service`:

```graphql
# Получить пин по ID
pin(id: UUID!): Pin

# Получить пины пользователя
pinsByUser(userId: UUID!): [Pin!]

# Получить комментарии
commentsByPin(pinId: UUID!): [CommentToPin]!

# Получить количество реакций
countAllReactionsToPin(pinId: UUID!): Int!
```

## Настройка

### 1. Запустить backend

Убедитесь что `content-service` и Apollo Router запущены:

```bash
cd deploy
docker-compose up content-service apollo-router
```

### 2. Настроить endpoint

Отредактируйте `lib/config/app_config.dart`:

```dart
// Для локальной разработки на эмуляторе iOS
static const String graphqlEndpoint = 'http://localhost:4000/graphql';

// Для эмулятора Android
static const String graphqlEndpoint = 'http://10.0.2.2:4000/graphql';

// Для физического устройства в одной сети с backend
static const String graphqlEndpoint = 'http://192.168.1.100:4000/graphql';
```

### 3. Заменить mock userId

В `pins_page.dart` замените mock userId на реальный:

```dart
// TODO: Заменить на реальный userId из auth
final String mockUserId = '00000000-0000-0000-0000-000000000000';
```

## Тестирование

1. Создайте тестовые данные в БД через GraphQL Playground
2. Запустите приложение: `flutter run`
3. Перейдите на страницу Пинов (первая иконка в dock)
4. Проверьте загрузку списка пинов
5. Кликните на пин для просмотра деталей

## TODO

- [ ] Добавить авторизацию и получение реального userId
- [ ] Реализовать добавление реакций (лайки)
- [ ] Реализовать добавление комментариев
- [ ] Добавить кеширование запросов
- [ ] Обработка ошибок сети с retry механизмом
- [ ] Pagination для списка пинов
- [ ] Фильтрация по Рекомендациям/Подпискам

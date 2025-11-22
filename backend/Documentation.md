Микросервисы:
- Контент (Content) (первый приоритет)
- Профиль (Profile) (первый приоритет)
- Лента (Feed) (первый приоритет)
- Гео (Geo) (первый приоритет)
- Нотификации (Notification) (второй приоритет)
- Аналитика (Analytics) (заглушка)
- Оплата (Billing) (заглушка)

---
# Контент (Content)
#### Назначение
- CRUD операции для досок и пинов
- операции по добавлению/удалению пинов из досок
- CRUD операции для комментариев к пинам
- обработка жалоб на доски/пины
- проставление реакций на доски/пины
- некоторая модерация контента
- CRUD операции с Bookmarks пользователя

#### БД
```
CREATE TABLE access_levels (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE owner_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    access_level_id INTEGER NOT NULL,
    owner_id UUID NOT NULL,
    owner_type_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_level_id) REFERENCES access_levels(id),
    FOREIGN KEY (owner_type_id) REFERENCES owner_types(id)
);

CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gis_id UUID,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    purpose_name VARCHAR(255),
    type VARCHAR(255)
);

CREATE TABLE pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    place_id UUID,
    FOREIGN KEY (place_id) REFERENCES places(id)
);

CREATE TABLE board_pins (
    board_id UUID NOT NULL,
    pin_id UUID NOT NULL,
    PRIMARY KEY (board_id, pin_id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE pin_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    pin_id UUID NOT NULL,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE pin_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE board_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TYPE complaint_object_type AS ENUM ('pin', 'board', 'user');

CREATE TABLE complaint_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE complaint_statuses (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_object_type complaint_object_type NOT NULL,
    complaint_object_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    complaint_type INTEGER NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER NOT NULL,
    FOREIGN KEY (complaint_type) REFERENCES complaint_types(id) ON DELETE CASCADE,
    FOREIGN KEY (status) REFERENCES complaint_statuses(id) ON DELETE CASCADE
);

CREATE TABLE reaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE reaction_pins (
    reaction_id UUID NOT NULL,
    pin_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    PRIMARY KEY (reaction_id, pin_id, owner_id),
    FOREIGN KEY (reaction_id) REFERENCES reaction(id) ON DELETE CASCADE,
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE reaction_boards (
    reaction_id UUID NOT NULL,
    board_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    PRIMARY KEY (reaction_id, board_id, owner_id),
    FOREIGN KEY (reaction_id) REFERENCES reaction(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks_pins (
    user_id UUID NOT NULL,
    pin_id UUID NOT NULL,
    PRIMARY KEY (user_id, pin_id),
    FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks_boards (
    user_id UUID NOT NULL,
    board_id UUID NOT NULL,
    PRIMARY KEY (user_id, board_id),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE members (
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TYPE request_status AS ENUM ('waited', 'rejected', 'accepted', 'cancelled');

CREATE TABLE join_group_requests (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    status request_status NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

INSERT INTO access_levels (type) VALUES
    ('private'),
    ('public'),
    ('group'),
    ('group_public');

INSERT INTO owner_types (type) VALUES
    ('user'),
    ('group');

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_group_id ON members(group_id);


CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_boards_name ON boards(name);
CREATE INDEX idx_boards_owner_created_at ON boards(owner_id, created_at DESC);

CREATE INDEX idx_pins_owner_id ON pins(owner_id);
CREATE INDEX idx_pins_name ON pins(name);

CREATE INDEX idx_board_pins_pin_id ON board_pins(pin_id);
CREATE INDEX idx_pin_images_pin_id ON pin_images(pin_id);
```


Права доступа:
- приватный (только сами смотрим и редактируем)
- публичный (смотрят все, но редактируем только мы, остальные могут себе скопировать и тогда уже редактировать копию свою)
- групповой (смотрят и редактируют те, кто находят в группе)
- групповой публичный (смотрят все, но редактировать могут только те, кто находится в группе)
#### Взаимодействие с другими микросервисами
- user_id и group_id исходят из бд микросервиса Профиль. Поэтому нужно обеспечивать согласованность данных
- проверка прав доступа на редактирование доски
		При редактировании доски, находящейся в групповом доступе, должна быть выполнена проверка наличия прав на редактирование. На API Gateway приходит запрос такой-то пользователь хочет так-то изменить такую-то доску. Затем запрос перенаправляется микросервису Контент. Следующим шагом проверяется уровень доступа доски. Если доска личная, достаточно сверить id владельца и id пользователя, который хочет отредактировать. Но если доска в групповом доступе, нужно обратиться к микросервису Профиль, отправив id группы и id пользователя, который хочет отредактировать доску, и узнать содержится ли пользователь в этой группе. Если да, то делаем update, если нет, возвращаем ошибку: отсутствие прав доступа.
- получение списка групп пользователя
		При получении списка досок пользователя необходимо также учитывать групповые доски. На API Gateway приходит запрос такой-то пользователь хочет получить все доски, которые он может редактировать. Один запрос перенаправляется микросервису Контент - получить список досок, где пользователь владелец. Параллельно с этим в микросервис Профиль идет запрос - получить список групп, в которых состоит пользователь. Когда получаем ответ от Профиль, направляем запрос в Контент - получить список всех досок для списка groupId. Полученные два ответа от микросервиса Контент объединяем и отправляем пользователю.

Остальные методы (без пометки см взаимодействие с другими микросервисами) работают примитивно: запрос на API Gateway, запрос к микросервису Контент, ответ от микросервиса Контент, возврат ответа.

#### Методы
##### input/output objects

enum AccessLevelType {
  private
  public
  group
  group_public
}

enum OwnerType {
  user
  group
}

type Board {
  id: UUID!
  name: String!
  accessLevel: AccessLevelType!
  ownerId: UUID!
  ownerType: OwnerType!
  createdAt: Time!
  pins: [Pin!]
}

type CommentToBoard {
  id: UUID!
  boardId: UUID!
  message: String!
  createdAt: Time!
  owner: User!
}

type Group {
  id: UUID!
  members: [User!]! @external
}

input CreateBoardInput {
  name: String!
  accessLevel: AccessLevelType!
  ownerId: UUID!
  ownerType: OwnerType!
}

input UpdateBoardInput {
  name: String
  accessLevel: AccessLevelType
  userId: UUID!
}

input CreatePinInput {
  name: String!
  ownerId: UUID!
  latitude: Float!
  longitude: Float!
  description: String
}

input UpdatePinInput {
  name: String
  latitude: Float
  longitude: Float
  description: String
  rating: Float
  userId: UUID!
}

input AddCommentToPinInput {
  pinId: UUID!
  userId: UUID!
  message: String!
}

input AddCommentToBoardInput {
  boardId: UUID!
  userId: UUID!
  message: String!
}

input AddImageInput {
  pinId: UUID!
  imageUrl: String!
  orderNumber: Int!
}

input CreateGroupInput {
  members: [UUID!]!
}

type User @key(fields: "id") {
  id: UUID! @external
}

##### Реализованные методы
  board(id: UUID!): Board
  boardByName(name: String!): [Board!]
  boardsByGroup(groupId: UUID!): [Board!]

  pin(id: UUID!): Pin
  pinsByUser(userId: UUID!): [Pin!]
  pinsByName(name: String!): [Pin!]
  pinsByLocation(query: String!): [Pin!]

  groupById(groupId: UUID!): Group
  isUserInGroup(userId: UUID!, groupId: UUID!): Boolean!
  groupsOfUser(userId: UUID!): [Group!]!

  commentsByBoard(boardId: UUID!): [CommentToBoard]!
  commentsByPin(pinId: UUID!): [CommentToPin]!

  createBoard(input: CreateBoardInput!): Board!
  updateBoard(id: UUID!, input: UpdateBoardInput!): Board!

  createPin(input: CreatePinInput!): Pin!
  updatePin(id: UUID!, input: UpdatePinInput!): Pin!

  addPinToBoard(pinId: UUID!, boardId: UUID!): Board!
  removePinFromBoard(pinId: UUID!, boardId: UUID!): Board!

  addImageToPin(input: AddImageInput!): PinImage!
  removeImageFromPin(imageId: UUID!): Boolean!
  updateImageOrder(imageId: UUID!, newOrder: Int!): PinImage!

  addCommentToPin(input: AddCommentToPinInput!): CommentToPin!
  updateCommentToPin(id: UUID!, message: String!): CommentToPin!
  deleteCommentToPin(id: UUID!): Boolean!

  addCommentToBoard(input: AddCommentToBoardInput!): CommentToBoard!
  updateCommentToBoard(id: UUID!, message: String!): CommentToBoard!
  deleteCommentToBoard(id: UUID!): Boolean!

  createGroup(input: CreateGroupInput!): Group!
  addUserToGroup(userId: UUID!, groupId: UUID!): Boolean!
  removeUserFromGroup(userId: UUID!, groupId: UUID!): Boolean!
  deleteGroup(groupId: UUID!): Boolean!
  requestJoinGroup(groupId: UUID!, userId: UUID!): Boolean!
  acceptJoinToGroup(requestId: UUID!): Boolean!

##### Необходимо реализовать:
- boardsByUser(userId: UUID!): [Board!] (вернуть список всех досок, где пользователь владелец)
- groupBoardsByUser(groupIds: [UUID!]!): [Board!] (вернуть доски, где пользователь в группе состоит (получаем от Профиля список групп пользователя и ищем по ним) (см взаимодействие с другими микросервисами))
- boardToBookmarks(boardId: UUID!, userId: UUID!): Boolean!
- pinToBookmarks(pinId: UUID!, userId: UUID!): Boolean!
- removeBoardFromBookmarks(boardId: UUID!, userId: UUID!): Boolean!
- removePinFromBookmarks(pinId: UUID!, userId: UUID!): Boolean!
- copyPin(pinId: UUID!, userId: UUID!, boardId: UUID!): Pin! (возвращаем id нового пина, возможно хватит возвращать UUID!)
- copyBoard(boardId: UUID!, userId: UUID!): Board! (возвращаем id новой доски, возможно хватит возвращать UUID!)
- reactions(): [Reaction!]!
- addReactionToPin(pinId: UUID!, reactionId: UUID!, userId: UUID!): Boolean!
- removeReactionToPin(pinId: UUID!, reactionId: UUID!, userId: UUID!): Boolean! (проверка, что удаляет владелец)
- addReactionToBoard(boardId: UUID!, reactionId: UUID!), userId: UUID!: Boolean!
- removeReactionToBoard(boardId: UUID!, reactionId: UUID!, userId: UUID!): Boolean! (проверка, что удаляет владелец)
- complaintStatuses(): [complaintStatuses!]!
- complaintTypes(): [complaintTypes!]!
- complainAboutUser(creatorId: UUID!, userId: UUID!, complaint: ComplaintInput): Boolean! (если тип жалобы другое, то комментарий обязателен)
- complainAboutPin(creatorId: UUID!, pinId: UUID!, complaint: ComplaintInput): Boolean! (если тип жалобы другое, то комментарий обязателен)
- complainAboutBoard(creatorId: UUID!, boardId: UUID!, complaint: ComplaintInput): Boolean! (если тип жалобы другое, то комментарий обязателен)
- requestJoinGroup(groupId: UUID!, userId: UUID!): Boolean!
- acceptJoinToGroup(requestId: UUID!): Boolean! (тут же нужно изменить статус заявки) (может нужно отправлять какой пользователь разрешает доступ?)
(сейчас есть только конечные методы редактирования состава группы, нужно добавить промежуточный этап в виде бросания приглашения, а только после подтверждения добавлять нового пользователя)
- getSettingsStatuses: [SettingsStatuses!]!
- changeAccessBookmarks(userId: UUID!, newStatus: UUID!): Boolean!

(Я прописала не все геттеры и соответствующие им объекты, нужно будет самостоятельно проследить при реализации)

Следующие методы под вопросом (пока без них), потому что это не для пользователей, а для админов
- banPin(id: UUID!): Boolean! (не удаляем, а помечаем скрытым, чтобы больше нигде не отображался контент)
- banBoard(id: UUID!): Boolean! (не удаляем, а помечаем скрытым, чтобы больше нигде не отображался контент)
- unbanPin(id: UUID!): Boolean!
- unbanBoard(id: UUID!): Boolean!

---
# Профиль
#### Назначение
- CRUD операции для пользователей
- подписка на кого-то и отписка (followers)
- управление настройками пользователя

#### БД
```sql
CREATE TYPE user_status AS ENUM ('active', 'deleted');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(255) NOT NULL,
    nick_tag VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    description TEXT,
    user_rating FLOAT DEFAULT 0.0,
    status user_status NOT NULL DEFAULT 'active'
);

CREATE TABLE followers (
    user_id UUID NOT NULL,
    follower_id UUID NOT NULL,
    PRIMARY KEY (user_id, follower_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE settings_statuses (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE settings (
    user_id UUID NOT NULL,
    bookmarks_status_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookmarks_status_id) REFERENCES settings_statuses(id) ON DELETE CASCADE
);

INSERT INTO settings_statuses (type) VALUES
    ('private'),
    ('public');

CREATE UNIQUE INDEX idx_users_nickname ON users(nickname);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_nick_tag ON users(nick_tag);

CREATE INDEX idx_followers_user_id ON followers(user_id);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);

```
#### Взаимодействие с другими микросервисами
- связь с Keycloak будет (требует дополнительного изучения)
- только другим отвечает (смотреть другие микросервисы)

#### Методы

##### input/output objects
```graphql
enum UserStatus {
  active
  deleted
}

type User {
  id: UUID!
  nickname: String!
  email: String!
  nick_tag: String!
  profilePicture: String
  description: String
  status: UserStatus!
  userRating: Float!
  followers: [User!]!
  following: [User!]!
}

type SettingsStatuses {
  id: UUID!
  type: String!
  description: String
}

input CreateUserInput {
  nickname: String!
  email: String!
  nick_tag: String!
  profilePicture: String
  description: String
}

input UpdateUserInput {
  nickname: String
  email: String
  nick_tag: String!
  profilePicture: String
  description: String
}

```
##### Реализованные методы
```graphql
- userById(userId: UUID!): User
- userByNickname(nickname: String!): User
- userByEmail(email: String!): User

- followersOf(userId: UUID!): [User!]!
- followingOf(userId: UUID!): [User!]!

- createUser(input: CreateUserInput!): User!
- updateUser(userId: UUID!, input: UpdateUserInput!): User!
- deleteUser(userId: UUID!): Boolean

- followUser(userId: UUID!, followerId: ID!): Boolean!
- unfollowUser(userId: UUID!, followerId: ID!): Boolean!
```

##### Необходимо реализовать:
```graphql
- followersCount(userId: UUID!): Integer!
- followingCount(userId: UUID!): Integer!
```
(в профиле пользователя явно нужно будет выводить на превью не список всех, на кого подписан юзер и кто подписан на него, а просто количество, поэтому нужно добавить отдельные методы ля этого)
```graphql
- getSettingsStatuses: [SettingsStatuses!]!
- changeAccessBookmarks(userId: UUID!, newStatus: UUID!): Boolean!
```
(Я прописала не все геттеры и соответствующие им объекты, нужно будет самостоятельно проследить при реализации)

Позже еще:
- санкции для пользователя
		если на пользователя прилетела жалоба и ее проверили и подтвердили, нужно пользователю выдвигать санкции (например нельзя публичные карты создавать какое-то время и тп), тогда нужно добавить проверку на права пользователя

---
# Keycloak

Отвечает за авторизацию пользователей (тут login, logout, changePassword и тп)


---
# Лента (Feed)
#### Назначение
- формирование ленты для пользователя по разным критериям (поиск подходящего контента и его приоритезация)
- поиск по запросу (+ с учетом геопозиции, пользователя и тд)

#### БД
```
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tagged_pins (
    pin_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (pin_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_tagged_pins_pin_id ON tagged_pins(pin_id);
CREATE INDEX idx_tagged_pins_tag_id ON tagged_pins(tag_id);
```

#### Взаимодействие с другими микросервисами
- пока нет ничего, но pin_id в другой бд - Контент


#### Что добавить
- лента на основе тегов
		самый простой вид ленты, который мы придумали в прошлом семе, это на основе тегов. Условно пользователь указывает у себя в профиле, что он хочет смотреть на кофейни, потом доски/пины, у которых есть такой тег, будут попадаться в ленте. Эти же теги можно использовать для поиска. Крч метаинформация, чтобы пока проще жилось
- лента с новыми картами тех, на кого подписан
		в помощь дата создания пина и в принципе микрач контента, а подписки это к микрачу профиля
- рекомендательный сервис
		когда то попозже, нужно не просто выдавать список подборок или пинов, но и делать это персонализировано
- поиск по картам/местам/авторам.
		контентные запросы есть в микраче контента, тут скорее еще нужно по-умному их сортировать (сюда же относится то, что проплаченные места и доски должны быть в начале) (PS: или выносим поиск в отдельный микрач, хотя теперь выглядит излишним)
-


#### Методы
  feed: [Pin!]!




---
# Geo
#### Назначение
- взаимодействие с внешним API карт
- формирование карт
- поиск/сортировка/тп по адресу/названию

#### БД
В бд нет смысла, этот микросервис является не хранилкой, а прослойкой, чтобы все остальные микросервисы не были жестко привязаны к определенному gis service.
#### Взаимодействие с другими микросервисами
Микрач Geo не включен в общую схему GraphQL, так как он нужен как вспомогательный для других микровервисов (от приложения не будет обращения к нему). Для связи с другими микросервисами используется gRPC. В каждом микраче, где нужна связь с Geo, необходимо прописать клиента.

- получать гео точки нужно с пинов - Контент

#### Методы
##### input/output objects

message GeocodeRequest {
  string address = 1;
}

message GeocodeResponse {
  string place_id = 1;
  double lat = 2;
  double lon = 3;
  string display_name = 4;
  Address address = 5;
}

message Address {
  string country = 1;
  string city = 2;
  string street = 3;
  string house_number = 4;
  string postcode = 5;
}

message ReverseGeocodeRequest {
  double lat = 1;
  double lon = 2;
}

message ReverseGeocodeResponse {
  string place_id = 1;
  double lat = 2;
  double lon = 3;
  string display_name = 4;
  Address address = 5;
}


##### Необходимо реализовать:
- Geocode(GeocodeRequest) returns (GeocodeResponse);
- ReverseGeocode(ReverseGeocodeRequest) returns (ReverseGeocodeResponse);
#### Что добавить
- objectByPoint(point: Point!): [Object] (когда пользователь ставит точку, мы должны предложить ряд place для выбора (+ опция другое), которые нам известны, это поможет при поиске, если к пину будет закреплено конкретное место с gis service)
- objectByQuery(query: String!): [Object] (у 2 гис вообще без разницы, что в запрос кидать, это все будет строка по параметру q: это может быть адрес, а может быть описание места)
- objectById(id: ID!): Object
- UrlByObject(obj: Object!) (чтобы пользователя пересылать на сайт gis service и сразу там выделить нужный объект)
- UrlById(id: ID!) (чтобы пользователя пересылать на сайт gis service и сразу там выделить нужный объект)
- шаринг карты в сторонние сервисы (социальные сети)
		нужно делать карту красивую, чтобы ей потом делиться
- шаринг маршрута в gis-сервисы
		шаринг подборки в gis-сервисы (чтобы построить например там маршрут) (PS: нужно смотреть, что позволяет API для этого, и в какой форме вообще можно реализовать такую функцию)

#### Под вопросом из функционала (не оч понятно, а от этого будет зависеть, что нужно добавить и где):
18. Шаринг построенного маршрута в gis-сервисы или шаринг мест для построние маршрута (рисерч + разработка). (в 2гис в веб версии я не вижу подборки, можно списки создавать, но это в аккаунте личном, мы не сможем сами генерить такие списки и давать ссылку пользователю)

---
# Нотификация
#### [Документация событий Notification Service](./notification-service/event-documentation.md)

#### Назначение
- приглашение для вступления в группу
- нотификации о публикациях (на кого подписан или апдейты в досках групповых)
- нотификация, если кто-то подписался на вас
- нотификация, если внутри сервиса поделились доской/пином
- нотификация о комментариях/реакциях
- нотификация для жалоб
- настройка нотификаций (чтобы выбрать о чем оповещать и как)


#### Взаимодействие с другими микросервисами
- отправка приглашений и прочего будет использовать инфу о юзерах - Профиль, инфу о комментариях/реакциях и тп - Контент


#### Что добавить
- приглашение для вступления в группу
		когда шарят доступ на редактирование к доске, сначала должно прилететь приглашение, а только после подтверждения добавить в группу
- нотификации о публикациях
		если у людей, на кого подписан, вышли новые публичные доски, можно уведомлять периодически
- нотификация, если кто-то подписался на вас
		тут очевидно
- нотификация, если внутри сервиса поделились доской/пином
		внутри сервиса можно шарить карты, допустим ваш друг сделал у себя публичную доску и подумал, что вам будет интересно или хочет попросить совета, он может отправить ссылочку вам, чтобы вы сразу посмотрели на конкретную подборку
- нотификация о комментариях/реакциях
		если кто-то лайкнул или прокомментировал ваш пин/доску
- нотификация, если жалоба подтвердилась
		если кто-то отправил жалобу на контент или пользователя, она будет проверяться как-то, а при подтверждении контент удаляется (точнее), а для пользователя могут быть какие-то санкции
- оспаривание
		если пользователь не согласен с решением по бану его контента или его самого, он может отправить заявку на пересмотрение решения
- настройка нотификаций
		понятное дело, что не все уведомления хочется получать (если я популярный креатор, зачем мне уведомления о каждой реакции и подписки, я лучше посмотрю статистику за неделю), нужно сделать возможность отключить уведомления, тут же нужно продумать, а какие по дефолту должны быть включены, а какие нет (чтобы не выбесить пользователя на старте, что очень важно)


#### Методы





---
# Оплата (заглушка)
#### Назначение
- биллинг
- проплаченные места (чтобы в начале ленты попадались)




---
# Аналитика (заглушка)
#### Назначение
- о количестве подписок/отписок
- об успехе контента (просмотры, реакции, комментарии)

# Документация эвентов нотификаций

### Общие принципы

Каждое событие, отправляемое в Kafka, имеет общую структуру:

```json
{
  "event_id": "UUID",
  "event_type": "string",
  "occurred_at": "timestamp",
  "data": {}
}
```

### 1. Нотификация: приглашение для вступления в группу

0) Когда отправляется:
Отправляется, когда пользователь приглашает другого пользователя вступить в группу.

Группы относятся к микросервису Контент и всегда принадлежат одной подборке (collection).

1) topic_name:

notifications.group.invites


2) event_type:

group.invitation.sent


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "group.invitation.sent",
  "occurred_at": "2025-11-03T15:30:00Z",
  "data": {
    "inviter_id": "UUID",
    "invitee_id": "UUID",
    "group_id": "UUID",
  }
}
```
### 2. Нотификация о новой публикации

0) Когда отправляется:
Отправляется, когда пользователь создаёт пин или доску.
Notification должен уведомить всех фолловеров автора или участников группы, если публикация размещена внутри группы.

1) topic_name:

notifications.publications


2) event_type:

content.publication.created


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "content.publication.created",
  "occurred_at": "2025-11-03T15:32:00Z",
  "data": {
    "content_type": "pin|board",
    "author_id": "UUID|null", // нужно добавить валидацию на бэке
    "author_name": "string|null", // поля не пустые либо (author_id && author_name) либо (group_id)
    "group_id": "UUID|null",
    "content_id": "UUID",
    "content_name": "string",
  }
}
```
### 3. Нотификация: кто-то подписался на вас

0) Когда отправляется:
Отправляется сервисом Profile при добавлении записи в followers.

1) topic_name:

notifications.followers


2) event_type:

user.followed


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "user.followed",
  "occurred_at": "2025-11-03T15:33:00Z",
  "data": {
    "user_id": "UUID",       // на кого подписались
    "follower_id": "UUID",   // кто подписался
    "follower_name": "string"
  }
}
```
### 4. Нотификация: поделились доской или пином

0) Когда отправляется:
Отправляется, когда пользователь делится доской или пином с другим пользователем.

1) topic_name:

notifications.shares


2) event_type:

content.shared


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "content.shared",
  "occurred_at": "2025-11-03T15:35:00Z",
  "data": {
    "sender_id": "UUID",
    "receiver_id": "UUID",
    "content_type": "pin|board",
    "content_id": "UUID",
    "content_name": "string",
    "message": "string|null"
  }
}
```
### 5. Нотификация: новый комментарий

0) Когда отправляется:
Отправляется, когда появляется новый комментарий к пину или доске.

1) topic_name:

notifications.comments


2) event_type:

interaction.comment.created


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "interaction.comment.created",
  "occurred_at": "2025-11-03T15:37:00Z",
  "data": {
    "comment_id": "UUID",
    "for_type": "pin|board",
    "content_id": "UUID",
    "comment_author_id": "UUID",
    "comment_author_name": "string",
    "owner_id": "UUID",      // владелец контента
    "owner_type": "user|group",
    "message": "string"
  }
}
```
### 6. Нотификация: новая реакция

0) Когда отправляется:
Отправляется, когда пользователь ставит реакцию (лайк и т.п.) на пин или доску.

1) topic_name:

notifications.reactions


2) event_type:

interaction.reaction.added


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "interaction.reaction.added",
  "occurred_at": "2025-11-03T15:38:00Z",
  "data": {
    "reaction_id": "UUID",
    "reaction_type": "like|love|fire|etc",
    "object_type": "pin|board",
    "object_id": "UUID",
    "reactor_id": "UUID",
    "reactor_name": "string",
    "owner_id": "UUID",
    "owner_type": "user|group"
  }
}
```
### 7. Нотификация: жалоба

0) Когда отправляется:
Отправляется при создании жалобы на пин, доску или пользователя.

На данный момент отложено для будущей реализации.

1) topic_name:

notifications.complaints


2) event_type:

complaint.created


3) message_structure:
```json
{
  "event_id": "UUID",
  "event_type": "complaint.created",
  "occurred_at": "2025-11-03T15:40:00Z",
  "data": {
    "complaint_id": "UUID",
    "owner_id": "UUID",                 // кто подал жалобу
    "owner_type": "user|group",
    "complaint_object_type": "pin|board|user",
    "complaint_object_id": "UUID",
    "complaint_type": "string",
    "message": "string|null",
    "status": "waited|accepted|rejected"
  }
}
```
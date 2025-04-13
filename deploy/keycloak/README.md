для импорта realm в keycloak
укажите
```
  keycloak:
  ...
  volumes:
    ...
    - ./required:/opt/keycloak/data/export
    ...
```
и запустите

```
bash kc.sh export --dir=/opt/keycloak/data/export
```
для старта с заданным профилем 
```
  keycloak:
    command:
      - start-dev
      - --import-realm
    ...
    volumes:
      - ./keycloak/data:/opt/keycloak/data/import
```
по умолчанию задан админ пользователь
```json
{
    "username" : "admin",
    "credentials" : [ {
      "type" : "password"
    } ]
  }
```
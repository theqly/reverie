### привет пишу как собирать эту всю ерунду у себя локально

1. вам нужен .env файл с тестовыми переменными окружения для баз и т.д. поэтому когда будете собирать, нужно написать некому артему гаану и попросить этот файл, чтобы я его не заливал на гит

## УТОЧНЕНИЕ! если вы уже собирали проект и схемы graphql не менялись, то шаги 2 и 3 МОЖНО ПРОПУСТИТЬ

2. после этого нужно совместить схемы graphql в одну для каждого сервиса. для этого существует простой файлик unificate.sh в папочке apollo. делаем:

```
cd apollo/
```
```
bash unificate.sh
```

3. теперь нужно провернуть некие махинации с загрузкой конфига и схемы для router'а. для этого из папки deploy(или сами пути прописывайте) делаем:

билдим rover
```
docker build -t rover -f ./apollo/Dockerfile.rover ./apollo
```
и запускаем его на разочек
```
docker run --rm --name rover \
  -w /app \
  -e APOLLO_ELV2_LICENSE=accept \
  -e APOLLO_TELEMETRY_DISABLED=true \
  -v "$(pwd)/apollo":/etc/apollo:ro \
  -v rover_data:/config \
  rover \
  /bin/sh -c 'rover supergraph compose --config /etc/apollo/supergraph-config.yaml --output /config/schema.graphql --log=debug && echo "supergraph written" && cp /etc/apollo/router_config.yaml /config/ && echo "router_config written"'

```

4. теперь осталось поднять все контейнеры через docker compose. для этого, логично, у вас должен стоять на машине docker, если нужна помощь - ко мне в лсик. после этого пишем:

```
docker compose up --build 
```

(если хочется запустить без кучи логов и занятия докером одной из консолей, то добавляем аргументик -d после --build)

5. ждем 

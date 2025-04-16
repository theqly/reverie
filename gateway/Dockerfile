# Этап сборки
FROM gradle:8.13-jdk23 AS build
WORKDIR /app

# Копируем Gradle и зависимости заранее (для кэширования)
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle gradle
RUN gradle --no-daemon dependencies || exit 1

COPY . .

RUN gradle bootJar

FROM eclipse-temurin:23-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

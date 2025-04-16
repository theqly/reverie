plugins {
  java
  id("org.springframework.boot") version "3.4.4"
  id("io.spring.dependency-management") version "1.1.7"
}
val springCloudVersion by extra("2024.0.1")

group = "d.zhdanov.ccfit.nsu"
version = "0.0.1-SNAPSHOT"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(23)
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.projectlombok:lombok")
  implementation("org.springframework.boot:spring-boot-starter")
  implementation("org.springframework.cloud:spring-cloud-starter-gateway")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("io.projectreactor:reactor-test")
  
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
  
  compileOnly("org.projectlombok:lombok")
  
  annotationProcessor("org.projectlombok:lombok")
}

dependencyManagement {
  imports {
    mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}

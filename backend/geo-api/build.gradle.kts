plugins {
	kotlin("kapt") version "2.1.20"
	kotlin("jvm") version "2.1.20"
	kotlin("plugin.spring") version "2.1.20"
	id("org.springframework.boot") version "3.4.5"
	id("io.spring.dependency-management") version "1.1.7"
	id("com.netflix.dgs.codegen") version "7.0.3"
}
val netflixDgsVersion by extra("10.1.2")

group = "d.zhdanov"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(JavaVersion.VERSION_23.toString())
	}
}

repositories {
	mavenCentral()
}

dependencyManagement {
	imports {
		mavenBom("com.netflix.graphql.dgs:graphql-dgs-platform-dependencies:$netflixDgsVersion")
	}
}

dependencies {
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.mapstruct:mapstruct:1.6.3")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
	implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core")
	implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
	implementation("org.springframework.boot:spring-boot-starter-webflux")
	implementation("com.netflix.graphql.dgs:graphql-dgs-spring-graphql-starter")
	implementation("org.springframework.boot:spring-boot-starter-actuator")

	testImplementation("io.projectreactor:reactor-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test")
	testImplementation("org.springframework.graphql:spring-graphql-test")

	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

	kapt("org.mapstruct:mapstruct-processor:1.6.3")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

tasks.generateJava {
	schemaPaths.add("${projectDir}/src/main/resources/schema")
	packageName = "d.zhdanov.geoapi.codegen"
	generateClient = false

}

tasks.withType<Test> {
	useJUnitPlatform()
}

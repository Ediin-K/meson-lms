# ---- Build stage ----
# Compiles the jar in a full JDK + Maven image. This stage is thrown away after
# building, so it never bloats the final image with build tools or source code.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only the POM first so Docker can cache the downloaded dependency layer
# and skip re-downloading them on every rebuild when only source files change.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B -o clean package -DskipTests

# ---- Runtime stage ----
# A JRE (not JDK) is enough to run a built jar, and Alpine keeps the final
# image small — the app doesn't need a compiler or build tooling at runtime.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Uploaded files (assignment submissions, resources, profile photos) are written
# under app.upload.dir (default "uploads"), relative to the working directory.
# Mount a volume here in production, or uploads are lost whenever the container
# is recreated.
VOLUME /app/uploads

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

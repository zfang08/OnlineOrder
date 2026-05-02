FROM --platform=linux/amd64 eclipse-temurin:21-jre
# 这里强制使用amd64 x86， 都是用的是java 21

WORKDIR /app


COPY build/libs/OnlineOrder-0.0.1-SNAPSHOT.jar app.jar


ENTRYPOINT ["java", "-jar", "app.jar"]
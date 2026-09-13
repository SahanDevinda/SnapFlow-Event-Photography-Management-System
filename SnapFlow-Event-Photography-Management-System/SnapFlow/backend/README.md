# SnapFlow Backend

Spring Boot 3.2 REST API for the SnapFlow Event Photography Management System.

## Requirements

- Java 17+
- Maven 3.8+
- MySQL 8

## Setup

1. Create database and load sample data:

```bash
mysql -u root -p < ../database/snapflow.sql
```

2. Update `src/main/resources/application.properties` with your MySQL credentials.

3. Run:

```bash
mvn spring-boot:run
```

API base: http://localhost:8080/api

## Package structure

```
com.snapflow
├── config/       Security, Web
├── controller/   REST endpoints
├── dto/          Request & response DTOs
├── entity/       JPA entities
├── enums/        Status & role enums
├── exception/    Global exception handling
├── repository/   Spring Data JPA
├── security/     JWT filter & utilities
├── service/      Business logic
└── util/         Helpers
```

## Demo accounts

Password: `Password1!` for all roles (see main README).

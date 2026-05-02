# OnlineOrder

A full-stack food-ordering web application inspired by DoorDash. Customers can browse restaurants, view menus, add items to a shopping cart, and check out. The backend is a Spring Boot REST API backed by PostgreSQL; the frontend is a pre-built React single-page app served as static resources from the same Spring Boot process.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Project Layout](#project-layout)
4. [Domain Model](#domain-model)
5. [REST API](#rest-api)
6. [Authentication & Authorization](#authentication--authorization)
7. [Caching](#caching)
8. [Configuration](#configuration)
9. [Getting Started](#getting-started)
10. [Running the App](#running-the-app)
11. [Building the Docker Image](#building-the-docker-image)
12. [Testing](#testing)
13. [Seed Data](#seed-data)
14. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Language     | Java 21 (Eclipse Temurin)                                                  |
| Framework    | Spring Boot 3.5.9                                                          |
| Web          | `spring-boot-starter-web` (Spring MVC, embedded Tomcat)                    |
| Persistence  | `spring-boot-starter-data-jdbc` over PostgreSQL 15                         |
| Security     | `spring-boot-starter-security` with form login + `JdbcUserDetailsManager`  |
| Cache        | `spring-boot-starter-cache` + Caffeine 3.x                                 |
| Build        | Gradle (wrapper included)                                                  |
| Containerize | Docker + Docker Compose                                                    |
| Frontend     | Pre-built React bundle served from `src/main/resources/public/`            |
| Testing      | JUnit 5 (Jupiter), Mockito, `spring-boot-starter-test`                     |

---

## Architecture

The project follows a classic layered architecture:

```
┌──────────────────────────────────────────────────────────┐
│                React SPA (static bundle)                 │
│           src/main/resources/public/index.html           │
└────────────────────────┬─────────────────────────────────┘
                         │  HTTP / JSON
┌────────────────────────▼─────────────────────────────────┐
│                  @RestController                         │
│   CustomerController · MenuController · CartController   │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                     @Service                             │
│   CustomerService · RestaurantService · CartService ·    │
│                  MenuItemService                         │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│              Spring Data JDBC Repositories               │
│   CustomerRepo · RestaurantRepo · MenuItemRepo ·         │
│             CartRepo · OrderItemRepo                     │
└────────────────────────┬─────────────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │ PostgreSQL  │
                  └─────────────┘
```

Cross-cutting concerns:

- **Security filter chain** (`AppConfig.filterChain`) sits in front of the controllers and decides which endpoints require authentication.
- **Caffeine cache** (configured via `spring.cache.caffeine.spec`) sits between the services and the repositories for hot, mostly-read data (`restaurants`, `cart`).
- **`DevRunner`** is an `ApplicationRunner` that seeds a default user (`foo@mail.com` / `123456`) at startup for local development.

---

## Project Layout

```
OnlineOrder/
├── build.gradle               # Gradle build script
├── settings.gradle
├── gradlew / gradlew.bat      # Gradle wrapper
├── Dockerfile                 # Runtime image (JRE + fat jar)
├── docker-compose.yml         # Local PostgreSQL service
├── src/
│   ├── main/
│   │   ├── java/com/laioffer/onlineorder/
│   │   │   ├── OnlineOrderApplication.java   # @SpringBootApplication entry point
│   │   │   ├── AppConfig.java                # Security + password encoder + UserDetailsManager
│   │   │   ├── DevRunner.java                # Seeds dev user on startup
│   │   │   ├── controller/
│   │   │   │   ├── CustomerController.java   # POST /signup
│   │   │   │   ├── MenuController.java       # GET /restaurants/menu, /restaurant/{id}/menu
│   │   │   │   └── CartController.java       # GET/POST /cart, POST /cart/checkout
│   │   │   ├── service/
│   │   │   │   ├── CustomerService.java
│   │   │   │   ├── RestaurantService.java
│   │   │   │   ├── MenuItemService.java
│   │   │   │   └── CartService.java
│   │   │   ├── repository/                   # Spring Data JDBC interfaces
│   │   │   ├── entity/                       # @Table-mapped records
│   │   │   ├── model/                        # DTOs and request bodies (records)
│   │   │   └── hello/                        # Sample/learning code (HelloController, etc.)
│   │   └── resources/
│   │       ├── application.yml               # Spring config
│   │       ├── database-init.sql             # Schema + seed data (run on every startup)
│   │       └── public/                       # React SPA build output
│   └── test/
│       └── java/com/laioffer/onlineorder/
│           ├── OnlineOrderApplicationTests.java
│           └── CartServiceTests.java         # Mockito unit tests for CartService
```

---

## Domain Model

Schema (defined in `src/main/resources/database-init.sql`):

- **`customers`** — `id`, `email` (unique), `password`, `enabled`, `first_name`, `last_name`
- **`authorities`** — `id`, `email` (FK → `customers.email`), `authority`
- **`carts`** — `id`, `customer_id` (unique FK → `customers.id`), `total_price`. One cart per customer.
- **`restaurants`** — `id`, `name`, `address`, `image_url`, `phone`
- **`menu_items`** — `id`, `restaurant_id` (FK), `name`, `price`, `description`, `image_url`
- **`order_items`** — `id`, `menu_item_id` (FK), `cart_id` (FK), `price`, `quantity`. Represents a line item in a customer's cart.

Entity records (`com.laioffer.onlineorder.entity`) mirror these tables one-to-one via Spring Data JDBC `@Table`/`@Id` annotations.

DTOs (`com.laioffer.onlineorder.model`) shape the API responses — for example, `RestaurantDto` bundles each restaurant with its list of `MenuItemDto`s, and `CartDto` bundles a cart with its enriched `OrderItemDto` list.

---

## REST API

Request/response bodies are JSON, keyed in `snake_case` (configured via `spring.jackson.property-naming-strategy: SNAKE_CASE`). `null` properties are omitted from responses.

### Public endpoints (no authentication required)

| Method | Path                            | Description                                                 |
| ------ | ------------------------------- | ----------------------------------------------------------- |
| GET    | `/`, `/index.html`, `/static/**`| React SPA assets                                            |
| POST   | `/signup`                       | Register a new customer (returns **201 Created**)           |
| POST   | `/login`                        | Form login (`username`, `password`); returns **200** on success, **401** on failure |
| POST   | `/logout`                       | Ends the session, returns **200**                           |
| GET    | `/restaurants/menu`             | All restaurants with their menu items (cached)              |
| GET    | `/restaurant/{restaurantId}/menu` | Menu items for a single restaurant                        |

### Authenticated endpoints

These require an authenticated session (cookie obtained via `POST /login`).

| Method | Path              | Description                                                   |
| ------ | ----------------- | ------------------------------------------------------------- |
| GET    | `/cart`           | Returns the current user's cart (`CartDto`)                   |
| POST   | `/cart`           | Add a menu item to the cart. Body: `{ "menu_id": <long> }`    |
| POST   | `/cart/checkout`  | Empties the user's cart and resets `total_price` to 0         |

### Sample requests

```bash
# Sign up
curl -i -X POST http://localhost:8080/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"hunter2","first_name":"Alice","last_name":"Liddell"}'

# Log in (form-encoded; persists JSESSIONID in cookies.txt)
curl -i -c cookies.txt -X POST http://localhost:8080/login \
  -d 'username=alice@example.com&password=hunter2'

# List restaurants (public, cached)
curl http://localhost:8080/restaurants/menu

# Add a menu item to cart (authenticated)
curl -i -b cookies.txt -X POST http://localhost:8080/cart \
  -H 'Content-Type: application/json' \
  -d '{"menu_id": 2}'

# View cart
curl -b cookies.txt http://localhost:8080/cart

# Checkout
curl -i -b cookies.txt -X POST http://localhost:8080/cart/checkout
```

---

## Authentication & Authorization

Configured in `AppConfig.java`:

- **User store:** `JdbcUserDetailsManager` reads from the `customers` and `authorities` tables. Custom SQL is wired so that `email` plays the role of "username":
  - `INSERT INTO customers (email, password, enabled) VALUES (?,?,?)`
  - `INSERT INTO authorities (email, authority) VALUES (?,?)`
  - `SELECT email, password, enabled FROM customers WHERE email = ?`
- **Password encoder:** Spring's `DelegatingPasswordEncoder` (defaults to `bcrypt` for newly created users).
- **CSRF:** disabled (this is a stateful session API consumed by the bundled SPA).
- **Session:** standard servlet `JSESSIONID` cookie.
- **Auth failure:** unauthenticated requests to protected endpoints return **401 Unauthorized** (instead of redirecting to a login page).
- **Roles:** every newly signed-up user gets the `USER` role.

---

## Caching

`@EnableCaching` is turned on in `OnlineOrderApplication`. Caffeine is the cache provider, with its global spec set to `expireAfterWrite=60s` (`application.yml`).

| Cache name    | Populated by                          | Evicted by                                |
| ------------- | ------------------------------------- | ----------------------------------------- |
| `restaurants` | `RestaurantService.getRestaurants()`  | TTL only (60s)                            |
| `cart`        | `CartService.getCart(customerId)`     | `addMenuItemToCart` and `clearCart` (per-customer key) |

---

## Configuration

`src/main/resources/application.yml`:

```yaml
spring:
  cache:
    caffeine:
      spec: expireAfterWrite=60s
  jackson:
    default-property-inclusion: non_null
    property-naming-strategy: SNAKE_CASE
  datasource:
    url: jdbc:postgresql://${DATABASE_URL:localhost}:${DATABASE_PORT:5432}/onlineorder
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:secret}
    driver-class-name: org.postgresql.Driver
  sql:
    init:
      mode: ${INIT_DB:always}
      schema-locations: "classpath:database-init.sql"
```

### Environment variables

| Variable             | Default      | Purpose                                                        |
| -------------------- | ------------ | -------------------------------------------------------------- |
| `DATABASE_URL`       | `localhost`  | Hostname of the Postgres server                                |
| `DATABASE_PORT`      | `5432`       | Port of the Postgres server                                    |
| `DATABASE_USERNAME`  | `postgres`   | Database user                                                  |
| `DATABASE_PASSWORD`  | `secret`     | Database password                                              |
| `INIT_DB`            | `always`     | Re-run `database-init.sql` on every startup. Set to `never` to preserve data. |

> **Heads-up:** the default `INIT_DB=always` drops and recreates the schema on every startup, which is convenient in development but will wipe any data you've inserted. Override it (`INIT_DB=never`) in any environment where you want persistence.

---

## Getting Started

### Prerequisites

- **JDK 21** (the Gradle toolchain will download one if you don't have it; otherwise install Temurin 21).
- **Docker Desktop** (or any local Docker engine + Docker Compose) for running PostgreSQL.
- Optional: an HTTP client like `curl`, HTTPie, or Postman for testing the API.

### Clone

```bash
git clone <your-fork-url> OnlineOrder
cd OnlineOrder
```

---

## Running the App

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts a Postgres 15.2 container on `localhost:5432` with database `onlineorder`, user `postgres`, and password `secret` — matching the defaults in `application.yml`. Data is persisted in the `onlineorder-pg-local` Docker volume.

### 2. Start the Spring Boot app

From the project root:

```bash
# macOS / Linux
./gradlew bootRun

# Windows (PowerShell)
.\gradlew.bat bootRun
```

The app boots on **<http://localhost:8080>**. The bundled React UI is served at `/`. On first startup the `DevRunner` seeds a user you can log in with immediately:

- **Email:** `foo@mail.com`
- **Password:** `123456`

> If the app crashes on startup with a "duplicate key" error from `DevRunner`, it's because `INIT_DB=always` wasn't honored or the seed user already exists. Stop the container, drop the volume (`docker compose down -v`), and restart.

### 3. Stop everything

```bash
# Stop the app: Ctrl+C in the bootRun terminal
# Stop the database:
docker compose down
```

---

## Building the Docker Image

The provided `Dockerfile` expects a pre-built fat JAR at `build/libs/OnlineOrder-0.0.1-SNAPSHOT.jar`.

```bash
# 1. Build the jar
./gradlew clean bootJar

# 2. Build the image
docker build -t onlineorder:latest .

# 3. Run it (point it at a reachable Postgres)
docker run --rm -p 8080:8080 \
  -e DATABASE_URL=host.docker.internal \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=secret \
  onlineorder:latest
```

The image is pinned to `linux/amd64` and uses the `eclipse-temurin:21-jre` runtime.

---

## Testing

Run the full test suite:

```bash
./gradlew test
```

The included tests are pure unit tests using JUnit 5 + Mockito and do **not** require a running database:

- `CartServiceTests` — covers the `CartService` paths for adding new vs. existing order items, fetching a cart, and clearing a cart.
- `OnlineOrderApplicationTests` — Spring Boot context smoke test.

HTML and XML reports land in `build/reports/tests/test/` after a run.

---

## Seed Data

`database-init.sql` ships with three demo restaurants and ~30 menu items so that the UI is populated immediately:

1. **Burger King** — Whoppers, Chicken Fries, shakes, etc.
2. **SGD Tofu House** — Korean tofu stews and BBQ.
3. **Fashion Wok** — Sichuan-style stir-fries.

Image URLs point at DoorDash's public CDN; no images are bundled with the repo.

---

## Troubleshooting

| Symptom                                                              | Likely cause / fix                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Connection to localhost:5432 refused`                               | Postgres container isn't running. `docker compose up -d` and wait a few seconds.                                         |
| `relation "customers" does not exist`                                | `INIT_DB` was overridden to `never` before the schema was ever created. Set `INIT_DB=always` once, then back to `never`. |
| Logged in but every cart request returns `401`                       | Make sure you're sending the `JSESSIONID` cookie returned by `POST /login` (use `-c`/`-b` with curl, or enable cookies). |
| `DevRunner` fails on startup with a duplicate-key error              | The seed user already exists. Drop the Postgres volume (`docker compose down -v`) or set `INIT_DB=always`.               |
| Want to keep data between runs                                       | Set `INIT_DB=never` and avoid `docker compose down -v` (which deletes the volume).                                       |
| Gradle complains it can't find a JDK                                 | Install JDK 21 or let the Gradle toolchain auto-provision one (requires `--refresh-dependencies` and network access).    |

---

## License

No license file is included; treat this as an educational/learning project unless the owner specifies otherwise.

# Leverteam — Управление экспертами

CRM-система управления лидами (экспертами) в виде интерактивной **Канбан-доски**.
Платформа управления экспертами «Leverteam».

## Возможности

- 🔐 **Авторизация по логину/паролю** (NextAuth, стратегия JWT).
- 👥 **Две роли (RBAC):**
  - **Администратор** (главный аккаунт — **Роман**) — видит всех лидов и все доски,
    управляет сотрудниками (список, профили, добавление, удаление).
  - **Продажник** — видит только закреплённых за ним лидов.
- 🗂 **Канбан-доска** с 7 этапами воронки и перетаскиванием карточек (`@dnd-kit`).
- 🏷 **12 ниш** с цветовым кодированием и фильтрацией пиллсами + поиск.
- 📊 **Метрики:** Всего экспертов · В работе · В очереди · Купили.
- 🌗 **Тёмная / светлая тема** (тумблер в шапке).

## Стек

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL ·
NextAuth.js · @dnd-kit · next-themes · lucide-react.

## Модель данных

`User` · `Lead` · `Niche` · `Stage` — см. [`prisma/schema.prisma`](prisma/schema.prisma).

## Быстрый старт

### 1. Зависимости

```bash
npm install
```

### 2. База данных (PostgreSQL)

Проще всего через Docker:

```bash
docker compose up -d
```

Либо укажите свою строку подключения в `.env` (`DATABASE_URL`).
Скопируйте `.env.example` → `.env` при необходимости.

### 3. Применить схему и залить демо-данные

```bash
npm run db:push     # создать таблицы
npm run db:seed     # админ "Роман", ниши, этапы, продажники, демо-лиды
```

### 4. Запуск

```bash
npm run dev
```

Откройте <http://localhost:3000>.

## Демо-доступы

| Роль | Логин | Пароль |
|------|-------|--------|
| Администратор (**Роман**) | `roman` | `admin123` |
| Продажник | `alex` | `sales123` |
| Продажник | `maria` | `sales123` |

> Данные админа настраиваются через `ADMIN_NAME` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` в `.env`.

## Полезные команды

| Команда | Действие |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Продакшн-сборка |
| `npm run db:push` | Синхронизировать схему с БД |
| `npm run db:seed` | Заполнить БД начальными данными |
| `npm run db:reset` | Полный сброс БД + повторный seed |
| `npm run db:studio` | Prisma Studio (просмотр БД) |

## Структура

```
prisma/
  schema.prisma        # модели User, Lead, Niche, Stage
  seed.ts              # начальные данные (админ "Роман" и т.д.)
src/
  app/
    api/               # REST API (leads, users, metrics, niches, stages, auth)
    board/             # страница канбан-доски
    admin/employees/   # управление сотрудниками (только админ)
    login/             # страница входа
  components/          # Header, Metrics, Filters, Board, Column, LeadCard, ...
  lib/                 # prisma, auth, rbac, constants, types
  middleware.ts        # защита роутов + ролевой доступ
```

## API (кратко)

| Метод | Путь | Доступ |
|-------|------|--------|
| `GET` | `/api/leads?search=&niche=&stage=` | по роли (админ — все, продажник — свои) |
| `POST` | `/api/leads` | авторизованные |
| `GET/PATCH/DELETE` | `/api/leads/:id` | владелец лида или админ |
| `GET/POST` | `/api/users` | только админ |
| `GET/PATCH/DELETE` | `/api/users/:id` | только админ |
| `GET` | `/api/metrics` | по роли |
| `GET` | `/api/niches`, `/api/stages` | авторизованные |

## Деплой на Netlify

Проект настроен под Netlify (`netlify.toml` + `@netlify/plugin-nextjs`,
`binaryTargets` для Prisma). Что нужно сделать при деплое:

### 1. Облачная база данных (обязательно)

Локальный `localhost:5432` на Netlify недоступен. Заведите PostgreSQL в облаке
([Neon](https://neon.tech) / [Supabase](https://supabase.com) / Railway).
Для serverless-функций используйте **pooled**-строку подключения
(Neon: «Pooled connection», Supabase: порт `6543` / PgBouncer).

### 2. Переменные окружения (Site settings → Environment variables)

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | pooled-строка подключения к облачному Postgres |
| `NEXTAUTH_SECRET` | длинная случайная строка (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL сайта, напр. `https://<site>.netlify.app` |
| `ADMIN_NAME` | `Роман` |
| `ADMIN_USERNAME` | `roman` |
| `ADMIN_PASSWORD` | пароль администратора |

> `NODE_VERSION=20` уже задан в `netlify.toml`.

### 3. Инициализировать схему и данные (один раз)

Локально, указав `DATABASE_URL` от облачной БД:

```bash
DATABASE_URL="<облачный-URL>" npm run db:push    # создать таблицы
DATABASE_URL="<облачный-URL>" npm run db:seed    # админ, ниши, этапы, демо-лиды
```

После этого задеплойте — Netlify сам поставит рантайм Next.js и соберёт проект.

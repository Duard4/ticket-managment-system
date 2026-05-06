# Deployment Guide — Ticket Management System (TMS)

## Середовища розгортання

| Середовище     | Призначення                    | URL                     |
| -------------- | ------------------------------ | ----------------------- |
| **Local**      | Розробка та демонстрація       | http://localhost:5173   |
| **Staging**    | Тестування перед релізом       | https://staging.tms.app |
| **Production** | Бойове середовище (планується) | https://tms.app         |

---

## Локальне розгортання (Development)

### Вимоги

| Інструмент | Версія  |
| ---------- | ------- |
| Node.js    | v20+    |
| npm        | v9+     |
| PostgreSQL | 16      |
| Git        | остання |

### Крок 1 — Клонування репозиторію

```bash
git clone https://github.com/parkhomenko/tms.git
cd tms
```

### Крок 2 — Налаштування змінних середовища

```bash
cp backend/.env.example backend/.env
```

Відкрити `backend/.env` і заповнити:

```env
# База даних
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tms_db
DB_USER=postgres
DB_PASS=yourpassword

# Авторизація
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN=24h

# Сервер
PORT=3000
FRONTEND_URL=http://localhost:5173

# Email (опціонально, поки не реалізовано)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### Крок 3 — База даних

```bash
# Створити базу даних
createdb tms_db

# Або через psql
psql -U postgres -c "CREATE DATABASE tms_db;"
```

### Крок 4 — Встановлення залежностей і міграції

```bash
# Backend
cd backend
npm install
npm run migration:run

# Frontend
cd ../frontend
npm install
```

### Крок 5 — Запуск

```bash
# Термінал 1 — Backend (порт 3000)
cd backend
npm run start:dev

# Термінал 2 — Frontend (порт 5173)
cd frontend
npm run dev
```

Відкрити браузер: **http://localhost:5173**

### Тестові облікові записи

| Роль                | Email            | Пароль    |
| ------------------- | ---------------- | --------- |
| Адміністратор       | admin@tms.app    | Admin1!23 |
| Оператор            | operator@tms.app | Oper1!23  |
| Кінцевий користувач | user@tms.app     | User1!23  |

---

## Розгортання через Docker (Staging)

> Конфігурація в розробці. Файл `docker-compose.yml` буде додано у наступному релізі.

Планована структура:

```yaml
# docker-compose.yml (приклад — не фінальна версія)
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:80"

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: tms_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Можливі проблеми та вирішення

| Проблема                                     | Причина                                         | Вирішення                                                            |
| -------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `Error: connect ECONNREFUSED 127.0.0.1:5432` | PostgreSQL не запущено                          | Запустити: `sudo service postgresql start`                           |
| `Port 3000 is already in use`                | Порт зайнятий іншим процесом                    | Змінити `PORT=3001` у `.env`                                         |
| CORS-помилка у браузері                      | `FRONTEND_URL` не збігається з адресою frontend | Перевірити `FRONTEND_URL` у `backend/.env`                           |
| `Migration failed`                           | Недостатньо прав у користувача БД               | Надати права: `GRANT ALL PRIVILEGES ON DATABASE tms_db TO postgres;` |
| Blank page на frontend                       | Не зібраний frontend або неправильний `API_URL` | Перевірити `VITE_API_URL` у `frontend/.env`                          |

---

## Резервне копіювання

### Резервна копія БД

```bash
# Створити дамп
pg_dump -U postgres tms_db > backup_$(date +%Y%m%d).dump

# Відновити з дампу
pg_restore -U postgres -d tms_db backup_20260501.dump
```

### Автоматичний backup (cron)

```bash
# Додати до crontab (crontab -e)
# Щодня о 02:00 — зберігати дамп і залишати останні 7 копій
0 2 * * * pg_dump -U postgres tms_db > /backups/tms_$(date +\%Y\%m\%d).dump && find /backups -name "tms_*.dump" -mtime +7 -delete
```

---

## Оновлення системи

```bash
# 1. Отримати останні зміни
git pull origin main

# 2. Оновити залежності
cd backend && npm install
cd ../frontend && npm install

# 3. Виконати нові міграції (якщо є)
cd backend && npm run migration:run

# 4. Перезапустити сервіси
npm run start:dev
```

> Перед оновленням на staging/production завжди виконувати резервне копіювання БД.

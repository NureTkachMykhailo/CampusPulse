# CampusPulse

Full-stack блог студентського життя ХНУРЕ (навчання, гуртожиток, спорт, наука, події). Практична робота №2 (лабораторна №2 з дисципліни ВМПтФ) — Node.js + Express + React.

## Стек
- **Backend**: Node.js, Express, вбудований `node:sqlite`, JWT (`jsonwebtoken` + `bcryptjs`)
- **Frontend**: React (Vite), React Router

Демо-акаунт після seed: `demo@campuspulse.local` / `campus123`.

## Рівні
- **1** — список і деталь статті
- **2** — CRUD статей, категорії, коментарі (тільки автор може редагувати/видаляти)
- **3** — реєстрація/логін на JWT, пошук за текстом і фільтр за категорією

## Запуск
```bash
# термінал 1
cd server && npm install && npm run dev
# http://localhost:3001

# термінал 2
cd client && npm install && npm run dev
# http://localhost:5173
```

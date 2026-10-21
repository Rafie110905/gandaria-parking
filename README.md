# Gandaria City Parking API

Node.js + Express + MongoDB (Mongoose) + JWT.

## Menjalankan
```bash
npm install
cp .env.example .env     # isi JWT_SECRET, MONGODB_URI, PAYMENT_WEBHOOK_SECRET
npm run seed             # admin, tarif contoh, slot contoh
npm run dev
npm test
```

## Endpoint
| Method | Path | Role |
|---|---|---|
| POST | /api/auth/register | publik (role customer) |
| POST | /api/auth/login | publik |
| POST | /api/sessions/entry | admin, operator |
| GET | /api/sessions/:ticketCode | login |
| POST | /api/sessions/exit | admin, operator |
| GET | /api/slots/availability | publik |
| POST | /api/payments | login |
| POST | /api/payments/webhook | gateway (HMAC `x-signature`) |
| CRUD | /api/tariffs | admin |
| GET | /api/reports/daily?date=YYYY-MM-DD | admin |

## Alur keluar
1. `POST /sessions/exit` -> 402 + `fee` jika belum bayar.
2. `POST /payments` -> bayar via gateway -> webhook menandai sesi `paid`.
3. `POST /sessions/exit` lagi -> palang terbuka.

## Belum dikerjakan
Integrasi API payment gateway asli (ada TODO di `routes/payments.js`), integrasi ANPR/barrier,
mode offline gate, audit log buka palang manual, tarif member/validasi merchant.

# Peptide Sales Shop Project

A full-stack peptide sales platform with separate frontend, admin panel, and backend applications.

## Project Structure

```
product-website/
├── frontend/          # Next.js frontend for customers
├── admin-panel/       # Next.js admin panel for management
└── backend/           # NestJS backend API
```

## Getting Started

### Frontend (Customer-facing)
```bash
cd frontend
npm run dev
```
Runs on http://localhost:3000

### Admin Panel
```bash
cd admin-panel
npm run dev
```
Runs on http://localhost:3000 (use different port if frontend is running)

### Backend API
```bash
cd backend
npm run start:dev
```
Runs on http://localhost:3000 (default NestJS port)

## Technology Stack

- **Frontend & Admin Panel**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript

## Deployment

Each application is designed to be deployed on separate domains:
- Frontend: Customer-facing domain
- Admin Panel: Admin domain
- Backend: API domain


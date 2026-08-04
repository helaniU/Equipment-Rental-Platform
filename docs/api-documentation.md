# API Documentation - Equipment Rental Platform

## Authentication (`/auth`)
* `POST /auth/register` - Register a new user.
* `POST /auth/login` - Authenticate and receive a JWT token.

## Equipment Catalog (`/equipment`)
* `GET /equipment` - Fetch all equipment items.
* `POST /equipment` - Add new equipment (Admin / Staff only).

## Reservations (`/reservations`)
* `GET /reservations` - List all reservations.
* `POST /reservations` - Create a rental order.
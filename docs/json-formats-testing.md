
=======================================================
# JSON FOR TESTING POSTMAN/THUNDER_CLIENT
=======================================================

## ROLES:

- Ruta: http://localhost:3000/roles
- JSON -> CLIENT:
{
  "id": "CLIENT",
  "name": "Cliente",
  "image": "https://admin-img.png",
  "route": "/"
}

- JSON -> ADMIN:
{
  "id": "ADMIN",
  "name": "Administrador",
  "image": "https://admin-img.png",
  "route": "/admin/home"
}

- JSON -> SUPER_ADMIN:
{
  "id": "SUPER_ADMIN",
  "name": "Super Administrador",
  "image": "https://admin-img.png",
  "route": "/super-admin/home"
}

## USERS

- RUTA_REGISTER: http://localhost:3000/auth/register
- JSON -> CLIENT:
{
  "name": "Josue Elias",
  "lastname": "Algarate Rubio",
  "email": "admin123@gmail.com",
  "password": "admin123",
  "nickname": "Josue09P",
  "phone": "965634940",
  "image": "https://example.com/profile.jpg"
}

- RUTA_LOGIN: http://localhost:3000/auth/login
- JSON -> CLIENT:
{
  "email": "admin123@gmail.com",
  "password": "admin123",
}

## Discounts

- RUTA: http://localhost:3000/discounts
{
  "name": "Descuento de prueba",
  "description": "20% OFF por lanzamiento",
  "slogan": "¡Aprovecha ya!",
  "amount": 20.00,
  "startDate": "2025-06-02T00:00:00.000Z",
  "endDate": "2025-06-10T23:59:59.000Z",
  "productId": 4
}

------------------------------------------------------
# GUIA PARA PRUEBAS CON POSTMAN/THUNDER_CLIENT
------------------------------------------------------
## ROLES:
comentamos en el controller para que no prohiba crear:
  //@HasRoles(JwtRole.ADMIN)
  //@UseGuards(JwtAuthGuard, JwtRolesGuard)

### Ruta: http://localhost:3000/roles

### JSON -> CLIENT:
{
  "id": "CLIENT",
  "name": "Cliente",
  "image": "https://admin-img.png",
  "route": "/client/home"
}

### JSON -> ADMIN:
{
  "id": "ADMIN",
  "name": "Administrador",
  "image": "https://admin-img.png",
  "route": "/admin/home"
}

### JSON -> SUPER_ADMIN:
{
  "id": "SUPER_ADMIN",
  "name": "Super Administrador",
  "image": "https://admin-img.png",
  "route": "/super-admin/home"
}
-------------------------------------------------------
## USERS

### RUTA_REGISTER: http://localhost:3000/auth/register
### JSON -> CLIENT:
{
  "name": "Josue Elias",
  "lastname": "Algarate Rubio",
  "email": "admin123@gmail.com",
  "password": "admin123",
  "nickname": "Josue09P",
  "phone": "965634940",
  "image": "https://example.com/profile.jpg"
}

### RUTA_LOGIN: http://localhost:3000/auth/login
### JSON -> CLIENT:
{
  "email": "admin123@gmail.com",
  "password": "admin123",
}

-------------------------------------------------------
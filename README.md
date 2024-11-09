<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Instalacion

1. Clonar repositorio

```bash
$ yarn install
```

2. Cambiar el **.env.temaplate** a **.env**

3. Ir a https://console.cloud.google.com/home/dashboard?authuser=1&hl=es&project=dogwood-keep-440802-f1 y crear un nuevo proyecto y configurarlo para hacer uso de la autenticacion de Google, cuando obtengas las keys necesarias ponerlas en el .env, que son necesarias para correr el proyecto, si no te dara error.

4. Configurar las variables de docker, para hacer uso de la base de datos con prisma, una vez configuradas hacer el docker compose.

```bash
$ docker-compose up -d
```

5. Crear cuenta en AWS para poder subir las imagenes a S3 https://us-east-2.console.aws.amazon.com/s3/buckets/, una vez obtenidas todas las variables necesarias ponerlas en el .env

6. Establecer un JWT_SECRET en .env

7. Correr aplicacion

## Running the app

```bash
$ yarn start:dev
```

## TODOS LOS ENDPOINTS

```bash
  Subir imagenes al bucket
$ http://localhost:4555/api/images/upload

  Registrar usuarios
$ http://localhost:4555/api/auth/register

  Login
$ http://localhost:4555/api/auth/login

 Obtener todas las imagenes
$ http://localhost:4555/api/images

  Obtener imagen por Id
$ http://localhost:4555/api/images/:imageId

  Hacer uso del la autenticacion de Google
$ http://localhost:4555/api/auth/google/login

  Transformar imagen
$ http://localhost:4555/api/images/:imageId/transform

  Eliminar Imagen
$ http://localhost:4555/api/images/:imageId
```

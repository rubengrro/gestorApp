# Proyecto de Gestión de Incidencias Laborales

## Descripción Técnica

Este proyecto está diseñado para gestionar incidencias laborales de manera estructurada, eficiente y segura. Se basa en tecnologías modernas que ofrecen escalabilidad, flexibilidad y robustez:

- **Next.js:** Framework de React que permite renderizado híbrido (SSR y SSG), optimización del rendimiento y una excelente experiencia de desarrollo.
- **Prisma:** ORM moderno que simplifica la interacción con bases de datos relacionales. Facilita la definición de esquemas y genera un cliente tipado para consultas más seguras.
- **PostgreSQL:** Base de datos relacional altamente fiable, ideal para sistemas transaccionales como la gestión de incidencias laborales.
- **NextAuth:** Librería para autenticación en Next.js que soporta múltiples proveedores de autenticación, incluyendo credenciales personalizadas, con un enfoque en la seguridad y extensibilidad.

## Estructura del Proyecto

- **Modelos Prisma:** Los esquemas de la base de datos están definidos en la carpeta `prisma`, lo que permite una gestión centralizada de las tablas y relaciones.
- 
## Configuración del Entorno

### Requisitos Previos

1. **Node.js:** Versión 18 o superior.
2. **PostgreSQL:** Instalado y configurado localmente o en un servicio de base de datos en la nube.
3. **Editor de Código:** Visual Studio Code es recomendado.

### Pasos para Reproducir el Proyecto

#### 1. Clonar el Repositorio

```bash
git clone <url_del_repositorio>
cd <nombre_del_proyecto>
```

#### 2. Instalar Dependencias

```bash
npm install
```

Asegúrate de que las dependencias principales como `next-auth`, `bcrypt`, y otras estén correctamente instaladas.

#### 3. Configurar la Base de Datos

Establece una conexión a PostgreSQL en el archivo `.env`. Aquí hay un ejemplo del string de conexión:

```env
DATABASE_URL="postgresql://<usuario>:<contraseña>@localhost:5432/<nombre_base_datos>?schema=public"
```

Si usas una base de datos en la nube, reemplaza los valores por las credenciales proporcionadas por tu proveedor.

**Nota:** Este proyecto no está conectado a una base de datos remota. Antes de usarlo, asegúrate de configurar correctamente PostgreSQL.

#### 4. Configurar Credenciales de Email

Para reproducir la funcionalidad de envío de correos, configura las credenciales en el archivo `.env`.

#### 5. Inicializar el Proyecto

Ejecuta los siguientes comandos:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

### Creación de Usuarios Iniciales

1. Accede a `http://localhost:3000/dashboard/usuarios`.
2. Crea usuarios iniciales con su email, contraseña y demás datos requeridos.

![image](https://github.com/user-attachments/assets/36490d07-b142-4681-b5e4-7e114d6246a2)


### Inicio de Sesión

Ingresa a `http://localhost:3000/login` para autenticarte con las credenciales creadas.
![image](https://github.com/user-attachments/assets/eb4ba6ad-d2bc-45c8-8d5c-a56f9c969147)


### Carga de Trabajadores

1. Inicia sesión como **Superadministrador** o **Administrador**.
2. Ve a la pestaña "Trabajadores".
3. Asegúrate de que los nombres de los supervisores y gerentes existan previamente como usuarios en la base de datos.
![image](https://github.com/user-attachments/assets/5790c3c6-56cf-4746-8752-e1c84e1d7ca6)


### Creación de Nuevas Incidencias

Para añadir una nueva incidencia al catálogo:

1. Asegúrate de utilizar el nombre exacto y el infotipo correcto.
2. Modifica el archivo:
   ```
   src/app/_components/_incidencias/presentacion-formulario.tsx
   ```
   Esto asegura la visualización independiente de cada formulario.

## Para registrar una incidencia:

1. El botón Nuevo Registro abre el selector de incidencias disponibles según el usuario.
   
![image](https://github.com/user-attachments/assets/1241f0aa-6311-47d7-aee0-8607099bbe73)

2. Se selecciona y se abre el formulario:
![image](https://github.com/user-attachments/assets/10fc9244-7606-4119-aba6-fb0ea915eb79)

3. Se busca un trabajador mediante alguno de sus ID y se autocompleta:
![image](https://github.com/user-attachments/assets/ae13f940-f4d1-4cfe-a5b0-c776137a4a86)

![image](https://github.com/user-attachments/assets/8bd0180c-d38d-4d49-a2cc-2994db2f52f0)

4. Los registros que necesiten aprobación estarán acompañados de un email hacia el usuario relacionado:
   
![image](https://github.com/user-attachments/assets/6107d973-9244-469d-8e49-4cafaff49639)

## El dashboard se actualiza:
![image](https://github.com/user-attachments/assets/3621c25d-e472-4ef0-b48b-7b7a327686ad)



## Justificación de Tecnologías

- **Next.js:** Ideal para proyectos que requieren SEO optimizado y un equilibrio entre rendimiento del cliente y del servidor. Su integración con APIs lo hace perfecto para una aplicación basada en formularios y tablas dinámicas.
- **Prisma:** Simplifica la gestión de esquemas y consultas complejas, asegurando consistencia y validaciones integradas.
- **PostgreSQL:** Escalable y confiable, con soporte avanzado para consultas y relaciones complejas.
- **NextAuth:** Proporciona autenticación lista para usar con soporte para roles y permisos, crucial para este proyecto multiusuario.

## Notas Finales

- Cambia las credenciales en el archivo `.env` antes de implementar en producción.
- Verifica que las dependencias estén actualizadas y compatibles con tu entorno local.

Si tienes problemas o preguntas, abre un issue en el repositorio o contacta al desarrollador.


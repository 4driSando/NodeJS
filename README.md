# Entorno Docker - Guía de Configuración y Uso

Este proyecto proporciona un entorno Docker multiservicio que incluye una aplicación Node.js, una base de datos MySQL y phpMyAdmin para la gestión visual de la base de datos.

## 📋 Requisitos Previos

Antes de iniciar, asegúrate de tener instalados:

- **Docker**: Versión 20.10 o superior
  - [Descargar Docker](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Versión 1.29 o superior
  - Normalmente se incluye con Docker Desktop

### Verificar Instalación

Para verificar que tienes Docker y Docker Compose instalados correctamente, ejecuta:

```bash
docker --version
docker-compose --version
```

## 🚀 Configuración Inicial

### Paso 1: Clonar o Preparar el Proyecto

Si aún no lo has hecho, asegúrate de que los archivos del proyecto estén en tu máquina:

```bash
cd c:\docker_proyectos\NodeJS
```

### Paso 2: Preparar la Estructura de Carpetas

El proyecto debe tener la siguiente estructura:

```
docker_proyectos/
└── NodeJS/
    ├── docker-compose.yml
    ├── README.md
    ├── package.json          (tu proyecto Node.js)
    ├── package-lock.json     (generado automáticamente)
    └── [otros archivos de tu app]
```

### Paso 3: Configurar Variables de Entorno (Opcional)

Si necesitas personalizar las variables de entorno, puedes crear un archivo `.env` en la raíz del proyecto:

```bash
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=mi_base
```

## 🎮 Comandos Principales

### Iniciar el Entorno

Para iniciar todos los servicios:

```bash
docker-compose up -d
```

**Opciones útiles:**
- `docker-compose up`: Inicia sin modo detached (verás los logs en tiempo real)
- `docker-compose up -d`: Inicia en segundo plano (modo detached)
- `docker-compose up --build`: Construye las imágenes antes de iniciar
- `docker-compose up -d --build`: Construye y inicia en segundo plano

### Ver Estado de los Servicios

```bash
docker-compose ps
```

Esto mostrará el estado de todos los contenedores.

### Ver Logs

Ver logs de todos los servicios:
```bash
docker-compose logs -f
```

Ver logs de un servicio específico:
```bash
docker-compose logs -f app        # Logs de Node.js
docker-compose logs -f db         # Logs de MySQL
docker-compose logs -f phpmyadmin # Logs de phpMyAdmin
```

### Detener los Servicios

Detener sin eliminar los contenedores:
```bash
docker-compose stop
```

Detener y eliminar los contenedores:
```bash
docker-compose down
```

**Importante:** Usar `docker-compose down` no elimina los volúmenes de datos (persisten en `db_data`).

Para eliminar todo incluyendo volúmenes:
```bash
docker-compose down -v
```

### Reiniciar los Servicios

```bash
docker-compose restart
```

O reiniciar un servicio específico:
```bash
docker-compose restart app
```

## 🔌 Acceso a los Servicios

### 1. Aplicación Node.js

- **URL**: `http://localhost:3307`
- **Descripción**: Tu aplicación Node.js se ejecutará en este puerto
- **Ubicación en contenedor**: `/app`
- **Volumen montado**: `./` del proyecto local está sincronizado con `/app` en el contenedor

### 2. Base de Datos MySQL

- **Host**: `db` (desde otros servicios en Docker) o `localhost` (desde tu máquina)
- **Puerto**: `3307`
- **Usuario**: `root`
- **Contraseña**: `root`
- **Base de datos predeterminada**: `mi_base`

**Conexión desde Node.js:**
```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'db',           // nombre del servicio Docker
  user: 'root',
  password: 'root',
  database: 'mi_base'
});

connection.connect();
```

**Conexión desde tu máquina local (si usas un cliente MySQL):**
```bash
mysql -h localhost -u root -p mi_base
```

### 3. phpMyAdmin (Gestor Visual de MySQL)

- **URL**: `http://localhost:8080`
- **Usuario**: `root`
- **Contraseña**: `root`
- **Servidor**: `db`

**Pasos para acceder:**
1. Abre tu navegador
2. Ve a `http://localhost:8080`
3. En el campo "Servidor", asegúrate de que aparece `db`
4. Usuario: `root`
5. Contraseña: `root`
6. Haz clic en "Conectar"

## 📁 Estructura de Servicios

### Servicio `app` (Node.js)

```yaml
image: node:18
container_name: node_app
working_dir: /app
volumes:
  - ./:/app              # Sincroniza código local
ports:
  - "3307:3306"         # Puerto 3307 accesible localmente
```

- **Imagen**: Node.js versión 18
- **Punto de entrada**: `npm start` (debe existir script en package.json)
- **Punto de entrada**: Espera a que `db` esté disponible

### Servicio `db` (MySQL)

```yaml
image: mysql:8
container_name: mysql_db
restart: always
environment:
  MYSQL_ROOT_PASSWORD: root
  MYSQL_DATABASE: mi_base
volumes:
  - db_data:/var/lib/mysql  # Datos persistentes
ports:
  - "3307:3306"
```

- **Imagen**: MySQL versión 8
- **Reinicio automático**: `always`
- **Almacenamiento**: Los datos se guardan en el volumen `db_data`

### Servicio `phpmyadmin`

```yaml
image: phpmyadmin/phpmyadmin
container_name: phpmyadmin
ports:
  - "8080:80"
environment:
  PMA_HOST: db
```

- **Imagen**: phpMyAdmin oficial
- **Conexión**: Se conecta automáticamente al servicio `db`

## 🔧 Troubleshooting

### El contenedor no inicia

1. Verifica los logs:
   ```bash
   docker-compose logs app
   ```

2. Asegúrate de que los puertos no están en uso:
   ```bash
   # En Windows PowerShell
   netstat -ano | findstr :3307
   netstat -ano | findstr :8080
   ```

### No puedo conectarme a la base de datos

1. Verifica que el contenedor MySQL esté ejecutándose:
   ```bash
   docker-compose ps
   ```

2. Verifica la conectividad:
   ```bash
   docker-compose exec app ping db
   ```

### Los cambios en el código no se reflejan

- El volumen está montado correctamente. Si usas `npm start` con `nodemon`, los cambios se detectarán automáticamente.
- Verifica que `nodemon` esté en tu `package.json`:
  ```json
  {
    "scripts": {
      "start": "nodemon index.js"
    },
    "devDependencies": {
      "nodemon": "^2.0.0"
    }
  }
  ```

### Puerto en uso

Si un puerto ya está en uso, puedes:

1. Cambiar el puerto en `docker-compose.yml`:
   ```yaml
   ports:
     - "3308:3306"  # Cambiar 3307 a otro puerto disponible
   ```

2. O detener el proceso que lo está usando

## 📝 Archivos Importantes

- `docker-compose.yml`: Definición de todos los servicios
- `package.json`: Dependencias de Node.js
- `.env`: Variables de entorno (crear si es necesario)

## 🛑 Parar Correctamente

Siempre es buena práctica detener los servicios correctamente:

```bash
# Detener sin eliminar
docker-compose stop

# O detener y eliminar contenedores pero mantener datos
docker-compose down
```

## ✅ Checklist de Verificación

- [ ] Docker y Docker Compose están instalados
- [ ] El archivo `docker-compose.yml` está en la carpeta correcta
- [ ] Tienes permisos de lectura/escritura en la carpeta del proyecto
- [ ] Los puertos 3307 y 8080 están disponibles
- [ ] Tu `package.json` tiene un script `start`

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los servicios estén corriendo: `docker-compose ps`
3. Intenta reiniciar: `docker-compose restart`
4. Como último recurso: `docker-compose down -v && docker-compose up -d`

---

**Última actualización**: May 2026

**Versiones utilizadas:**
- Node.js: 18
- MySQL: 8
- Docker Compose: 3.8

# CRM Personal — Guía de instalación y despliegue

Este proyecto es un CRM con Next.js + Supabase, con Google Sign-In, roles
(admin / comercial / sin_rol), registro público de clientes, asignación de
comercial, comentarios y eliminación de clientes.

Sigue los pasos **en este orden**: 1) Supabase → 2) Google Cloud Console →
3) Conectar Google con Supabase → 4) Vercel.

---

## 1. Configurar Supabase

1. Entra a tu proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** → **New query**.
3. Copia y pega TODO el contenido del archivo `supabase_schema.sql` (incluido
   en este proyecto) y dale **Run**. Esto crea las tablas `profiles`,
   `clientes`, `comentarios`, los triggers y las políticas de seguridad (RLS).
4. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**

   Los necesitarás en el paso 4.

---

## 2. Crear credenciales OAuth en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com/).
2. Si no tienes un proyecto, créalo: arriba a la izquierda, **Select a
   project → New Project**. Dale un nombre (ej. "CRM Personal") y créalo.
3. Con el proyecto seleccionado, ve al menú ☰ → **APIs & Services →
   OAuth consent screen**.
   - **User Type**: elige **External** → Create.
   - Completa: nombre de la app ("CRM Personal"), correo de soporte (el
     tuyo), correo de contacto del desarrollador (el tuyo).
   - En "Scopes" no necesitas agregar nada especial, solo deja los básicos
     (email, profile, openid) si aparecen por defecto.
   - En "Test users" (si tu app queda en modo "Testing"), agrega los correos
     de Google que vayan a usar el CRM (admins y comerciales). Si prefieres
     que cualquier persona con cuenta Google pueda intentar entrar (y luego
     tú les asignas rol o no), puedes publicar la app a "Production" más
     adelante.
   - Guarda y continúa hasta terminar el asistente.

4. Ahora ve a **APIs & Services → Credentials**.
   - Clic en **+ Create Credentials → OAuth client ID**.
   - **Application type**: Web application.
   - **Name**: "CRM Personal Web".
   - **Authorized JavaScript origins**: agrega:
     ```
     https://TU-PROYECTO.supabase.co
     ```
   - **Authorized redirect URIs**: agrega EXACTAMENTE esta URL (reemplazando
     `TU-PROYECTO` por el ID real de tu proyecto Supabase, lo encuentras en
     Project Settings → API → Project URL):
     ```
     https://TU-PROYECTO.supabase.co/auth/v1/callback
     ```
   - Clic en **Create**.
5. Te aparecerá un **Client ID** y un **Client Secret**. Cópialos, los
   necesitas en el siguiente paso.

---

## 3. Conectar Google con Supabase Auth

1. En Supabase, ve a **Authentication → Providers**.
2. Busca **Google** en la lista y actívalo (toggle "Enable").
3. Pega el **Client ID** y **Client Secret** que generaste en Google Cloud
   Console.
4. Guarda los cambios.
5. Ve a **Authentication → URL Configuration** y configura:
   - **Site URL**: la URL donde vas a publicar el CRM en Vercel (ej.
     `https://crm-personal.vercel.app`). Si aún no la tienes, puedes poner
     `http://localhost:3000` por ahora y luego actualizarla.
   - **Redirect URLs**: agrega ambas, una por línea:
     ```
     http://localhost:3000/auth/callback
     https://TU-DOMINIO-EN-VERCEL.vercel.app/auth/callback
     ```

---

## 4. Probar localmente (opcional pero recomendado)

1. Necesitas tener [Node.js](https://nodejs.org/) instalado (versión 18 o
   superior).
2. En la carpeta del proyecto, copia `.env.local.example` a `.env.local` y
   completa con los valores de Supabase (Project URL y anon key del paso 1).
3. Instala dependencias y corre el proyecto:
   ```bash
   npm install
   npm run dev
   ```
4. Abre `http://localhost:3000`. Te redirige a `/login`. Haz clic en
   **Sign In** y entra con tu cuenta Google.
5. La primera vez quedarás como **"Sin rol"**. Para asignarte Admin, ve a
   Supabase → **Table Editor → profiles**, busca tu fila (por tu email) y
   cambia manualmente la columna `role` a `admin`. Después recarga el CRM:
   ya verás "Gestión de usuarios" en el menú y podrás asignar roles a otros
   desde ahí.

---

## 5. Subir el proyecto a GitHub

1. Crea un repositorio nuevo en GitHub (puede ser privado).
2. En la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "CRM Personal inicial"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

---

## 6. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importa el repositorio de GitHub que acabas de crear.
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu Project URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
4. Clic en **Deploy**.
5. Cuando termine, copia la URL que te asigna Vercel (ej.
   `https://crm-personal.vercel.app`).

### Ajustes finales con la URL real

1. **Google Cloud Console** → Credentials → tu OAuth client → en
   "Authorized JavaScript origins" puedes dejar solo el dominio de Supabase
   (no necesitas agregar el de Vercel ahí).
2. **Supabase** → Authentication → URL Configuration:
   - **Site URL**: pon tu URL real de Vercel.
   - **Redirect URLs**: asegúrate de que esté
     `https://TU-DOMINIO.vercel.app/auth/callback`.

---

## 7. (Opcional) Usar tu dominio de Hostinger

Tu hosting de Hostinger normalmente sirve para sitios PHP/MySQL clásicos y
no es compatible directamente con esta app de Next.js + Supabase. Pero sí
puedes usar **el dominio** que compraste:

1. En Vercel, ve a tu proyecto → **Settings → Domains** → agrega tu dominio
   o un subdominio, ej. `crm.tudominio.com`.
2. Vercel te dará un registro DNS (tipo `CNAME` o `A`) para agregar.
3. En Hostinger, ve a **Dominios → DNS / Nameservers** y agrega ese registro
   tal como Vercel lo indica.
4. Espera la propagación (puede tardar desde minutos hasta unas horas).
5. Actualiza en Supabase la **Site URL** y **Redirect URLs** con el nuevo
   dominio (`https://crm.tudominio.com/auth/callback`).

La base de datos del CRM seguirá viviendo en Supabase (es la opción
correcta); Hostinger solo aporta el nombre de dominio bonito.

---

## Resumen de roles

- **Sin rol**: usuario recién registrado, ve la pantalla "Esperando
  asignación de rol".
- **Comercial**: ve solo los clientes donde `comercial_id` es su propio ID.
  Puede agregar comentarios y editar comercial/estado de SUS clientes (según
  las políticas configuradas).
- **Admin**: ve todos los clientes, puede eliminar, reasignar comercial,
  cambiar estado (activo/inactivo) y gestionar roles de usuarios desde
  "Gestión de usuarios".
- **Sin sesión**: cualquier persona puede acceder a `/registro` y registrar
  un cliente sin necesidad de iniciar sesión.

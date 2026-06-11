-- =========================================================
-- CRM Personal - Schema para Supabase
-- Ejecuta este script completo en: Supabase > SQL Editor > New query
-- =========================================================

-- 1. Tabla de perfiles (roles de usuario)
-- Se crea automáticamente cuando alguien inicia sesión con Google
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'sin_rol' check (role in ('sin_rol', 'comercial', 'admin')),
  created_at timestamptz default now()
);

-- 2. Tabla de clientes
create table if not exists public.clientes (
  id uuid default gen_random_uuid() primary key,
  nombre_empresa text not null,
  nit text,
  direccion_empresa text,
  correo_empresa text,
  nombre_contacto text not null,
  celular text,
  telefono text,
  email_contacto text,
  fecha_solicitud date default current_date,
  comercial_id uuid references public.profiles(id) on delete set null,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Tabla de comentarios sobre clientes
create table if not exists public.comentarios (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references public.clientes(id) on delete cascade not null,
  autor_id uuid references public.profiles(id) on delete set null,
  autor_nombre text,
  contenido text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- 4. Función + Trigger: crear perfil automáticamente al hacer login
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'sin_rol'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 5. Función auxiliar: obtener el rol del usuario actual
-- =========================================================
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- =========================================================
-- 6. Row Level Security (RLS)
-- =========================================================
alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.comentarios enable row level security;

-- ---- PROFILES ----
-- Cualquier usuario autenticado puede ver todos los perfiles (necesario para el selector de comerciales)
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Solo admins pueden actualizar roles de otros usuarios
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.get_my_role() = 'admin');

-- ---- CLIENTES ----
-- Insert: cualquiera (incluso sin sesión / anon) puede registrar un cliente
drop policy if exists "clientes_insert_anyone" on public.clientes;
create policy "clientes_insert_anyone"
  on public.clientes for insert
  with check (true);

-- Select: admin ve todo, comercial ve solo lo suyo
drop policy if exists "clientes_select_role_based" on public.clientes;
create policy "clientes_select_role_based"
  on public.clientes for select
  using (
    public.get_my_role() = 'admin'
    or comercial_id = auth.uid()
  );

-- Update: admin puede actualizar todo, comercial solo sus clientes (para agregar notas/comentarios)
drop policy if exists "clientes_update_role_based" on public.clientes;
create policy "clientes_update_role_based"
  on public.clientes for update
  using (
    public.get_my_role() = 'admin'
    or comercial_id = auth.uid()
  );

-- Delete: solo admin
drop policy if exists "clientes_delete_admin" on public.clientes;
create policy "clientes_delete_admin"
  on public.clientes for delete
  using (public.get_my_role() = 'admin');

-- ---- COMENTARIOS ----
-- Select: visible si puedes ver el cliente asociado
drop policy if exists "comentarios_select_role_based" on public.comentarios;
create policy "comentarios_select_role_based"
  on public.comentarios for select
  using (
    exists (
      select 1 from public.clientes c
      where c.id = comentarios.cliente_id
        and (public.get_my_role() = 'admin' or c.comercial_id = auth.uid())
    )
  );

-- Insert: cualquier usuario autenticado que pueda ver el cliente puede comentar
drop policy if exists "comentarios_insert_role_based" on public.comentarios;
create policy "comentarios_insert_role_based"
  on public.comentarios for insert
  with check (
    exists (
      select 1 from public.clientes c
      where c.id = comentarios.cliente_id
        and (public.get_my_role() = 'admin' or c.comercial_id = auth.uid())
    )
  );

-- Delete: solo admin
drop policy if exists "comentarios_delete_admin" on public.comentarios;
create policy "comentarios_delete_admin"
  on public.comentarios for delete
  using (public.get_my_role() = 'admin');

-- =========================================================
-- 7. Trigger para updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clientes_updated_at on public.clientes;
create trigger clientes_updated_at
  before update on public.clientes
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- LISTO. Ahora ve a Authentication > Providers > Google
-- y configura el Client ID / Secret de Google Cloud Console.
-- =========================================================

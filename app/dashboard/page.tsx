import { createClient } from '@/lib/supabase-server';
import ClientesView from './ClientesView';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user!.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // El RLS ya filtra: admin ve todo, comercial solo lo suyo
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });

  // Lista de comerciales para el selector (solo la necesita el admin, pero no estorba)
  const { data: comerciales } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'comercial')
    .order('full_name');

  return (
    <ClientesView
      initialClientes={clientes || []}
      comerciales={comerciales || []}
      isAdmin={isAdmin}
      currentUserId={user!.id}
    />
  );
}

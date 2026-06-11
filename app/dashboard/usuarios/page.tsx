import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import UsuariosView from './UsuariosView';

export default async function UsuariosPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: usuarios } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .order('created_at', { ascending: true });

  return <UsuariosView initialUsuarios={usuarios || []} currentUserId={user!.id} />;
}

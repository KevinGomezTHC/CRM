import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Sidebar from './Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  // Si el perfil aún no existe (carrera con el trigger), tratamos como sin_rol
  const role = profile?.role || 'sin_rol';

  if (role === 'sin_rol') {
    return (
      <main className="center-screen" style={{ background: '#f1f5f9' }}>
        <div className="center-card on-light">
          <div className="icon-square light-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <circle cx="19" cy="17" r="2" />
              <path d="M19 13.5v.5M19 19.5v.5M21.5 17h-.5M16.5 17H16" />
            </svg>
          </div>
          <h1>Esperando asignación de rol</h1>
          <p className="subtitle" style={{ color: '#64748b' }}>
            Tu cuenta está registrada. Un administrador debe asignarte un rol (Admin o Comercial) para
            acceder al CRM.
          </p>
          <form action="/auth/signout" method="post">
            <button className="btn btn-secondary" formAction="/auth/signout">
              Cerrar sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        fullName={profile?.full_name || user.email || ''}
        role={role as 'admin' | 'comercial'}
      />
      <div className="main-content">{children}</div>
    </div>
  );
}

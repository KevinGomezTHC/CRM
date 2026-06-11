import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import LoginButton from './LoginButton';

export default async function LoginPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="center-screen dark">
      <div className="center-card on-dark">
        <div className="icon-square dark-blue">
          {/* icono grid */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
          </svg>
        </div>
        <h1>CRM Personal</h1>
        <p className="subtitle">Inicia sesión para acceder al panel</p>

        <LoginButton />

        <div style={{ marginTop: 24 }}>
          <a href="/registro" className="link-muted">
            Registrar un cliente sin cuenta
          </a>
        </div>
      </div>
    </main>
  );
}

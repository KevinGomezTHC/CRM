'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({
  fullName,
  role,
}: {
  fullName: string;
  role: 'admin' | 'comercial';
}) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
          </svg>
        </div>
        <div className="titles">
          <strong>CRM Personal</strong>
          <span>{role === 'admin' ? 'Administrador' : 'Comercial'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link
          href="/dashboard"
          className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}
        >
          <span className="link-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Clientes
          </span>
          <span>›</span>
        </Link>

        {role === 'admin' && (
          <Link
            href="/dashboard/usuarios"
            className={`sidebar-link ${pathname === '/dashboard/usuarios' ? 'active' : ''}`}
          >
            <span className="link-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Gestión de usuarios
            </span>
            <span>›</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link href="/registro" className="sidebar-link">
          <span className="link-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Registrar cliente
          </span>
        </Link>

        <div className="user-name">{fullName}</div>

        <form action="/auth/signout" method="post">
          <button type="submit" className="sidebar-link">
            <span className="link-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}

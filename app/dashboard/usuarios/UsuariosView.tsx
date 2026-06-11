'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Usuario = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'sin_rol' | 'comercial' | 'admin';
};

export default function UsuariosView({
  initialUsuarios,
  currentUserId,
}: {
  initialUsuarios: Usuario[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleRoleChange = async (id: string, role: string) => {
    setSavingId(id);
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    setSavingId(null);

    if (!error) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: role as Usuario['role'] } : u))
      );
    }
  };

  const badgeClass = (role: string) => {
    if (role === 'admin') return 'badge-admin';
    if (role === 'comercial') return 'badge-comercial';
    return 'badge-sin-rol';
  };

  const roleLabel = (role: string) => {
    if (role === 'admin') return 'Admin';
    if (role === 'comercial') return 'Comercial';
    return 'Sin rol';
  };

  return (
    <>
      <div className="topbar">
        <h1>Gestión de usuarios</h1>
        <a href="/registro" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Nuevo cliente
        </a>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol actual</th>
                <th>Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${badgeClass(u.role)}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={savingId === u.id}
                    >
                      <option value="sin_rol">Sin rol</option>
                      <option value="comercial">Comercial</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

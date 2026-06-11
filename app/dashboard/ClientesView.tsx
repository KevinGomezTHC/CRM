'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import ClienteModal from './ClienteModal';

export type Cliente = {
  id: string;
  nombre_empresa: string;
  nit: string | null;
  direccion_empresa: string | null;
  correo_empresa: string | null;
  nombre_contacto: string;
  celular: string | null;
  fecha_solicitud: string | null;
  comercial_id: string | null;
  estado: 'activo' | 'inactivo';
  notas: string | null;
  created_at: string;
};

export type Comercial = {
  id: string;
  full_name: string | null;
  email: string;
};

export default function ClientesView({
  initialClientes,
  comerciales,
  isAdmin,
  currentUserId,
}: {
  initialClientes: Cliente[];
  comerciales: Comercial[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const supabase = createClient();
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cliente | null>(null);

  const comercialMap = useMemo(() => {
    const map: Record<string, string> = {};
    comerciales.forEach((c) => {
      map[c.id] = c.full_name || c.email;
    });
    return map;
  }, [comerciales]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter((c) => {
      return (
        c.nombre_empresa.toLowerCase().includes(term) ||
        c.nombre_contacto.toLowerCase().includes(term) ||
        (c.correo_empresa || '').toLowerCase().includes(term) ||
        (c.nit || '').toLowerCase().includes(term)
      );
    });
  }, [clientes, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (!error) {
      setClientes((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  const handleUpdateCliente = (updated: Cliente) => {
    setClientes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  };

  return (
    <>
      <div className="topbar">
        <h1>Todos los clientes</h1>
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
        <div className="search-bar">
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            placeholder="Buscar por nombre, NIT, contacto o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon-square" style={{ margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Sin clientes</h3>
            <p>{search ? 'No se encontraron resultados.' : 'Aún no hay clientes registrados'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Celular</th>
                  <th>Comercial</th>
                  <th>Estado</th>
                  <th>Fecha solicitud</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                    <td>
                      <strong>{c.nombre_empresa}</strong>
                      {c.nit && <div style={{ fontSize: 12, color: '#94a3b8' }}>NIT: {c.nit}</div>}
                    </td>
                    <td>
                      {c.nombre_contacto}
                      {c.correo_empresa && (
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.correo_empresa}</div>
                      )}
                    </td>
                    <td>{c.celular || '—'}</td>
                    <td>{c.comercial_id ? comercialMap[c.comercial_id] || 'Asignado' : '—'}</td>
                    <td>
                      <span className={`badge ${c.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}`}>
                        {c.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{c.fecha_solicitud || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <div className="row-actions">
                          <button className="icon-btn danger" onClick={() => handleDelete(c.id)} title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ClienteModal
          cliente={selected}
          comerciales={comerciales}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdateCliente}
        />
      )}
    </>
  );
}

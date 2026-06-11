'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { Cliente, Comercial } from './ClientesView';

type Comentario = {
  id: string;
  contenido: string;
  autor_nombre: string | null;
  created_at: string;
};

export default function ClienteModal({
  cliente,
  comerciales,
  isAdmin,
  currentUserId,
  onClose,
  onUpdate,
}: {
  cliente: Cliente;
  comerciales: Comercial[];
  isAdmin: boolean;
  currentUserId: string;
  onClose: () => void;
  onUpdate: (updated: Cliente) => void;
}) {
  const supabase = createClient();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    const loadComentarios = async () => {
      const { data } = await supabase
        .from('comentarios')
        .select('id, contenido, autor_nombre, created_at')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false });
      setComentarios(data || []);
    };
    loadComentarios();
  }, [cliente.id, supabase]);

  const handleAddComment = async () => {
    if (!nuevoComentario.trim()) return;
    setSavingComment(true);

    const { data: userData } = await supabase.auth.getUser();
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userData.user!.id)
      .single();

    const autorNombre = profileData?.full_name || profileData?.email || 'Usuario';

    const { data, error } = await supabase
      .from('comentarios')
      .insert({
        cliente_id: cliente.id,
        autor_id: currentUserId,
        autor_nombre: autorNombre,
        contenido: nuevoComentario.trim(),
      })
      .select('id, contenido, autor_nombre, created_at')
      .single();

    setSavingComment(false);

    if (!error && data) {
      setComentarios((prev) => [data, ...prev]);
      setNuevoComentario('');
    }
  };

  const handleFieldChange = async (field: 'comercial_id' | 'estado', value: string) => {
    setSavingField(field);

    const updateValue = field === 'comercial_id' ? (value || null) : value;

    const { data, error } = await supabase
      .from('clientes')
      .update({ [field]: updateValue })
      .eq('id', cliente.id)
      .select()
      .single();

    setSavingField(null);

    if (!error && data) {
      onUpdate(data as Cliente);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{cliente.nombre_empresa}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>NIT</label>
            <div className="value">{cliente.nit || '—'}</div>
          </div>
          <div className="detail-item">
            <label>Correo empresa</label>
            <div className="value">{cliente.correo_empresa || '—'}</div>
          </div>
          <div className="detail-item full">
            <label>Dirección empresa</label>
            <div className="value">{cliente.direccion_empresa || '—'}</div>
          </div>
          <div className="detail-item">
            <label>Persona de contacto</label>
            <div className="value">{cliente.nombre_contacto}</div>
          </div>
          <div className="detail-item">
            <label>Celular</label>
            <div className="value">{cliente.celular || '—'}</div>
          </div>
          <div className="detail-item">
            <label>Fecha de solicitud</label>
            <div className="value">{cliente.fecha_solicitud || '—'}</div>
          </div>

          <div className="detail-item">
            <label>Comercial asignado</label>
            {isAdmin ? (
              <select
                className="role-select"
                value={cliente.comercial_id || ''}
                onChange={(e) => handleFieldChange('comercial_id', e.target.value)}
                disabled={savingField === 'comercial_id'}
              >
                <option value="">Sin asignar</option>
                {comerciales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="value">
                {cliente.comercial_id
                  ? comerciales.find((c) => c.id === cliente.comercial_id)?.full_name || 'Asignado'
                  : '—'}
              </div>
            )}
          </div>

          <div className="detail-item">
            <label>Estado</label>
            {isAdmin ? (
              <select
                className="role-select"
                value={cliente.estado}
                onChange={(e) => handleFieldChange('estado', e.target.value)}
                disabled={savingField === 'estado'}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            ) : (
              <span className={`badge ${cliente.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}`}>
                {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            )}
          </div>

          {cliente.notas && (
            <div className="detail-item full">
              <label>Notas iniciales</label>
              <div className="value">{cliente.notas}</div>
            </div>
          )}
        </div>

        <div className="section-title">Comentarios</div>

        <div className="comment-list">
          {comentarios.length === 0 && (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Aún no hay comentarios.</p>
          )}
          {comentarios.map((com) => (
            <div className="comment-item" key={com.id}>
              <div className="meta">
                <span>{com.autor_nombre || 'Usuario'}</span>
                <span>{new Date(com.created_at).toLocaleString('es-CO')}</span>
              </div>
              <div className="content">{com.contenido}</div>
            </div>
          ))}
        </div>

        <div className="comment-form">
          <textarea
            placeholder="Escribe un comentario sobre este cliente..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddComment}
            disabled={savingComment || !nuevoComentario.trim()}
            style={{ alignSelf: 'flex-end' }}
          >
            {savingComment ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

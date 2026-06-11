'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Comercial = {
  id: string;
  full_name: string | null;
  email: string;
};

export default function RegistroPage() {
  const supabase = createClient();
  const [comerciales, setComerciales] = useState<Comercial[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nombre_empresa: '',
    nit: '',
    direccion_empresa: '',
    correo_empresa: '',
    nombre_contacto: '',
    celular: '',
    comercial_id: '',
    notas: '',
  });

  useEffect(() => {
    const loadComerciales = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'comercial')
        .order('full_name');
      setComerciales(data || []);
    };
    loadComerciales();
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.nombre_empresa.trim() || !form.nombre_contacto.trim()) {
      setError('Nombre de la empresa y nombre de contacto son obligatorios.');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from('clientes').insert({
      nombre_empresa: form.nombre_empresa.trim(),
      nit: form.nit.trim() || null,
      direccion_empresa: form.direccion_empresa.trim() || null,
      correo_empresa: form.correo_empresa.trim() || null,
      nombre_contacto: form.nombre_contacto.trim(),
      celular: form.celular.trim() || null,
      comercial_id: form.comercial_id || null,
      notas: form.notas.trim() || null,
      fecha_solicitud: new Date().toISOString().slice(0, 10),
    });

    setLoading(false);

    if (insertError) {
      setError('Ocurrió un error al registrar el cliente. Intenta nuevamente.');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <main className="center-screen dark">
        <div className="center-card on-dark">
          <div className="icon-square dark-blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1>¡Registro exitoso!</h1>
          <p className="subtitle">
            Tu información fue enviada correctamente. Pronto un comercial se pondrá en contacto contigo.
          </p>
          <a href="/login" className="link-muted">
            Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="center-screen dark" style={{ alignItems: 'flex-start', paddingTop: 60 }}>
      <div className="center-card on-dark" style={{ maxWidth: 600 }}>
        <div className="icon-square dark-blue">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1>Registro de Cliente</h1>
        <p className="subtitle">Complete el formulario para registrar un nuevo cliente</p>

        <form onSubmit={handleSubmit} className="form-card">
          <h2>Información de la empresa</h2>
          <p className="form-hint">Todos los campos marcados con * son obligatorios</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-grid">
            <div className="field full">
              <label>Nombre de la empresa *</label>
              <input
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                placeholder="Empresa S.A.S"
                required
              />
            </div>

            <div className="field">
              <label>NIT</label>
              <input name="nit" value={form.nit} onChange={handleChange} placeholder="900.000.000-0" />
            </div>

            <div className="field">
              <label>Correo de la empresa</label>
              <input
                type="email"
                name="correo_empresa"
                value={form.correo_empresa}
                onChange={handleChange}
                placeholder="contacto@empresa.com"
              />
            </div>

            <div className="field full">
              <label>Dirección de la empresa</label>
              <input
                name="direccion_empresa"
                value={form.direccion_empresa}
                onChange={handleChange}
                placeholder="Calle 00 # 00-00, Ciudad"
              />
            </div>

            <div className="field">
              <label>Nombre de la persona de contacto *</label>
              <input
                name="nombre_contacto"
                value={form.nombre_contacto}
                onChange={handleChange}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="field">
              <label>Celular</label>
              <input
                name="celular"
                value={form.celular}
                onChange={handleChange}
                placeholder="+57 300 000 0000"
              />
            </div>

            <div className="field full">
              <label>Comercial asignado</label>
              <select name="comercial_id" value={form.comercial_id} onChange={handleChange}>
                <option value="">Seleccionar comercial (opcional)</option>
                {comerciales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="field full">
              <label>Notas adicionales</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleChange}
                placeholder="Información relevante sobre el cliente..."
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary full" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Cliente'}
          </button>
        </form>

        <div style={{ marginTop: 20 }}>
          <a href="/login" className="link-muted">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

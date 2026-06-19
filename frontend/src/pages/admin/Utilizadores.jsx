import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

const PERFIL_BADGE = { admin: 'badge bg-purple', gestor: 'badge bg-primary', empresa: 'badge bg-success' };
const PERFIL_LABEL = { admin: 'Admin', gestor: 'Gestor', empresa: 'Empresa' };

const initials = (nome = '') =>
  nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const getDate = (u) => {
  const d = u.created_at || u.createdAt;
  return d ? new Date(d).toLocaleDateString('pt-PT') : '—';
};

const gerarPassword = () => {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;
  const obrigatorio = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const resto = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...obrigatorio, ...resto].sort(() => Math.random() - 0.5).join('');
};

/* ── Modal Detalhes ── */
function DetalheModal({ utilizador, onClose }) {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalhes do Utilizador</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 56, height: 56, background: '#2563eb', fontSize: 20, flexShrink: 0 }}
              >
                {initials(utilizador.nome)}
              </div>
              <div>
                <p className="mb-0 fw-bold">{utilizador.nome}</p>
                <p className="mb-0 text-muted small">{utilizador.email}</p>
              </div>
            </div>
            <table className="table table-sm table-bordered">
              <tbody>
                <tr><th>Perfil</th><td><span className={PERFIL_BADGE[utilizador.perfil] || 'badge bg-secondary'}>{PERFIL_LABEL[utilizador.perfil] || utilizador.perfil}</span></td></tr>
                <tr><th>Estado</th><td><span className={`badge ${utilizador.estado === 'Ativo' ? 'bg-success' : 'bg-danger'}`}>{utilizador.estado}</span></td></tr>
                <tr><th>Telefone</th><td>{utilizador.telefone || '—'}</td></tr>
                <tr><th>Criado em</th><td>{getDate(utilizador)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Criar/Editar ── */
function FormModal({ utilizador, onClose, onSaved }) {
  const isEdit = !!utilizador;
  const [form, setForm] = useState({
    nome:     utilizador?.nome     || '',
    email:    utilizador?.email    || '',
    telefone: utilizador?.telefone || '',
    perfil:   utilizador?.perfil   || 'gestor',
    password: isEdit ? '' : gerarPassword(),
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const regenerar = () => { setCopied(false); set('password', gerarPassword()); };

  const copiar = () => {
    navigator.clipboard.writeText(form.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email) return setError('Nome e email são obrigatórios.');
    setSaving(true); setError('');
    try {
      if (isEdit) {
        const payload = { nome: form.nome, email: form.email, telefone: form.telefone, perfil: form.perfil };
        const { data } = await api.put(`/utilizadores/${utilizador.id}`, payload);
        onSaved(data);
      } else {
        const { data } = await api.post('/utilizadores', form);
        onSaved(data);
      }
    } catch (e) {
      const msg = e.response?.data?.erro || `Erro ${e.response?.status ?? 'de rede'}: ${e.message}`;
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? 'Editar Utilizador' : 'Novo Utilizador'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label fw-semibold">Nome completo</label>
                <input type="text" className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="ex. João Silva" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">E-mail</label>
                <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="joao@empresa.pt" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Telefone</label>
                <input type="text" className="form-control" value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="+351 912 000 000" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Perfil</label>
                <select className="form-select" value={form.perfil} onChange={e => set('perfil', e.target.value)}>
                  <option value="admin">Administrador</option>
                  <option value="gestor">Gestor</option>
                  <option value="empresa">Empresa / Cliente</option>
                </select>
              </div>

              {form.perfil === 'empresa' && !isEdit && (
                <div className="alert alert-info small py-2">
                  Será criada automaticamente uma <strong>empresa cliente</strong> com o nome, email e telefone indicados.
                </div>
              )}

              {!isEdit && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password gerada automaticamente</label>
                  <div className="input-group">
                    <code className="form-control bg-light text-success" style={{ fontFamily: 'monospace' }}>
                      {form.password}
                    </code>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copiar}>
                      {copied ? '✓' : 'Copiar'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={regenerar}>
                      ↻
                    </button>
                  </div>
                  <small className="text-muted">Copia esta password antes de criar — não será mostrada novamente.</small>
                </div>
              )}

              {error && <div className="alert alert-danger small py-2">{error}</div>}

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'A guardar…' : (isEdit ? 'Guardar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function Utilizadores() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filtro, setFiltro]             = useState('todos');
  const [viewModal, setViewModal]       = useState(null);
  const [formModal, setFormModal]       = useState(null);

  const fetchUtilizadores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/utilizadores');
      setUtilizadores(data);
    } catch {
      setUtilizadores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUtilizadores(); }, [fetchUtilizadores]);

  const toggleEstado = async (u) => {
    const next = u.estado === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await api.put(`/utilizadores/${u.id}`, { estado: next });
      setUtilizadores(prev => prev.map(x => x.id === u.id ? { ...x, estado: next } : x));
    } catch { /* silently fail */ }
  };

  const filtered = utilizadores.filter(u => {
    const matchFiltro = filtro === 'todos' || u.perfil === filtro ||
      (filtro === 'gestores' && u.perfil === 'gestor') ||
      (filtro === 'empresas' && u.perfil === 'empresa');
    const q = search.toLowerCase();
    const matchSearch = !q || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchFiltro && matchSearch;
  });

  const counts = {
    todos:    utilizadores.length,
    gestores: utilizadores.filter(u => u.perfil === 'gestor').length,
    empresas: utilizadores.filter(u => u.perfil === 'empresa').length,
  };

  return (
    <AdminLayout>

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Gestão de Utilizadores</h4>
          <p className="text-muted mb-0">
            {utilizadores.length} utilizador{utilizadores.length !== 1 ? 'es' : ''} registado{utilizadores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormModal('new')}>
          + Novo Utilizador
        </button>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Pesquisar por nome ou e-mail…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-7">
              <div className="d-flex gap-2">
                {[
                  { key: 'todos',    label: 'Todos'    },
                  { key: 'gestores', label: 'Gestores' },
                  { key: 'empresas', label: 'Empresas' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={`btn btn-sm ${filtro === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFiltro(key)}
                  >
                    {label} ({counts[key] ?? 0})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>Utilizador</th>
              <th>Telefone</th>
              <th>Perfil</th>
              <th>Estado</th>
              <th>Criado em</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  A carregar…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">Nenhum utilizador encontrado.</td>
              </tr>
            ) : filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: 36, height: 36, background: '#2563eb', fontSize: 13, flexShrink: 0 }}
                    >
                      {initials(u.nome)}
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold small">{u.nome}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="small">{u.telefone || '—'}</td>
                <td>
                  <span className={PERFIL_BADGE[u.perfil] || 'badge bg-secondary'}>
                    {PERFIL_LABEL[u.perfil] || u.perfil}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.estado === 'Ativo' ? 'bg-success' : 'bg-danger'}`}>
                    {u.estado || 'Ativo'}
                  </span>
                </td>
                <td className="small text-muted">{getDate(u)}</td>
                <td className="text-center">
                  <div className="d-flex gap-1 justify-content-center">
                    <button className="btn btn-outline-info btn-sm" title="Ver detalhes" onClick={() => setViewModal(u)}>👁</button>
                    {u.perfil !== 'admin' && (
                      <>
                        <button className="btn btn-outline-warning btn-sm" title="Editar" onClick={() => setFormModal(u)}>✏</button>
                        <button
                          className={`btn btn-sm ${u.estado === 'Ativo' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          title={u.estado === 'Ativo' ? 'Desativar' : 'Ativar'}
                          onClick={() => toggleEstado(u)}
                        >
                          {u.estado === 'Ativo' ? '✗' : '✓'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewModal && <DetalheModal utilizador={viewModal} onClose={() => setViewModal(null)} />}

      {(formModal === 'new' || (formModal && typeof formModal === 'object')) && (
        <FormModal
          utilizador={formModal === 'new' ? null : formModal}
          onClose={() => setFormModal(null)}
          onSaved={(saved) => {
            setFormModal(null);
            setUtilizadores(prev => {
              const exists = prev.find(u => u.id === saved.id);
              if (exists) return prev.map(u => u.id === saved.id ? saved : u);
              return [saved, ...prev];
            });
          }}
        />
      )}

    </AdminLayout>
  );
}

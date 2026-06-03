import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  FiPlus, FiSearch, FiEye, FiEdit2, FiToggleLeft, FiToggleRight,
  FiX, FiCheck, FiUser, FiMail, FiPhone, FiShield,
} from 'react-icons/fi';

/* ── helpers ── */
const PERFIL_LABEL  = { admin: 'Admin',   gestor: 'Gestor', empresa: 'Empresa' };
const PERFIL_COLOR  = { admin: '#7c3aed', gestor: '#2563eb', empresa: '#059669' };
const PERFIL_BG     = { admin: '#ede9fe', gestor: '#dbeafe', empresa: '#d1fae5' };

const initials = (nome = '') =>
  nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const AVATAR_COLORS = [
  '#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899',
];
const avatarColor = (nome = '') => {
  let h = 0;
  for (let c of nome) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const getDate = (u) => {
  const d = u.created_at || u.createdAt;
  return d ? new Date(d).toLocaleDateString("pt-PT") : "—";
};

/* ── badge components ── */
function PerfilBadge({ perfil }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: PERFIL_BG[perfil] || '#f1f5f9',
      color: PERFIL_COLOR[perfil] || '#64748b',
    }}>
      {PERFIL_LABEL[perfil] || perfil}
    </span>
  );
}

function EstadoBadge({ estado }) {
  const ok = estado === 'Ativo';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: ok ? '#dcfce7' : '#fee2e2',
      color: ok ? '#16a34a' : '#dc2626',
    }}>
      {ok ? <FiCheck size={11} /> : <FiX size={11} />}
      {estado || 'Ativo'}
    </span>
  );
}

/* ── modal ── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 14, width: 480, maxWidth: '95vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: 4,
          }}><FiX size={18} /></button>
        </div>
        <div style={{ padding: '1.4rem' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── detail modal ── */
function DetalheModal({ utilizador, onClose }) {
  const bg = avatarColor(utilizador.nome);
  return (
    <Modal title="Detalhes do Utilizador" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff',
            fontSize: 22, fontWeight: 700, flexShrink: 0,
          }}>
            {initials(utilizador.nome)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{utilizador.nome}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{utilizador.email}</p>
          </div>
        </div>

        {[
          { icon: FiShield, label: 'Perfil', value: <PerfilBadge perfil={utilizador.perfil} /> },
          { icon: FiCheck,  label: 'Estado', value: <EstadoBadge estado={utilizador.estado} /> },
          { icon: FiPhone,  label: 'Telefone', value: utilizador.telefone || '—' },
          { icon: FiMail,   label: 'Criado em', value: getDate(utilizador) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.7rem 1rem', borderRadius: 10,
            background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            <Icon size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── gera password aleatória segura ── */
const gerarPassword = () => {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;
  // garante pelo menos 1 de cada categoria
  const obrigatorio = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const resto = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...obrigatorio, ...resto]
    .sort(() => Math.random() - 0.5)
    .join('');
};

/* ── form modal ── */
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

  const regenerar = () => {
    setCopied(false);
    set('password', gerarPassword());
  };

  const copiar = () => {
    navigator.clipboard.writeText(form.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSubmit = async () => {
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
      console.error('Erro ao guardar utilizador:', e.response ?? e);
      const msg =
        e.response?.data?.erro ||
        e.response?.data?.message ||
        (e.response?.status === 401 ? 'Sem autorização — faz login novamente.' :
         e.response?.status === 403 ? 'Sem permissão (requer perfil admin).' :
         e.response?.status === 404 ? 'Rota não encontrada no servidor.' :
         `Erro ${e.response?.status ?? 'de rede'}: ${e.message}`);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { id: 'nome',     label: 'Nome completo', type: 'text',  icon: FiUser,  placeholder: 'ex. João Silva' },
    { id: 'email',    label: 'E-mail',        type: 'email', icon: FiMail,  placeholder: 'joao@empresa.pt' },
    { id: 'telefone', label: 'Telefone',      type: 'text',  icon: FiPhone, placeholder: '+351 912 000 000' },
  ];

  return (
    <Modal title={isEdit ? 'Editar Utilizador' : 'Novo Utilizador'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {fields.map(({ id, label, type, icon: Icon, placeholder }) => (
          <label key={id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</span>
            <div style={{ position: 'relative' }}>
              <Icon size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={type}
                value={form[id]}
                onChange={e => set(id, e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '0.55rem 0.75rem 0.55rem 2rem',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  fontSize: 13, color: '#0f172a', outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>
          </label>
        ))}

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Perfil</span>
          <select
            value={form.perfil}
            onChange={e => set('perfil', e.target.value)}
            style={{
              padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, color: '#0f172a',
              background: '#f8fafc', outline: 'none',
            }}
          >
            <option value="admin">Admin</option>
            <option value="gestor">Gestor</option>
            <option value="empresa">Empresa</option>
          </select>
        </label>

        {/* password gerada automaticamente — só ao criar */}
        {!isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
              Password gerada automaticamente
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.5rem 0.75rem',
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
            }}>
              <FiShield size={14} color="#16a34a" style={{ flexShrink: 0 }} />
              <code style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', color: '#15803d', letterSpacing: '0.05em', userSelect: 'all' }}>
                {form.password}
              </code>
              <button onClick={copiar} title="Copiar" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: copied ? '#16a34a' : '#64748b', padding: '2px 4px', fontSize: 11, fontWeight: 600,
              }}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
              <button onClick={regenerar} title="Gerar nova" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', padding: '2px 4px', fontSize: 11, fontWeight: 600,
              }}>
                ↻ Nova
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
              Copia esta password antes de criar — não será mostrada novamente.
            </p>
          </div>
        )}

        {error && (
          <p style={{ margin: 0, fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: 7 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} style={{
            padding: '0.55rem 1.1rem', borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#fff',
            color: '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: '0.55rem 1.3rem', borderRadius: 8,
            border: 'none', background: '#2563eb',
            color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600,
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'A guardar…' : (isEdit ? 'Guardar' : 'Criar')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
export default function Utilizadores() {
  const { utilizador: authUser } = useAuth();
  const isDemo = localStorage.getItem('token') === 'demo-token';

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

  /* filter + search */
  const filtered = utilizadores.filter(u => {
    const matchFiltro =
      filtro === 'todos' ||
      (filtro === 'gestores' && u.perfil === 'gestor') ||
      (filtro === 'empresas' && u.perfil === 'empresa') ||
      u.perfil === filtro;
    const q = search.toLowerCase();
    const matchSearch = !q || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchFiltro && matchSearch;
  });

  /* counts */
  const counts = {
    todos:    utilizadores.length,
    gestores: utilizadores.filter(u => u.perfil === 'gestor').length,
    empresas: utilizadores.filter(u => u.perfil === 'empresa').length,
  };

  return (
    <AdminLayout>
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* ── header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
            Gestão de Utilizadores
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {utilizadores.length} utilizador{utilizadores.length !== 1 ? 'es' : ''} registado{utilizadores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setFormModal('new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '0.6rem 1.2rem', borderRadius: 10,
            border: 'none', background: '#2563eb',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
          }}
        >
          <FiPlus size={16} /> Novo Utilizador
        </button>
      </div>

      {/* ── toolbar ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 460 }}>
          <FiSearch size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou e-mail…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.58rem 0.85rem 0.58rem 2.1rem',
              border: '1px solid #e2e8f0', borderRadius: 10,
              fontSize: 13.5, color: '#0f172a', outline: 'none',
              background: '#fff',
            }}
          />
        </div>

        {/* filter tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'todos',    label: 'Todos' },
            { key: 'gestores', label: 'Gestores' },
            { key: 'empresas', label: 'Empresas' },
          ].map(({ key, label }) => {
            const active = filtro === key;
            return (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 9,
                  border: active ? 'none' : '1px solid #e2e8f0',
                  background: active ? '#2563eb' : '#fff',
                  color: active ? '#fff' : '#475569',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label} ({counts[key] ?? 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── table ── */}
      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 1.8fr 1fr 1fr 1.2fr 1fr',
          padding: '0.7rem 1.2rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
        }}>
          {['UTILIZADOR', 'CONTACTO', 'PERFIL', 'ESTADO', 'CRIADO EM', 'AÇÕES'].map(col => (
            <span key={col} style={{
              fontSize: 11, fontWeight: 700, color: '#94a3b8',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {col}
            </span>
          ))}
        </div>

        {/* rows */}
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            A carregar…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Nenhum utilizador encontrado.
          </div>
        ) : (
          filtered.map((u, i) => {
            const bg = avatarColor(u.nome);
            const isAdmin = u.perfil === 'admin';
            return (
              <div
                key={u.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1.8fr 1fr 1fr 1.2fr 1fr',
                  padding: '0.85rem 1.2rem',
                  alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {/* user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff',
                    fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>
                    {initials(u.nome)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.nome}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{u.email}</p>
                  </div>
                </div>

                {/* contacto */}
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>{u.telefone || '—'}</p>
                </div>

                {/* perfil */}
                <div>
                  <PerfilBadge perfil={u.perfil} />
                </div>

                {/* estado */}
                <div>
                  <EstadoBadge estado={u.estado} />
                </div>

                {/* criado em */}
                <div>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    {getDate(u)}
                  </span>
                </div>

                {/* ações */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {/* view */}
                  <ActionBtn title="Ver detalhes" onClick={() => setViewModal(u)}>
                    <FiEye size={14} />
                  </ActionBtn>

                  {/* edit (not admin) */}
                  {!isAdmin && (
                    <ActionBtn title="Editar" onClick={() => setFormModal(u)}>
                      <FiEdit2 size={14} />
                    </ActionBtn>
                  )}

                  {/* toggle estado (not admin) */}
                  {!isAdmin && (
                    <ActionBtn
                      title={u.estado === 'Ativo' ? 'Desativar' : 'Ativar'}
                      onClick={() => toggleEstado(u)}
                      color={u.estado === 'Ativo' ? '#16a34a' : '#dc2626'}
                    >
                      {u.estado === 'Ativo'
                        ? <FiToggleRight size={16} />
                        : <FiToggleLeft size={16} />}
                    </ActionBtn>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── modals ── */}
      {viewModal && (
        <DetalheModal utilizador={viewModal} onClose={() => setViewModal(null)} />
      )}

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
    </div>
    </AdminLayout>
  );
}

/* small icon button */
function ActionBtn({ title, onClick, color = '#64748b', children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 7, border: '1px solid #e2e8f0',
        background: '#fff', cursor: 'pointer', color,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {children}
    </button>
  );
}

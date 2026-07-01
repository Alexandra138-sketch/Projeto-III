import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Plus, Search, Eye, Edit2, ToggleLeft, ToggleRight,
  X, Check, User, Mail, Phone, Shield, Info, Users, Loader,
} from 'lucide-react';

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
    <span className="badge-pill" style={{ background: PERFIL_BG[perfil] || '#f1f5f9', color: PERFIL_COLOR[perfil] || '#64748b' }}>
      {PERFIL_LABEL[perfil] || perfil}
    </span>
  );
}

function EstadoBadge({ estado }) {
  const ok = estado === 'Ativo';
  return (
    <span className="badge-pill" style={{ background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#16a34a' : '#dc2626' }}>
      {ok ? <Check size={11} /> : <X size={11} />} {estado || 'Ativo'}
    </span>
  );
}

/* ── modal base ── */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>{title}</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
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
          { icon: Shield, label: 'Perfil', value: <PerfilBadge perfil={utilizador.perfil} /> },
          { icon: Check,  label: 'Estado', value: <EstadoBadge estado={utilizador.estado} /> },
          { icon: Phone,  label: 'Telefone', value: utilizador.telefone || '—' },
          { icon: Mail,   label: 'Criado em', value: getDate(utilizador) },
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
    nome:                    utilizador?.nome     || '',
    email:                   utilizador?.email    || '',
    telefone:                utilizador?.telefone || '',
    perfil:                  utilizador?.perfil   || 'gestor',
    password:                isEdit ? '' : gerarPassword(),
    // Campos extra só usados ao criar um novo utilizador com perfil empresa
    resp_seguranca_nome:     '',
    resp_seguranca_email:    '',
    resp_seguranca_telefone: '',
    contacto_perm_nome:      '',
    contacto_perm_email:     '',
    contacto_perm_telefone:  '',
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  // ID do cliente associado (só relevante ao editar utilizador empresa)
  const [clienteId, setClienteId] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Ao editar um utilizador empresa, buscar o cliente associado para pré-preencher os campos de contacto
  useEffect(() => {
    if (!isEdit || utilizador.perfil !== 'empresa') return;
    api.get('/clientes').then(({ data }) => {
      const c = data.find(cli => cli.utilizador_id === utilizador.id);
      if (c) {
        setClienteId(c.id);
        setForm(prev => ({
          ...prev,
          resp_seguranca_nome:     c.resp_seguranca_nome     || '',
          resp_seguranca_email:    c.resp_seguranca_email    || '',
          resp_seguranca_telefone: c.resp_seguranca_telefone || '',
          contacto_perm_nome:      c.contacto_perm_nome      || '',
          contacto_perm_email:     c.contacto_perm_email     || '',
          contacto_perm_telefone:  c.contacto_perm_telefone  || '',
        }));
      }
    }).catch(() => {});
  }, []); // eslint-disable-line

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

        // Se for empresa, também atualizar o registo de cliente com os contactos
        if (form.perfil === 'empresa' && clienteId) {
          await api.put(`/clientes/update/${clienteId}`, {
            nome:                    form.nome,
            email:                   form.email,
            telefone:                form.telefone,
            resp_seguranca_nome:     form.resp_seguranca_nome     || null,
            resp_seguranca_email:    form.resp_seguranca_email    || null,
            resp_seguranca_telefone: form.resp_seguranca_telefone || null,
            contacto_perm_nome:      form.contacto_perm_nome      || null,
            contacto_perm_email:     form.contacto_perm_email     || null,
            contacto_perm_telefone:  form.contacto_perm_telefone  || null,
          });
        }

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
    { id: 'nome',     label: 'Nome completo', type: 'text',  icon: User,  placeholder: 'ex. João Silva' },
    { id: 'email',    label: 'E-mail',        type: 'email', icon: Mail,  placeholder: 'joao@empresa.pt' },
    { id: 'telefone', label: 'Telefone',      type: 'text',  icon: Phone, placeholder: '+351 912 000 000' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>{isEdit ? 'Editar Utilizador' : 'Novo Utilizador'}</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {fields.map(({ id, label, type, icon: Icon, placeholder }) => (
            <div className="mb-3" key={id}>
              <label className="form-label"><Icon size={13} style={{ marginRight: 5, verticalAlign: -2 }} />{label}</label>
              <input
                type={type}
                className="form-input"
                value={form[id]}
                onChange={e => set(id, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Perfil</label>
            <select className="form-select" value={form.perfil} onChange={e => set('perfil', e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="gestor">Gestor</option>
              <option value="empresa">Empresa / Cliente</option>
            </select>
          </div>

          {/* aviso quando perfil = empresa */}
          {form.perfil === 'empresa' && !isEdit && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '0.65rem 0.9rem', borderRadius: 8, marginBottom: '0.9rem',
              background: '#eff6ff', border: '1px solid #bfdbfe',
            }}>
              <Info size={14} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#1d4ed8', lineHeight: 1.5 }}>
                Será criada automaticamente uma <strong>empresa cliente</strong> com o nome, email e telefone indicados. O utilizador poderá entrar na área de empresa.
              </p>
            </div>
          )}

          {/* Campos extra de contacto — ao criar OU editar utilizador empresa */}
          {form.perfil === 'empresa' && (
            <div style={{
              padding: '0.9rem', borderRadius: 8, marginBottom: '0.9rem',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: '0.65rem',
            }}>
              {/* Responsável de Segurança */}
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Responsável de Segurança
              </p>
              {[
                { id: 'resp_seguranca_nome',     label: 'Nome',     type: 'text',  ph: 'ex. Maria Santos'  },
                { id: 'resp_seguranca_email',    label: 'E-mail',   type: 'email', ph: 'maria@empresa.pt'  },
                { id: 'resp_seguranca_telefone', label: 'Telefone', type: 'text',  ph: '+351 912 000 000'  },
              ].map(({ id, label, type, ph }) => (
                <div key={id}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    value={form[id]}
                    onChange={e => set(id, e.target.value)}
                    placeholder={ph}
                  />
                </div>
              ))}

              {/* Contacto Permanente */}
              <p style={{ margin: '0.25rem 0 0', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Contacto Permanente
              </p>
              {[
                { id: 'contacto_perm_nome',      label: 'Nome',     type: 'text',  ph: 'ex. Pedro Costa'   },
                { id: 'contacto_perm_email',     label: 'E-mail',   type: 'email', ph: 'pedro@empresa.pt'  },
                { id: 'contacto_perm_telefone',  label: 'Telefone', type: 'text',  ph: '+351 913 000 000'  },
              ].map(({ id, label, type, ph }) => (
                <div key={id}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    value={form[id]}
                    onChange={e => set(id, e.target.value)}
                    placeholder={ph}
                  />
                </div>
              ))}
            </div>
          )}

          {/* password gerada automaticamente — só ao criar */}
          {!isEdit && (
            <div className="mb-3">
              <label className="form-label">Password gerada automaticamente</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 0.75rem',
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              }}>
                <Shield size={14} color="#16a34a" style={{ flexShrink: 0 }} />
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
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>
                Copia esta password antes de criar — não será mostrada novamente.
              </p>
            </div>
          )}

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: 7 }}>
              {error}
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="btn-guardar" disabled={saving} onClick={handleSubmit}>
            {saving ? 'A guardar…' : (isEdit ? 'Guardar' : 'Criar')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* small icon button */
function ActionBtn({ title, onClick, color = '#64748b', children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 7, border: 'none',
        background: '#f1f5f9', cursor: 'pointer', color,
      }}
    >
      {children}
    </button>
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
    admins:   utilizadores.filter(u => u.perfil === 'admin').length,
  };

  return (
    <AdminLayout>

      {/* Cabeçalho */}
      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Gestão de Utilizadores</h4>
          <p className="incidentes-subtitulo">
            {loading ? 'A carregar…' : `${utilizadores.length} utilizador${utilizadores.length !== 1 ? 'es' : ''} registado${utilizadores.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button className="btn-gradient" onClick={() => setFormModal('new')}>
          <Plus size={16} /> Novo Utilizador
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="resumo-cards">
        {[
          { numero: loading ? '…' : counts.gestores, label: 'Gestores', classe: 'card-aberto'  },
          { numero: loading ? '…' : counts.empresas, label: 'Empresas', classe: 'card-nis2'    },
          { numero: loading ? '…' : counts.admins,   label: 'Admins',   classe: 'card-critico' },
          { numero: loading ? '…' : counts.todos,    label: 'Total',    classe: 'card-total'   },
        ].map(({ numero, label, classe }) => (
          <div key={label} className={`resumo-card ${classe}`}>
            <p className="resumo-numero">{numero}</p>
            <p className="resumo-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="dash-card filtros-bar">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="pesquisa-wrapper">
            <Search size={15} />
            <input
              placeholder="Pesquisar por nome ou e-mail…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="todos">Todos os perfis ({counts.todos})</option>
            <option value="gestores">Gestores ({counts.gestores})</option>
            <option value="empresas">Empresas ({counts.empresas})</option>
          </select>
          <span className="filtros-count ms-auto">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Estados: a carregar / vazio / lista */}
      {loading ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar utilizadores…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          <Users size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>Nenhum utilizador encontrado.</p>
        </div>
      ) : (
        filtered.map((u) => {
          const bg = avatarColor(u.nome);
          const isAdmin = u.perfil === 'admin';
          return (
            <div key={u.id} className="dash-card incidente-card">
              <div className="d-flex align-items-start gap-3">

                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff',
                  fontSize: 14, fontWeight: 700,
                }}>
                  {initials(u.nome)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <p className="incidente-nome">{u.nome}</p>
                    <PerfilBadge perfil={u.perfil} />
                    <EstadoBadge estado={u.estado} />
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    <span className="incidente-data"><Mail size={12} /> {u.email}</span>
                    {u.telefone && <span className="incidente-data"><Phone size={12} /> {u.telefone}</span>}
                    <span className="incidente-data">Criado em {getDate(u)}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="d-flex gap-2 flex-shrink-0">
                  <ActionBtn title="Ver detalhes" onClick={() => setViewModal(u)}>
                    <Eye size={14} />
                  </ActionBtn>

                  {!isAdmin && (
                    <ActionBtn title="Editar" onClick={() => setFormModal(u)}>
                      <Edit2 size={14} />
                    </ActionBtn>
                  )}

                  {!isAdmin && (
                    <ActionBtn
                      title={u.estado === 'Ativo' ? 'Desativar' : 'Ativar'}
                      onClick={() => toggleEstado(u)}
                      color={u.estado === 'Ativo' ? '#16a34a' : '#dc2626'}
                    >
                      {u.estado === 'Ativo' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </ActionBtn>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Modais */}
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

    </AdminLayout>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Mail, Phone, FileText,
  AlertTriangle, MessageSquare, ChevronRight,
  CheckCircle, XCircle, Loader, UserCog, X,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

/* ── Cor gerada a partir do ID ── */
const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) {
  return CORES[(parseInt(id, 10) - 1) % CORES.length];
}

/* ── Modal para atribuir gestor ── */
function ModalAtribuirGestor({ cliente, gestores, onClose, onGuardar }) {
  const [gestorId, setGestorId] = useState(cliente.gestor_id || '');
  const [a_guardar, setAGuardar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    await onGuardar(cliente.id, gestorId || null);
    setAGuardar(false);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Atribuir Gestor</h5>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{cliente.nome}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Gestor Responsável
            </label>
            <select
              value={gestorId}
              onChange={(e) => setGestorId(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#f8fafc' }}
            >
              <option value="">— Sem gestor atribuído —</option>
              {gestores.map((g) => (
                <option key={g.id} value={g.id}>{g.nome} ({g.email})</option>
              ))}
            </select>

            {/* Gestor atual */}
            {cliente.gestor_nome && (
              <p style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#64748b' }}>
                Atual: <strong style={{ color: '#2563eb' }}>{cliente.gestor_nome}</strong>
              </p>
            )}
          </div>

          {/* Rodapé */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={a_guardar}
              style={{ padding: '0.5rem 1.3rem', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: a_guardar ? 0.7 : 1 }}>
              {a_guardar ? 'A guardar…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminClientes() {
  const navigate = useNavigate();

  const [clientes, setClientes]           = useState([]);
  const [gestores, setGestores]           = useState([]);
  const [carregando, setCarregando]       = useState(true);
  const [erro, setErro]                   = useState('');
  const [pesquisa, setPesquisa]           = useState('');
  const [filtroAtivo, setFiltroAtivo]     = useState('all');
  const [modalGestor, setModalGestor]     = useState(null); // cliente a editar

  /* ── Buscar clientes e gestores da BD ── */
  useEffect(() => {
    Promise.all([api.get('/clientes'), api.get('/utilizadores')])
      .then(([c, u]) => {
        setClientes(c.data);
        setGestores(u.data.filter((u) => u.perfil === 'gestor'));
      })
      .catch(() => setErro('Não foi possível carregar os dados.'))
      .finally(() => setCarregando(false));
  }, []);

  /* ── Atribuir gestor ── */
  const handleAtribuirGestor = async (clienteId, gestorId) => {
    try {
      await api.put(`/clientes/update/${clienteId}`, { gestor_id: gestorId });
      // Atualizar localmente
      const gestor = gestores.find((g) => String(g.id) === String(gestorId));
      setClientes((prev) => prev.map((c) =>
        c.id === clienteId
          ? { ...c, gestor_id: gestorId, gestor_nome: gestor?.nome || null }
          : c
      ));
      setModalGestor(null);
    } catch (err) {
      console.error('Erro ao atribuir gestor:', err);
    }
  };

  /* ── Filtros ── */
  const filtrados = clientes.filter((c) => {
    const matchP = c.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   c.email.toLowerCase().includes(pesquisa.toLowerCase());
    const ativo  = c.estado === 'Ativo';
    const matchA = filtroAtivo === 'all'
      || (filtroAtivo === 'active'   && ativo)
      || (filtroAtivo === 'inactive' && !ativo);
    return matchP && matchA;
  });

  const totalAtivos   = clientes.filter((c) => c.estado === 'Ativo').length;
  const totalInativos = clientes.filter((c) => c.estado !== 'Ativo').length;

  return (
    <AdminLayout>

      {/* Cabeçalho */}
      <div className="clientes-header">
        <div>
          <h4 className="clientes-titulo">Gestão de Clientes</h4>
          <p className="clientes-subtitulo">
            {carregando ? 'A carregar…' : `${totalAtivos} cliente${totalAtivos !== 1 ? 's' : ''} ativo${totalAtivos !== 1 ? 's' : ''} · ${totalInativos} inativo${totalInativos !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="clientes-total-badge">
          <Users size={16} />
          {clientes.length} no total
        </div>
      </div>

      {/* Filtros */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div className="pesquisa-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input
            placeholder="Pesquisar por nome ou e-mail..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <div className="filtro-tabs">
          {[
            { k: 'all',      l: 'Todos'   },
            { k: 'active',   l: 'Ativos'  },
            { k: 'inactive', l: 'Inativos'},
          ].map((opt) => (
            <button
              key={opt.k}
              className={`filtro-tab ${filtroAtivo === opt.k ? 'ativo' : 'inativo-tab'}`}
              onClick={() => setFiltroAtivo(opt.k)}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Estados: a carregar / erro / vazio / lista */}
      {carregando ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar clientes…</p>
        </div>
      ) : erro ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
          <AlertTriangle size={28} style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>{erro}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          {pesquisa
            ? 'Nenhum cliente corresponde à pesquisa.'
            : 'Ainda não existem clientes registados.'}
        </div>
      ) : (
        filtrados.map((c) => {
          const ativo = c.estado === 'Ativo';
          const cor   = getCor(c.id);

          return (
            <button
              key={c.id}
              className="cliente-card"
              onClick={() => navigate(`/admin/clientes/${c.id}`)}
            >
              <div className="d-flex align-items-start gap-3">

                {/* Avatar */}
                <div
                  className="cliente-avatar"
                  style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: ativo ? cor : '#94a3b8' }}
                >
                  {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <p className="cliente-nome">{c.nome}</p>
                    <span
                      className="badge-pill"
                      style={{ background: ativo ? '#dcfce7' : '#f1f5f9', color: ativo ? '#16a34a' : '#94a3b8' }}
                    >
                      {ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {' '}{ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    {c.incidentes_abertos > 0 && (
                      <span className="badge-pill" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <AlertTriangle size={10} />
                        {' '}{c.incidentes_abertos} incidente{c.incidentes_abertos > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-3 mb-2">
                    {c.email    && <span className="perfil-meta"><Mail  size={12} /> {c.email}</span>}
                    {c.telefone && <span className="perfil-meta"><Phone size={12} /> {c.telefone}</span>}
                  </div>

                  <div className="d-flex flex-wrap gap-4">
                    {[
                      { Icone: FileText,      cor: '#3b82f6', val: c.total_documentos,  label: 'documentos' },
                      { Icone: AlertTriangle, cor: '#f97316', val: c.total_incidentes,  label: 'incidentes' },
                      { Icone: MessageSquare, cor: '#22c55e', val: c.total_mensagens,   label: 'mensagens'  },
                    ].map(({ Icone, cor: iconCor, val, label }) => (
                      <span key={label} className="cliente-metrica">
                        <Icone size={13} color={iconCor} />
                        <strong>{val ?? 0}</strong> {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gestor + botão atribuir + seta */}
                <div className="d-none d-lg-flex flex-column align-items-end gap-1" style={{ flexShrink: 0, minWidth: 180 }}>
                  <div className="text-end">
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Gestor responsável</p>
                    {c.gestor_nome
                      ? <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', margin: 0 }}>{c.gestor_nome}</p>
                      : <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Não atribuído</p>
                    }
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalGestor(c); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.65rem', borderRadius: 6, border: '1.5px solid #dbeafe', background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    title="Atribuir / alterar gestor"
                  >
                    <UserCog size={13} /> Atribuir gestor
                  </button>
                  {c.created_at && (
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                      Desde {new Date(c.created_at).toLocaleDateString('pt-PT')}
                    </p>
                  )}
                </div>

                <ChevronRight size={18} color="#d1d5db" style={{ flexShrink: 0, marginTop: 2 }} />
              </div>
            </button>
          );
        })
      )}

      {/* Modal atribuir gestor */}
      {modalGestor && (
        <ModalAtribuirGestor
          cliente={modalGestor}
          gestores={gestores}
          onClose={() => setModalGestor(null)}
          onGuardar={handleAtribuirGestor}
        />
      )}

    </AdminLayout>
  );
}

export default AdminClientes;

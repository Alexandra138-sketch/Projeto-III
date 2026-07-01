import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Mail, Phone, FileText,
  AlertTriangle, MessageSquare, CheckCircle, XCircle, UserCog, Loader,
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h5>Atribuir Gestor</h5>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{cliente.nome}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Gestor Responsável</label>
              <select
                className="form-select"
                value={gestorId}
                onChange={(e) => setGestorId(e.target.value)}
              >
                <option value="">— Sem gestor atribuído —</option>
                {gestores.map((g) => (
                  <option key={g.id} value={g.id}>{g.nome} ({g.email})</option>
                ))}
              </select>

              {cliente.gestor_nome && (
                <p style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#64748b' }}>
                  Atual: <strong style={{ color: '#2563eb' }}>{cliente.gestor_nome}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={a_guardar}>
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
      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Gestão de Clientes</h4>
          <p className="incidentes-subtitulo">
            {carregando ? 'A carregar…' : `${clientes.length} clientes · ${totalAtivos} ativos · ${totalInativos} inativos`}
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="resumo-cards">
        {[
          { numero: carregando ? '…' : totalAtivos,     label: 'Ativos',   classe: 'card-aberto'  },
          { numero: carregando ? '…' : totalInativos,   label: 'Inativos', classe: 'card-critico' },
          { numero: carregando ? '…' : clientes.length, label: 'Total',    classe: 'card-total'   },
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
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>
          <select value={filtroAtivo} onChange={(e) => setFiltroAtivo(e.target.value)}>
            <option value="all">Todos os estados</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <span className="filtros-count ms-auto">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
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
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          <Users size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>
            {pesquisa
              ? 'Nenhum cliente corresponde à pesquisa.'
              : 'Ainda não existem clientes registados.'}
          </p>
        </div>
      ) : (
        filtrados.map((c) => {
          const ativo = c.estado === 'Ativo';
          const cor   = getCor(c.id);

          return (
            <div
              key={c.id}
              className="dash-card incidente-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/admin/clientes/${c.id}`)}
            >
              <div className="d-flex align-items-start gap-3">

                {/* Avatar */}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: ativo ? `${cor}1a` : '#f1f5f9',
                    color: ativo ? cor : '#94a3b8',
                    fontWeight: 700, fontSize: '0.8rem',
                  }}
                >
                  {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <p className="incidente-nome">{c.nome}</p>
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

                  <div className="d-flex flex-wrap gap-3">
                    {c.email    && <span className="incidente-data"><Mail  size={12} /> {c.email}</span>}
                    {c.telefone && <span className="incidente-data"><Phone size={12} /> {c.telefone}</span>}
                    {c.gestor_nome
                      ? <span className="incidente-data">Gestor: <strong style={{ color: '#2563eb' }}>{c.gestor_nome}</strong></span>
                      : <span className="incidente-data" style={{ fontStyle: 'italic' }}>Sem gestor atribuído</span>}
                    {c.created_at && <span className="incidente-data">Desde {new Date(c.created_at).toLocaleDateString('pt-PT')}</span>}
                  </div>

                  <div className="d-flex flex-wrap gap-4 mt-2">
                    {[
                      { Icone: FileText,      cor: '#3b82f6', val: c.total_documentos,  label: 'documentos' },
                      { Icone: AlertTriangle, cor: '#f97316', val: c.total_incidentes,  label: 'incidentes' },
                      { Icone: MessageSquare, cor: '#22c55e', val: c.total_mensagens,   label: 'mensagens'  },
                    ].map(({ Icone, cor: iconCor, val, label }) => (
                      <span key={label} className="incidente-data">
                        <Icone size={13} color={iconCor} /> <strong>{val ?? 0}</strong> {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ação: atribuir gestor */}
                <div className="d-flex gap-2 flex-shrink-0">
                  <button
                    className="btn-editar"
                    onClick={(e) => { e.stopPropagation(); setModalGestor(c); }}
                    title="Atribuir / alterar gestor"
                  >
                    <UserCog size={13} /> Gestor
                  </button>
                </div>
              </div>
            </div>
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
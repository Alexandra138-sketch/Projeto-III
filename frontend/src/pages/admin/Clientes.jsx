import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Mail, Phone, FileText, Shield,
  AlertTriangle, MessageSquare, ChevronRight,
  CheckCircle, XCircle, Loader,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

/* ── Cor gerada a partir do ID ── */
const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) {
  return CORES[(parseInt(id, 10) - 1) % CORES.length];
}

function AdminClientes() {
  const navigate = useNavigate();

  const [clientes, setClientes]         = useState([]);
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]                 = useState('');
  const [pesquisa, setPesquisa]         = useState('');
  const [filtroAtivo, setFiltroAtivo]   = useState('all');

  /* ── Buscar clientes da BD ── */
  useEffect(() => {
    api.get('/clientes')
      .then(({ data }) => setClientes(data))
      .catch(() => setErro('Não foi possível carregar os clientes.'))
      .finally(() => setCarregando(false));
  }, []);

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

                {/* Gestor + seta */}
                <div className="d-none d-lg-flex flex-column align-items-end gap-1" style={{ flexShrink: 0, minWidth: 180 }}>
                  {c.gestor_nome && (
                    <div className="text-end">
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Gestor responsável</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', margin: 0 }}>{c.gestor_nome}</p>
                    </div>
                  )}
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

    </AdminLayout>
  );
}

export default AdminClientes;

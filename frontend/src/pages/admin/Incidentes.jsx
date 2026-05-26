import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FiAlertTriangle, FiSearch, FiX, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi';

/* ── Dados de demonstração ── */

const INCIDENTES_INICIAIS = [
  {
    id: 1,
    nome: 'Ransomware - Servidores de Ficheiros',
    descricao: 'Ataque de ransomware detetado nos servidores de ficheiros do cliente Tech Corp. Notificado à CNCS em menos de 24h conforme exigido pela NIS2.',
    severidade: 'critico',
    estado: 'resolvido',
    cliente: 'Tech Corp Portugal',
    reportadoPor: 'João Silva',
    reportadoEm: '2025-02-10',
    resolvidoEm: '2025-02-12',
    nis2: true,
  },
  {
    id: 2,
    nome: 'Phishing Campaign - Executivos',
    descricao: 'Campanha de phishing direcionada a executivos do cliente Retail Group. Emails fraudulentos a imitar comunicações internas.',
    severidade: 'alto',
    estado: 'investigar',
    cliente: 'Retail Group SA',
    reportadoPor: 'Ana Costa',
    reportadoEm: '2025-03-10',
    resolvidoEm: null,
    nis2: false,
  },
  {
    id: 3,
    nome: 'SQL Injection - Portal Cliente',
    descricao: 'Tentativa de injeção SQL detetada no portal de clientes. Acesso a dados sensíveis potencialmente comprometido.',
    severidade: 'critico',
    estado: 'aberto',
    cliente: 'FinBank Portugal',
    reportadoPor: 'Miguel Ferreira',
    reportadoEm: '2025-04-01',
    resolvidoEm: null,
    nis2: true,
  },
  {
    id: 4,
    nome: 'Acesso Não Autorizado - VPN',
    descricao: 'Tentativas de acesso não autorizado via VPN detetadas nos logs de atividade. IP de origem suspeito.',
    severidade: 'medio',
    estado: 'aberto',
    cliente: 'Tech Corp Portugal',
    reportadoPor: 'João Silva',
    reportadoEm: '2025-04-15',
    resolvidoEm: null,
    nis2: false,
  },
  {
    id: 5,
    nome: 'DDoS - Servidor Web',
    descricao: 'Ataque DDoS ao servidor web do cliente MediSafe. Serviço indisponível durante 3 horas. Mitigado com sucesso.',
    severidade: 'alto',
    estado: 'resolvido',
    cliente: 'MediSafe Clinic',
    reportadoPor: 'Ana Costa',
    reportadoEm: '2025-01-20',
    resolvidoEm: '2025-01-20',
    nis2: true,
  },
  {
    id: 6,
    nome: 'Vulnerabilidade CVE-2025-1234',
    descricao: 'Vulnerabilidade de baixo risco identificada em biblioteca de terceiros. Patch disponível e aplicação em curso.',
    severidade: 'baixo',
    estado: 'investigar',
    cliente: 'Retail Group SA',
    reportadoPor: 'Miguel Ferreira',
    reportadoEm: '2025-02-28',
    resolvidoEm: null,
    nis2: false,
  },
];

/* ── Mapeamentos de badge ── */

const SEV_CLASS = {
  critico: 'badge-status badge-critico',
  alto:    'badge-status badge-investigar',
  medio:   'badge-status badge-aberto',
  baixo:   'badge-status badge-resolvido',
};

const SEV_LABEL = {
  critico: 'Crítico',
  alto:    'Alto',
  medio:   'Médio',
  baixo:   'Baixo',
};

const ESTADO_CLASS = {
  aberto:     'badge-status badge-aberto',
  investigar: 'badge-status badge-investigar',
  resolvido:  'badge-status badge-resolvido',
};

const ESTADO_LABEL = {
  aberto:     'Aberto',
  investigar: 'A Investigar',
  resolvido:  'Resolvido',
};

const AVATAR_CORES = {
  'Tech Corp Portugal': '#3b82f6',
  'Retail Group SA':    '#8b5cf6',
  'FinBank Portugal':   '#10b981',
  'MediSafe Clinic':    '#f59e0b',
};

/* ── Componente modal de detalhe ── */

function ModalDetalhe({ incidente, onClose, onAtualizarEstado }) {
  if (!incidente) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="dash-card"
        style={{ width: '100%', maxWidth: 580, margin: 0, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <FiAlertTriangle size={18} color="#ef4444" />
            <h5 className="mb-0">Detalhes do Incidente</h5>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: '4px',
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Badges de estado */}
        <div className="d-flex gap-2 flex-wrap mb-3">
          <span className={SEV_CLASS[incidente.severidade]}>{SEV_LABEL[incidente.severidade]}</span>
          <span className={ESTADO_CLASS[incidente.estado]}>{ESTADO_LABEL[incidente.estado]}</span>
          {incidente.nis2 && (
            <span className="badge-status" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              NIS2 Notificado
            </span>
          )}
        </div>

        {/* Título */}
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
          {incidente.nome}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          {incidente.descricao}
        </p>

        {/* Metadados */}
        <div className="row g-2 mb-3">
          {[
            { label: 'Cliente',       valor: incidente.cliente },
            { label: 'Reportado por', valor: incidente.reportadoPor },
            { label: 'Data de reporte', valor: incidente.reportadoEm },
            { label: 'Data de resolução', valor: incidente.resolvidoEm || '—' },
          ].map(({ label, valor }) => (
            <div className="col-6" key={label}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.65rem 0.85rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
                  {label}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500, margin: 0 }}>
                  {valor}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ações de estado */}
        {incidente.estado !== 'resolvido' && (
          <div className="d-flex gap-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            {incidente.estado === 'aberto' && (
              <button
                className="btn-outline-custom"
                style={{ flex: 1, justifyContent: 'center', borderRadius: '10px !important' }}
                onClick={() => onAtualizarEstado(incidente.id, 'investigar')}
              >
                <FiClock size={14} /> Iniciar Investigação
              </button>
            )}
            <button
              className="btn-gradient"
              style={{ flex: 1, justifyContent: 'center', borderRadius: '10px !important' }}
              onClick={() => onAtualizarEstado(incidente.id, 'resolvido')}
            >
              <FiCheckCircle size={14} /> Marcar como Resolvido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Componente principal ── */

function AdminIncidentes() {
  const [incidentes, setIncidentes] = useState(INCIDENTES_INICIAIS);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroSev, setFiltroSev] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selecionado, setSelecionado] = useState(null);

  /* Contadores para o banner */
  const totalAbertos    = incidentes.filter((i) => i.estado === 'aberto').length;
  const totalInvestigar = incidentes.filter((i) => i.estado === 'investigar').length;
  const totalResolvidos = incidentes.filter((i) => i.estado === 'resolvido').length;
  const totalCriticos   = incidentes.filter((i) => i.severidade === 'critico').length;

  /* Filtragem */
  const filtrados = incidentes.filter((i) => {
    const matchPesquisa =
      i.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      i.cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
      i.reportadoPor.toLowerCase().includes(pesquisa.toLowerCase());
    const matchSev    = filtroSev    === 'todos' || i.severidade === filtroSev;
    const matchEstado = filtroEstado === 'todos' || i.estado     === filtroEstado;
    return matchPesquisa && matchSev && matchEstado;
  });

  /* Atualizar estado de um incidente */
  const atualizarEstado = (id, novoEstado) => {
    setIncidentes((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, estado: novoEstado, resolvidoEm: novoEstado === 'resolvido' ? new Date().toISOString().split('T')[0] : i.resolvidoEm }
          : i
      )
    );
    setSelecionado((prev) =>
      prev?.id === id ? { ...prev, estado: novoEstado, resolvidoEm: novoEstado === 'resolvido' ? new Date().toISOString().split('T')[0] : prev.resolvidoEm } : prev
    );
  };

  return (
    <AdminLayout>

      {/* ── Banner de resumo ── */}
      <div className="dash-banner">
        <h4>Incidentes de Segurança</h4>
        <p>Monitorização e gestão de incidentes conforme a Diretiva NIS2.</p>
        <div className="row g-3">
          {[
            { numero: totalAbertos,    label: 'Abertos'       },
            { numero: totalInvestigar, label: 'A Investigar'  },
            { numero: totalResolvidos, label: 'Resolvidos'    },
            { numero: totalCriticos,   label: 'Críticos'      },
          ].map((s) => (
            <div className="col-6 col-md-3" key={s.label}>
              <div className="stat-card">
                <div className="stat-number">{s.numero}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="dash-card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div className="row g-2 align-items-center">

          {/* Pesquisa */}
          <div className="col-12 col-md-5">
            <div style={{ position: 'relative' }}>
              <FiSearch
                size={15}
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Pesquisar por nome, cliente ou responsável…"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                style={{
                  width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                  borderRadius: 8, border: '1px solid #e2e8f0',
                  fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Filtro severidade */}
          <div className="col-6 col-md-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiFilter size={14} color="#94a3b8" />
              <select
                value={filtroSev}
                onChange={(e) => setFiltroSev(e.target.value)}
                style={{
                  flex: 1, padding: '0.5rem 0.6rem', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: '0.85rem',
                  outline: 'none', color: '#1e293b', background: 'white',
                }}
              >
                <option value="todos">Severidade: Todas</option>
                <option value="critico">Crítico</option>
                <option value="alto">Alto</option>
                <option value="medio">Médio</option>
                <option value="baixo">Baixo</option>
              </select>
            </div>
          </div>

          {/* Filtro estado */}
          <div className="col-6 col-md-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                width: '100%', padding: '0.5rem 0.6rem', borderRadius: 8,
                border: '1px solid #e2e8f0', fontSize: '0.85rem',
                outline: 'none', color: '#1e293b', background: 'white',
              }}
            >
              <option value="todos">Estado: Todos</option>
              <option value="aberto">Aberto</option>
              <option value="investigar">A Investigar</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>

          {/* Contador */}
          <div className="col-12 col-md-1 text-md-end">
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>

        </div>
      </div>

      {/* ── Tabela de incidentes ── */}
      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                {['Incidente', 'Cliente', 'Severidade', 'Estado', 'NIS2', 'Reportado em', 'Ações'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left', padding: '0.85rem 1.1rem',
                      fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inc) => (
                <tr
                  key={inc.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Nome */}
                  <td style={{ padding: '0.9rem 1.1rem', maxWidth: 240 }}>
                    <p className="incidente-nome" style={{ marginBottom: 2 }}>{inc.nome}</p>
                    <p className="incidente-data">Por {inc.reportadoPor}</p>
                  </td>

                  {/* Cliente */}
                  <td style={{ padding: '0.9rem 1.1rem', whiteSpace: 'nowrap' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="cliente-avatar"
                        style={{ width: 28, height: 28, fontSize: '0.75rem', backgroundColor: AVATAR_CORES[inc.cliente] || '#94a3b8' }}
                      >
                        {inc.cliente[0]}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>{inc.cliente}</span>
                    </div>
                  </td>

                  {/* Severidade */}
                  <td style={{ padding: '0.9rem 1.1rem' }}>
                    <span className={SEV_CLASS[inc.severidade]}>{SEV_LABEL[inc.severidade]}</span>
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '0.9rem 1.1rem' }}>
                    <span className={ESTADO_CLASS[inc.estado]}>{ESTADO_LABEL[inc.estado]}</span>
                  </td>

                  {/* NIS2 */}
                  <td style={{ padding: '0.9rem 1.1rem' }}>
                    {inc.nis2 ? (
                      <span className="badge-status" style={{ background: '#ede9fe', color: '#7c3aed' }}>Sim</span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>—</span>
                    )}
                  </td>

                  {/* Data */}
                  <td style={{ padding: '0.9rem 1.1rem', whiteSpace: 'nowrap' }}>
                    <p className="incidente-data" style={{ margin: 0 }}>{inc.reportadoEm}</p>
                  </td>

                  {/* Ações */}
                  <td style={{ padding: '0.9rem 1.1rem', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setSelecionado(inc)}
                      style={{
                        background: '#eff6ff', border: 'none', cursor: 'pointer',
                        borderRadius: 7, padding: '5px 12px',
                        fontSize: '0.78rem', color: '#2563eb', fontWeight: 600,
                      }}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Nenhum incidente encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de detalhe ── */}
      <ModalDetalhe
        incidente={selecionado}
        onClose={() => setSelecionado(null)}
        onAtualizarEstado={(id, estado) => {
          atualizarEstado(id, estado);
        }}
      />

    </AdminLayout>
  );
}

export default AdminIncidentes;
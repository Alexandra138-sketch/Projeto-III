import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';

const INCIDENTES_INICIAIS = [
  { id: 'i1', title: 'Ransomware - Servidores de Ficheiros', description: 'Ataque de ransomware detetado nos servidores de ficheiros do cliente Tech Corp. Notificado à CNCS em menos de 24h conforme exigido pela NIS2.', severity: 'critical', status: 'resolved', reportedBy: 'João Silva', reportedAt: '2025-02-10', resolvedAt: '2025-02-12', nis2Reported: true },
  { id: 'i2', title: 'Phishing Campaign - Executivos', description: 'Campanha de phishing direcionada a executivos do cliente Retail Group. Emails fraudulentos a imitar comunicações internas.', severity: 'high', status: 'investigating', reportedBy: 'Ana Costa', reportedAt: '2025-03-10', resolvedAt: '', nis2Reported: false },
  { id: 'i3', title: 'Acesso Não Autorizado - VPN', description: 'Tentativas de acesso não autorizado via VPN detetadas nos logs de atividade. IP de origem suspeito.', severity: 'medium', status: 'open', reportedBy: 'João Silva', reportedAt: '2025-04-15', resolvedAt: '', nis2Reported: false },
  { id: 'i4', title: 'DDoS - Servidor Web', description: 'Ataque DDoS ao servidor web do cliente FinBank. Serviço indisponível durante 3 horas. Mitigado com sucesso.', severity: 'high', status: 'closed', reportedBy: 'Ana Costa', reportedAt: '2025-01-20', resolvedAt: '2025-01-20', nis2Reported: true },
  { id: 'i5', title: 'Vazamento de Credenciais', description: 'Credenciais de acesso encontradas em repositório público. Reset forçado realizado para todos os utilizadores afetados.', severity: 'critical', status: 'resolved', reportedBy: 'João Silva', reportedAt: '2025-01-05', resolvedAt: '2025-01-07', nis2Reported: true },
  { id: 'i6', title: 'SQL Injection - Portal Cliente', description: 'Tentativa de injeção SQL detetada no portal de clientes. Acesso a dados sensíveis potencialmente comprometido.', severity: 'critical', status: 'open', reportedBy: 'Miguel Ferreira', reportedAt: '2025-04-01', resolvedAt: '', nis2Reported: true },
];

const SEV_BADGE = {
  critical: 'badge bg-danger',
  high:     'badge bg-warning text-dark',
  medium:   'badge bg-primary',
  low:      'badge bg-success',
};
const SEV_LABEL = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' };

const STA_BADGE = {
  open:          'badge bg-primary',
  investigating: 'badge bg-warning text-dark',
  resolved:      'badge bg-success',
  closed:        'badge bg-secondary',
};
const STA_LABEL = { open: 'Aberto', investigating: 'Investigando', resolved: 'Resolvido', closed: 'Fechado' };

/* ── Modal ── */
function ModalIncidente({ incidente, onClose, onGuardar }) {
  const { utilizador } = useAuth();
  const [form, setForm] = useState({
    title:        incidente?.title        || '',
    severity:     incidente?.severity     || 'medium',
    status:       incidente?.status       || 'open',
    reportedBy:   incidente?.reportedBy   || utilizador?.nome || '',
    reportedAt:   incidente?.reportedAt   || new Date().toISOString().slice(0, 10),
    resolvedAt:   incidente?.resolvedAt   || '',
    description:  incidente?.description  || '',
    nis2Reported: incidente?.nis2Reported || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{incidente?.id ? 'Editar Incidente' : 'Reportar Incidente'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label fw-semibold">Título *</label>
                <input
                  required
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Severidade</label>
                  <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    <option value="critical">Crítico</option>
                    <option value="high">Alto</option>
                    <option value="medium">Médio</option>
                    <option value="low">Baixo</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="open">Aberto</option>
                    <option value="investigating">Investigando</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descrição *</label>
                <textarea
                  required
                  rows={4}
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="nis2"
                  checked={form.nis2Reported}
                  onChange={(e) => setForm({ ...form, nis2Reported: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="nis2">
                  Notificado às autoridades NIS2 (CNCS/ENISA)
                </label>
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {incidente?.id ? 'Guardar' : 'Reportar Incidente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
function AdminIncidentes() {
  const [incidentes, setIncidentes] = useState(INCIDENTES_INICIAIS);
  const [pesquisa, setPesquisa]     = useState('');
  const [filtroSev, setFiltroSev]   = useState('all');
  const [filtroEst, setFiltroEst]   = useState('all');
  const [modal, setModal]           = useState(undefined);

  const totalAbertos  = incidentes.filter((i) => i.status === 'open').length;
  const totalCriticos = incidentes.filter((i) => i.severity === 'critical' && i.status !== 'closed').length;
  const totalNis2     = incidentes.filter((i) => i.nis2Reported).length;

  const filtrados = incidentes.filter((i) => {
    const matchP = i.title.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   i.description.toLowerCase().includes(pesquisa.toLowerCase());
    const matchS = filtroSev === 'all' || i.severity === filtroSev;
    const matchE = filtroEst === 'all' || i.status   === filtroEst;
    return matchP && matchS && matchE;
  });

  const handleGuardar = (dados) => {
    if (modal?.id) {
      setIncidentes((prev) => prev.map((i) => i.id === modal.id ? { ...dados, id: modal.id } : i));
    } else {
      setIncidentes((prev) => [{ ...dados, id: `i${Date.now()}` }, ...prev]);
    }
    setModal(undefined);
  };

  return (
    <AdminLayout>

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Gestão de Incidentes</h4>
          <p className="text-muted mb-0">
            {incidentes.length} incidentes · {totalAbertos} abertos · {totalCriticos} críticos
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(null)}>
          + Reportar Incidente
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="row g-3 mb-4">
        {[
          { numero: totalAbertos,       label: 'Abertos',          bg: 'bg-primary' },
          { numero: totalCriticos,      label: 'Críticos Ativos',  bg: 'bg-danger'  },
          { numero: totalNis2,          label: 'Notificados NIS2', bg: 'bg-warning' },
          { numero: incidentes.length,  label: 'Total',            bg: 'bg-secondary' },
        ].map(({ numero, label, bg }) => (
          <div key={label} className="col-6 col-md-3">
            <div className={`card text-white ${bg}`}>
              <div className="card-body text-center py-3">
                <h3 className="fw-bold mb-1">{numero}</h3>
                <p className="mb-0 small">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Pesquisar incidentes..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroSev} onChange={(e) => setFiltroSev(e.target.value)}>
                <option value="all">Todas as severidades</option>
                <option value="critical">Crítico</option>
                <option value="high">Alto</option>
                <option value="medium">Médio</option>
                <option value="low">Baixo</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroEst} onChange={(e) => setFiltroEst(e.target.value)}>
                <option value="all">Todos os estados</option>
                <option value="open">Aberto</option>
                <option value="investigating">Investigando</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <span className="text-muted small">{filtrados.length} resultado(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {filtrados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            Nenhum incidente encontrado com os filtros selecionados.
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Título</th>
                <th>Severidade</th>
                <th>Estado</th>
                <th>NIS2</th>
                <th>Reportado por</th>
                <th>Data</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <p className="mb-0 fw-semibold small">{inc.title}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{inc.description.slice(0, 60)}…</p>
                  </td>
                  <td><span className={SEV_BADGE[inc.severity]}>{SEV_LABEL[inc.severity]}</span></td>
                  <td><span className={STA_BADGE[inc.status]}>{STA_LABEL[inc.status]}</span></td>
                  <td>
                    {inc.nis2Reported
                      ? <span className="badge bg-info text-dark">Sim</span>
                      : <span className="badge bg-light text-muted">Não</span>}
                  </td>
                  <td className="small">{inc.reportedBy}</td>
                  <td className="small text-muted">{inc.reportedAt}</td>
                  <td className="text-center">
                    <button className="btn btn-outline-warning btn-sm" onClick={() => setModal(inc)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== undefined && (
        <ModalIncidente incidente={modal} onClose={() => setModal(undefined)} onGuardar={handleGuardar} />
      )}

    </AdminLayout>
  );
}

export default AdminIncidentes;

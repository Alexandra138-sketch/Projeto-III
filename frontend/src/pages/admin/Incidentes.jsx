import { useState } from 'react';
import { Plus, Search, Shield } from 'lucide-react';
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

const SEV = {
  critical: { label: 'Crítico',  dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  high:     { label: 'Alto',     dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  medium:   { label: 'Médio',    dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  low:      { label: 'Baixo',    dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

const STA = {
  open:          { label: 'Aberto',        bg: '#dbeafe', cor: '#2563eb' },
  investigating: { label: 'Investigando',  bg: '#fef9c3', cor: '#ca8a04' },
  resolved:      { label: 'Resolvido',     bg: '#dcfce7', cor: '#16a34a' },
  closed:        { label: 'Fechado',       bg: '#f1f5f9', cor: '#64748b' },
};

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>{incidente?.id ? 'Editar Incidente' : 'Reportar Incidente'}</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input required className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Severidade</label>
                <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Médio</option>
                  <option value="low">Baixo</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="open">Aberto</option>
                  <option value="investigating">Investigando</option>
                  <option value="resolved">Resolvido</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Descrição *</label>
              <textarea required rows={4} className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="nis2-checkbox mb-3" onClick={() => setForm({ ...form, nis2Reported: !form.nis2Reported })}>
              <input type="checkbox" id="nis2" checked={form.nis2Reported} onChange={(e) => setForm({ ...form, nis2Reported: e.target.checked })} onClick={(e) => e.stopPropagation()} />
              <label htmlFor="nis2"><Shield size={14} /> Notificado às autoridades NIS2 (CNCS/ENISA)</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar">{incidente?.id ? 'Guardar' : 'Reportar Incidente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminIncidentes() {
  const [incidentes, setIncidentes] = useState(INCIDENTES_INICIAIS);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroSev, setFiltroSev] = useState('all');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [modal, setModal] = useState(undefined);

  const totalAbertos  = incidentes.filter((i) => i.status === 'open').length;
  const totalCriticos = incidentes.filter((i) => i.severity === 'critical' && i.status !== 'closed').length;
  const totalNis2     = incidentes.filter((i) => i.nis2Reported).length;

  const filtrados = incidentes.filter((i) => {
    const matchP = i.title.toLowerCase().includes(pesquisa.toLowerCase()) || i.description.toLowerCase().includes(pesquisa.toLowerCase());
    const matchS = filtroSev    === 'all' || i.severity === filtroSev;
    const matchE = filtroEstado === 'all' || i.status   === filtroEstado;
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
      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Gestão de Incidentes</h4>
          <p className="incidentes-subtitulo">{incidentes.length} incidentes · {totalAbertos} abertos · {totalCriticos} críticos</p>
        </div>
        <button className="btn-gradient" onClick={() => setModal(null)}>
          <Plus size={16} /> Reportar Incidente
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="resumo-cards">
        <div className="resumo-card card-aberto">
          <p className="resumo-numero">{totalAbertos}</p>
          <p className="resumo-label">Abertos</p>
        </div>
        <div className="resumo-card card-critico">
          <p className="resumo-numero">{totalCriticos}</p>
          <p className="resumo-label">Críticos Ativos</p>
        </div>
        <div className="resumo-card card-nis2">
          <p className="resumo-numero">{totalNis2}</p>
          <p className="resumo-label">Notificados NIS2</p>
        </div>
        <div className="resumo-card card-total">
          <p className="resumo-numero">{incidentes.length}</p>
          <p className="resumo-label">Total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="dash-card filtros-bar">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="pesquisa-wrapper">
            <Search size={15} />
            <input placeholder="Pesquisar incidentes..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
          </div>
          <select value={filtroSev} onChange={(e) => setFiltroSev(e.target.value)}>
            <option value="all">Todas severidades</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
            <option value="low">Baixo</option>
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="all">Todos os estados</option>
            <option value="open">Aberto</option>
            <option value="investigating">Investigando</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
          </select>
          <span className="filtros-count ms-auto">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Lista */}
      {filtrados.map((inc) => {
        const sev = SEV[inc.severity] || SEV.medium;
        const sta = STA[inc.status]   || STA.open;
        return (
          <div key={inc.id} className="dash-card incidente-card">
            <div className="d-flex align-items-start gap-3">
              <div className="incidente-dot" style={{ backgroundColor: sev.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <p className="incidente-nome">{inc.title}</p>
                  <span className="badge-pill" style={{ background: sev.bg, color: sev.cor }}>{sev.label}</span>
                  <span className="badge-pill" style={{ background: sta.bg, color: sta.cor }}>{sta.label}</span>
                  {inc.nis2Reported && (
                    <span className="badge-pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                      <Shield size={10} /> NIS2
                    </span>
                  )}
                </div>
                <p className="incidente-descricao">{inc.description}</p>
                <div className="d-flex flex-wrap gap-3">
                  <span className="incidente-data">Reportado por: {inc.reportedBy}</span>
                  <span className="incidente-data">{inc.reportedAt}</span>
                  {inc.resolvedAt && <span className="incidente-data" style={{ color: '#16a34a' }}>Resolvido: {inc.resolvedAt}</span>}
                </div>
              </div>
              <button className="btn-editar" onClick={() => setModal(inc)}>Editar</button>
            </div>
          </div>
        );
      })}

      {filtrados.length === 0 && (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          Nenhum incidente encontrado com os filtros selecionados.
        </div>
      )}

      {modal !== undefined && (
        <ModalIncidente incidente={modal} onClose={() => setModal(undefined)} onGuardar={handleGuardar} />
      )}
    </AdminLayout>
  );
}

export default AdminIncidentes;
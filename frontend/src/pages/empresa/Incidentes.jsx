// ─────────────────────────────────────────────────────────────
//  Página: empresa/Incidentes.jsx
//
//  Permite à empresa ver e reportar incidentes de segurança.
//  Os campos de reporte seguem a estrutura do template CNCS/NIS2.
//
//  Funcionalidades:
//    - Listar incidentes com pesquisa e filtros
//    - Reportar novo incidente (formulário baseado no CNCS)
//    - Ver detalhe de cada incidente
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
// SweetAlert2 para feedback após submissão
import Swal from 'sweetalert2';
import { Plus, Search, AlertTriangle } from 'lucide-react';

// Tipos de incidente baseados no template CNCS
const TIPOS_INCIDENTE = [
  'Phishing', 'Malware', 'Ransomware', 'DDoS',
  'Violação de Dados', 'Exploração de Vulnerabilidades',
  'Força Bruta', 'Man-in-the-Middle', 'Zero-Day', 'Outro',
];

// Cores por severidade/estado
const SEV = {
  'Crítico': { dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  'Alto':    { dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  'Médio':   { dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  'Baixo':   { dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

const STA = {
  'Aberto':       { bg: '#dbeafe', cor: '#2563eb' },
  'A Investigar': { bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { bg: '#f1f5f9', cor: '#64748b' },
};

// ── Formulário vazio para novo incidente ──
const FORM_VAZIO = {
  titulo: '', tipo_incidente: 'Phishing', severidade: 'Médio',
  descricao: '', sistemas_afetados: '', utilizadores_afetados: '',
  dados_comprometidos: false, origem_ataque: '',
};

// ── Modal para reportar novo incidente (formulário CNCS) ──────
function ModalReportarIncidente({ onClose, onReportado }) {
  const [form, setForm] = useState({ ...FORM_VAZIO });
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAEnviar(true);
    setErro('');
    try {
      const { data } = await api.post('/empresa/incidentes', {
        ...form,
        utilizadores_afetados: form.utilizadores_afetados
          ? parseInt(form.utilizadores_afetados, 10) : null,
      });
      onReportado(data);
      Swal.fire('Incidente Reportado!', 'O teu incidente foi submetido ao gestor.', 'success');
      onClose();
    } catch (err) {
      console.error('Erro ao reportar incidente:', err);
      setErro('Não foi possível reportar o incidente. Tenta novamente.');
    } finally {
      setAEnviar(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <AlertTriangle size={18} /> Reportar Incidente de Segurança
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {erro && <div className="alert alert-danger">{erro}</div>}

              {/* Informações Gerais */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1">Informações Gerais</h6>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Título / Resumo *</label>
                  <input required type="text" className="form-control"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Resumo breve do incidente…" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de Incidente</label>
                  <select className="form-select" value={form.tipo_incidente}
                    onChange={(e) => setForm({ ...form, tipo_incidente: e.target.value })}>
                    {TIPOS_INCIDENTE.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gravidade</label>
                  <select className="form-select" value={form.severidade}
                    onChange={(e) => setForm({ ...form, severidade: e.target.value })}>
                    <option>Crítico</option>
                    <option>Alto</option>
                    <option>Médio</option>
                    <option>Baixo</option>
                  </select>
                </div>
              </div>

              {/* Descrição do Incidente */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1">Descrição do Incidente</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Descrição detalhada *</label>
                <textarea required rows={4} className="form-control"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreve o que aconteceu, quando ocorreu, e qual o impacto observado…" />
              </div>

              {/* Impacto */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1">Impacto</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Sistemas Afetados</label>
                  <input type="text" className="form-control"
                    value={form.sistemas_afetados}
                    onChange={(e) => setForm({ ...form, sistemas_afetados: e.target.value })}
                    placeholder="Ex: Servidor web, base de dados, workstations…" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Utilizadores Afetados</label>
                  <input type="number" min="0" className="form-control"
                    value={form.utilizadores_afetados}
                    onChange={(e) => setForm({ ...form, utilizadores_afetados: e.target.value })}
                    placeholder="0" />
                </div>
                <div className="col-md-3 d-flex align-items-end pb-3">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="dados_comp"
                      checked={form.dados_comprometidos}
                      onChange={(e) => setForm({ ...form, dados_comprometidos: e.target.checked })} />
                    <label className="form-check-label" htmlFor="dados_comp">
                      Dados Comprometidos
                    </label>
                  </div>
                </div>
              </div>

              {/* Detalhes Técnicos */}
              <h6 className="text-muted text-uppercase small mb-3 border-bottom pb-1">Detalhes Técnicos</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Origem do Ataque (se conhecida)</label>
                <input type="text" className="form-control"
                  value={form.origem_ataque}
                  onChange={(e) => setForm({ ...form, origem_ataque: e.target.value })}
                  placeholder="Ex: IP externo, e-mail de phishing, USB infetado…" />
              </div>

              {/* Nota NIS2 */}
              <div className="alert alert-warning mb-0 d-flex align-items-start gap-2">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>Nota NIS2:</strong> Se este incidente for grave, as autoridades devem ser
                  notificadas em <strong>24 horas</strong> (alerta inicial) e <strong>72 horas</strong> (relatório
                  detalhado). O teu gestor irá verificar e tratar da notificação ao CNCS se necessário.
                </span>
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-danger" disabled={aEnviar}>
                {aEnviar ? 'A submeter…' : 'Reportar Incidente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
function Incidentes() {
  const [incidentes,     setIncidentes]     = useState([]);
  const [carregando,     setCarregando]     = useState(true);
  const [erro,           setErro]           = useState('');
  const [pesquisa,       setPesquisa]       = useState('');
  const [filtroEstado,   setFiltroEstado]   = useState('');
  const [filtroSev,      setFiltroSev]      = useState('');
  const [modalIncidente, setModalIncidente] = useState(null);   // detalhe
  const [modalReportar,  setModalReportar]  = useState(false);  // formulário de reporte

  // Carregar incidentes ao abrir a página
  useEffect(() => {
    setCarregando(true);
    api.get('/empresa/incidentes')
      .then(({ data }) => setIncidentes(Array.isArray(data) ? data : []))
      .catch(() => setErro('Não foi possível carregar os incidentes.'))
      .finally(() => setCarregando(false));
  }, []);

  // Filtrar a lista localmente
  const filtrados = incidentes.filter((i) => {
    const matchP = i.titulo?.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   i.descricao?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchE = !filtroEstado || i.estado    === filtroEstado;
    const matchS = !filtroSev   || i.severidade === filtroSev;
    return matchP && matchE && matchS;
  });

  // Estatísticas rápidas
  const totalAbertos  = incidentes.filter((i) => i.estado === 'Aberto').length;
  const totalCriticos = incidentes.filter((i) => i.severidade === 'Crítico' && i.estado !== 'Fechado').length;

  return (
    <AdminLayout>

      {/* ── Cabeçalho — igual ao admin/Incidentes.jsx ── */}
      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Os Meus Incidentes</h4>
          <p className="incidentes-subtitulo">
            {incidentes.length} incidentes · {totalAbertos} abertos · {totalCriticos} críticos
          </p>
        </div>
        <button className="btn-gradient" onClick={() => setModalReportar(true)}>
          <Plus size={16} /> Reportar Incidente
        </button>
      </div>

      {/* ── Cards de resumo — mesmo padrão que admin/Incidentes.jsx ── */}
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
          <p className="resumo-numero">{incidentes.filter(i => i.nis2_notificado).length}</p>
          <p className="resumo-label">Notificados NIS2</p>
        </div>
        <div className="resumo-card card-total">
          <p className="resumo-numero">{incidentes.length}</p>
          <p className="resumo-label">Total</p>
        </div>
      </div>

      {/* ── Filtros e pesquisa ── */}
      <div className="dash-card filtros-bar mb-4">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="pesquisa-wrapper">
            <Search size={15} />
            <input
              placeholder="Pesquisar por título…"
              value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
          </div>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos os estados</option>
            <option value="Aberto">Aberto</option>
            <option value="A Investigar">A Investigar</option>
            <option value="Resolvido">Resolvido</option>
            <option value="Fechado">Fechado</option>
          </select>
          <select value={filtroSev} onChange={(e) => setFiltroSev(e.target.value)}>
            <option value="">Todas as severidades</option>
            <option value="Crítico">Crítico</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
          </select>
          <span className="filtros-count ms-auto">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Mensagem de erro ── */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* ── Tabela de incidentes ── */}
      {carregando ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          A carregar incidentes…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          {incidentes.length === 0 ? 'Ainda não tens incidentes registados.' : 'Nenhum resultado para os filtros aplicados.'}
        </div>
      ) : filtrados.map((inc) => {
        const sev = SEV[inc.severidade] || SEV['Médio'];
        const sta = STA[inc.estado]     || STA['Aberto'];
        return (
          <div key={inc.id} className="dash-card incidente-card">
            <div className="d-flex align-items-start gap-3">
              <div className="incidente-dot" style={{ backgroundColor: sev.dot, marginTop: 4 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <p className="incidente-nome">{inc.titulo}</p>
                  <span className="badge-pill" style={{ background: sev.bg, color: sev.cor }}>{inc.severidade}</span>
                  <span className="badge-pill" style={{ background: sta.bg, color: sta.cor }}>{inc.estado}</span>
                  {inc.nis2_notificado && (
                    <span className="badge-pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>NIS2</span>
                  )}
                </div>
                {inc.descricao && <p className="incidente-descricao">{inc.descricao}</p>}
                <div className="d-flex flex-wrap gap-3">
                  {inc.responsavel?.nome && <span className="incidente-data">Responsável: {inc.responsavel.nome}</span>}
                  {inc.created_at && <span className="incidente-data">{new Date(inc.created_at).toLocaleDateString('pt-PT')}</span>}
                </div>
              </div>
              <button className="btn-editar" onClick={() => setModalIncidente(inc)}>Ver</button>
            </div>
          </div>
        );
      })}

      {/* Modal de detalhe do incidente */}
      {modalIncidente && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalIncidente.titulo}</h5>
                <button className="btn-close" onClick={() => setModalIncidente(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-6">
                    <strong>Severidade:</strong>{' '}
                    <span className="badge-pill" style={{
                      background: (SEV[modalIncidente.severidade] || SEV['Médio']).bg,
                      color: (SEV[modalIncidente.severidade] || SEV['Médio']).cor,
                    }}>
                      {modalIncidente.severidade}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong>Estado:</strong>{' '}
                    <span className="badge-pill" style={{
                      background: (STA[modalIncidente.estado] || STA['Aberto']).bg,
                      color: (STA[modalIncidente.estado] || STA['Aberto']).cor,
                    }}>
                      {modalIncidente.estado}
                    </span>
                  </div>
                  {modalIncidente.tipo_incidente && (
                    <div className="col-6">
                      <strong>Tipo:</strong> {modalIncidente.tipo_incidente}
                    </div>
                  )}
                  <div className="col-6">
                    <strong>Responsável:</strong> {modalIncidente.responsavel?.nome || '—'}
                  </div>
                  <div className="col-6">
                    <strong>Data de registo:</strong>{' '}
                    {modalIncidente.created_at
                      ? new Date(modalIncidente.created_at).toLocaleDateString('pt-PT') : '—'}
                  </div>
                  <div className="col-6">
                    <strong>NIS2 notificado:</strong>{' '}
                    {modalIncidente.nis2_notificado ? 'Sim' : 'Não'}
                  </div>
                  {modalIncidente.sistemas_afetados && (
                    <div className="col-12">
                      <strong>Sistemas afetados:</strong> {modalIncidente.sistemas_afetados}
                    </div>
                  )}
                  {modalIncidente.descricao && (
                    <div className="col-12">
                      <strong>Descrição:</strong>
                      <p className="mt-1 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {modalIncidente.descricao}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancelar" onClick={() => setModalIncidente(null)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reporte de incidente */}
      {modalReportar && (
        <ModalReportarIncidente
          onClose={() => setModalReportar(false)}
          onReportado={(novoInc) => setIncidentes((prev) => [novoInc, ...prev])}
        />
      )}

    </AdminLayout>
    );
}

export default Incidentes;

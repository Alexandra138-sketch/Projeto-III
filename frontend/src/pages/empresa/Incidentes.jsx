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

// Tipos de incidente baseados no template CNCS
const TIPOS_INCIDENTE = [
  'Phishing', 'Malware', 'Ransomware', 'DDoS',
  'Violação de Dados', 'Exploração de Vulnerabilidades',
  'Força Bruta', 'Man-in-the-Middle', 'Zero-Day', 'Outro',
];

// Cores dos badges de severidade
const BADGE_SEVERIDADE = {
  Crítico: 'badge bg-danger',
  Alto:    'badge bg-warning text-dark',
  Médio:   'badge bg-primary',
  Baixo:   'badge bg-success',
};

// Cores dos badges de estado
const BADGE_ESTADO = {
  Aberto:          'badge bg-danger',
  'A Investigar':  'badge bg-warning text-dark',
  Resolvido:       'badge bg-success',
  Fechado:         'badge bg-secondary',
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
            <h5 className="modal-title">⚠ Reportar Incidente de Segurança</h5>
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
              <div className="alert alert-warning mb-0">
                <strong>⚠ Nota NIS2:</strong> Se este incidente for grave, as autoridades devem ser
                notificadas em <strong>24 horas</strong> (alerta inicial) e <strong>72 horas</strong> (relatório
                detalhado). O teu gestor irá verificar e tratar da notificação ao CNCS se necessário.
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
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

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Os Meus Incidentes</h4>
          <p className="text-muted mb-0">
            {carregando ? 'A carregar…' : `${incidentes.length} incidentes · ${totalAbertos} abertos`}
          </p>
        </div>
        <button className="btn btn-danger" onClick={() => setModalReportar(true)}>
          ⚠ Reportar Incidente
        </button>
      </div>

      {/* Cartões de resumo */}
      <div className="row g-3 mb-4">
        {[
          { numero: totalAbertos,  label: 'Abertos',  bg: 'bg-danger'    },
          { numero: totalCriticos, label: 'Críticos', bg: 'bg-dark'      },
          { numero: incidentes.filter((i) => i.nis2_notificado).length,
            label: 'Notif. NIS2', bg: 'bg-warning' },
          { numero: incidentes.filter((i) => i.estado === 'Resolvido' || i.estado === 'Fechado').length,
            label: 'Resolvidos',  bg: 'bg-success'   },
        ].map(({ numero, label, bg }) => (
          <div key={label} className="col-6 col-md-3">
            <div className={`card text-white ${bg}`}>
              <div className="card-body text-center py-3">
                <h3 className="fw-bold mb-1">{carregando ? '…' : numero}</h3>
                <p className="mb-0 small">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-5">
              <input type="text" className="form-control"
                placeholder="🔍 Pesquisar incidentes…"
                value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos os estados</option>
                <option>Aberto</option>
                <option>A Investigar</option>
                <option>Resolvido</option>
                <option>Fechado</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroSev}
                onChange={(e) => setFiltroSev(e.target.value)}>
                <option value="">Todas as severidades</option>
                <option>Crítico</option>
                <option>Alto</option>
                <option>Médio</option>
                <option>Baixo</option>
              </select>
            </div>
            <div className="col-md-1 text-end">
              <span className="text-muted small">{filtrados.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Erro */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* Tabela de incidentes */}
      {carregando ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border mb-3" role="status"></div>
          <p>A carregar incidentes…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            {incidentes.length === 0
              ? 'Ainda não tens incidentes registados.'
              : 'Nenhum resultado para os filtros aplicados.'}
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
                <th>Data</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <p className="mb-0 fw-semibold small">{inc.titulo}</p>
                    {inc.descricao && (
                      <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                        {inc.descricao.slice(0, 60)}…
                      </p>
                    )}
                  </td>
                  <td>
                    <span className={BADGE_SEVERIDADE[inc.severidade] || 'badge bg-secondary'}>
                      {inc.severidade}
                    </span>
                  </td>
                  <td>
                    <span className={BADGE_ESTADO[inc.estado] || 'badge bg-secondary'}>
                      {inc.estado}
                    </span>
                  </td>
                  <td>
                    {inc.nis2_notificado
                      ? <span className="badge bg-info text-dark">Sim</span>
                      : <span className="badge bg-light text-muted">Não</span>}
                  </td>
                  <td className="small text-muted">
                    {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}
                  </td>
                  <td className="text-center">
                    <button className="btn btn-outline-primary btn-sm"
                      onClick={() => setModalIncidente(inc)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalhe do incidente */}
      {modalIncidente && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModalIncidente(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalIncidente.titulo}</h5>
                <button className="btn-close" onClick={() => setModalIncidente(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-6">
                    <strong>Severidade:</strong>{' '}
                    <span className={BADGE_SEVERIDADE[modalIncidente.severidade] || 'badge bg-secondary'}>
                      {modalIncidente.severidade}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong>Estado:</strong>{' '}
                    <span className={BADGE_ESTADO[modalIncidente.estado] || 'badge bg-secondary'}>
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
                <button className="btn btn-secondary" onClick={() => setModalIncidente(null)}>
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

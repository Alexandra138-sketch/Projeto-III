// ─────────────────────────────────────────────────────────────
//  Página: empresa/Incidentes.jsx
//
//  Lista todos os incidentes de segurança da empresa (read-only).
//  A empresa pode ver o estado e detalhes dos seus incidentes,
//  mas não pode criar, editar nem apagar.
//
//  Funcionalidades:
//    - Pesquisa por título
//    - Filtro por estado (Aberto, A Investigar, Resolvido, Fechado)
//    - Filtro por severidade (Crítico, Alto, Médio, Baixo)
//    - Modal de detalhe ao clicar em "Ver"
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

// Cores dos badges
const BADGE_SEVERIDADE = {
  Crítico: 'badge bg-danger',
  Alto:    'badge bg-warning text-dark',
  Médio:   'badge bg-primary',
  Baixo:   'badge bg-success',
};

const BADGE_ESTADO = {
  Aberto:          'badge bg-danger',
  'A Investigar':  'badge bg-warning text-dark',
  Resolvido:       'badge bg-success',
  Fechado:         'badge bg-secondary',
};

function Incidentes() {
  const [incidentes,    setIncidentes]    = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  const [erro,          setErro]          = useState('');
  const [pesquisa,      setPesquisa]      = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [filtroSev,     setFiltroSev]     = useState('');
  const [modalIncidente, setModalIncidente] = useState(null); // incidente selecionado para detalhe

  // ── Carregar incidentes ──
  useEffect(() => {
    setCarregando(true);
    api.get('/empresa/incidentes')
      .then(({ data }) => setIncidentes(Array.isArray(data) ? data : []))
      .catch(() => setErro('Não foi possível carregar os incidentes.'))
      .finally(() => setCarregando(false));
  }, []);

  // ── Filtrar a lista localmente ──
  const listaFiltrada = incidentes.filter(inc => {
    const matchPesquisa = inc.titulo?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchEstado   = filtroEstado ? inc.estado === filtroEstado : true;
    const matchSev      = filtroSev    ? inc.severidade === filtroSev : true;
    return matchPesquisa && matchEstado && matchSev;
  });

  return (
    <AdminLayout>

      {/* ── Cabeçalho ── */}
      <div className="dash-banner">
        <h4>Os Meus Incidentes</h4>
        <p>Acompanha o estado dos incidentes de segurança registados para a tua empresa.</p>
      </div>

      {/* ── Filtros e pesquisa ── */}
      <div className="dash-card mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por título…"
              value={pesquisa}
              onChange={e => setPesquisa(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos os estados</option>
              <option value="Aberto">Aberto</option>
              <option value="A Investigar">A Investigar</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Fechado">Fechado</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={filtroSev}
              onChange={e => setFiltroSev(e.target.value)}
            >
              <option value="">Todas as severidades</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Médio">Médio</option>
              <option value="Baixo">Baixo</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Mensagem de erro ── */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* ── Tabela de incidentes ── */}
      <div className="dash-card">
        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A carregar incidentes…</p>
        ) : listaFiltrada.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>
            {incidentes.length === 0 ? 'Sem incidentes registados.' : 'Nenhum resultado para os filtros aplicados.'}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Severidade</th>
                  <th>Estado</th>
                  <th>Responsável</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map(inc => (
                  <tr key={inc.id}>
                    <td>{inc.titulo}</td>
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
                    <td>{inc.responsavel?.nome || '—'}</td>
                    <td>{inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setModalIncidente(inc)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal de detalhe do incidente ── */}
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
                  <div className="col-6">
                    <strong>Reportado por:</strong> {modalIncidente.reportador?.nome || '—'}
                  </div>
                  <div className="col-6">
                    <strong>Responsável:</strong> {modalIncidente.responsavel?.nome || '—'}
                  </div>
                  <div className="col-6">
                    <strong>Data de registo:</strong>{' '}
                    {modalIncidente.created_at
                      ? new Date(modalIncidente.created_at).toLocaleDateString('pt-PT')
                      : '—'}
                  </div>
                  <div className="col-6">
                    <strong>NIS2 notificado:</strong>{' '}
                    {modalIncidente.nis2_notificado ? 'Sim' : 'Não'}
                  </div>
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

    </AdminLayout>
  );
}

export default Incidentes;

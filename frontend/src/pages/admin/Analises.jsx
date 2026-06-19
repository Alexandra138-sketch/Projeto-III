import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

const MES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatMonthLabel(date) {
  return `${MES_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildLastMonths(count = 6) {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(formatMonthLabel(current));
  }
  return months;
}

function getCreatedAt(item) {
  return item.created_at || item.createdAt;
}

/* Barra de progresso Bootstrap */
function BarraProgresso({ label, valor, total, cor }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span className="small fw-semibold">{label}</span>
        <span className="small text-muted">{valor} ({pct}%)</span>
      </div>
      <div className="progress" style={{ height: 14 }}>
        <div className={`progress-bar ${cor}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function Analises() {
  const [incidentes, setIncidentes] = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [servicos,   setServicos]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');

  useEffect(() => {
    setCarregando(true);
    Promise.allSettled([
      api.get('/incidentes'),
      api.get('/clientes'),
      api.get('/documentos'),
      api.get('/servicos'),
    ]).then(([incRes, cliRes, docRes, servRes]) => {
      if (incRes.status  === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data)  ? incRes.value.data  : []);
      if (cliRes.status  === 'fulfilled') setClientes(Array.isArray(cliRes.value.data)    ? cliRes.value.data  : []);
      if (docRes.status  === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data)  ? docRes.value.data  : []);
      if (servRes.status === 'fulfilled') setServicos(Array.isArray(servRes.value.data)   ? servRes.value.data : []);
      const todasFalharam = [incRes, cliRes, docRes, servRes].every(r => r.status === 'rejected');
      if (todasFalharam) setErro('Não foi possível carregar os dados de análises.');
    }).finally(() => setCarregando(false));
  }, []);

  const mesesUltimosSeis = useMemo(() => buildLastMonths(6), []);

  const incidentesPorSeveridade = useMemo(() => {
    const mapa = {};
    incidentes.forEach((inc) => { const c = inc.severidade || 'Outro'; mapa[c] = (mapa[c] || 0) + 1; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [incidentes]);

  const incidentesPorEstado = useMemo(() => {
    const mapa = {};
    incidentes.forEach((inc) => { const c = inc.estado || 'Outro'; mapa[c] = (mapa[c] || 0) + 1; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [incidentes]);

  const incidentesPorMes = useMemo(() => {
    const mapa = {};
    incidentes.forEach((inc) => {
      const data = parseDate(getCreatedAt(inc));
      if (!data) return;
      const label = formatMonthLabel(data);
      mapa[label] = (mapa[label] || 0) + 1;
    });
    return mesesUltimosSeis.map((month) => ({ month, quantidade: mapa[month] || 0 }));
  }, [incidentes, mesesUltimosSeis]);

  const documentosPorTipo = useMemo(() => {
    const mapa = {};
    documentos.forEach((doc) => { const t = doc.tipo || 'Outro'; mapa[t] = (mapa[t] || 0) + 1; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [documentos]);

  const totalSev = incidentesPorSeveridade.reduce((s, i) => s + i.value, 0);
  const totalEst = incidentesPorEstado.reduce((s, i) => s + i.value, 0);
  const totalDoc = documentosPorTipo.reduce((s, d) => s + d.value, 0);

  const SEV_CORES  = { 'Crítico': 'bg-danger', 'Alto': 'bg-warning', 'Médio': 'bg-primary', 'Baixo': 'bg-success' };
  const EST_CORES  = { 'Aberto': 'bg-primary', 'A Investigar': 'bg-warning', 'Resolvido': 'bg-success', 'Fechado': 'bg-secondary' };
  const DOC_CORES  = { 'Política': 'bg-primary', 'Pentest': 'bg-success', 'Auditoria': 'bg-warning', 'Contrato': 'bg-danger', 'Relatório': 'bg-info' };

  return (
    <AdminLayout>

      {/* Banner */}
      <div className="card bg-primary text-white mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Análises &amp; Gráficos</h4>
          <p className="mb-3 opacity-75">Resumo visual dos indicadores mais importantes da plataforma.</p>
          <div className="row g-3">
            {[
              { label: 'Incidentes', valor: incidentes.length },
              { label: 'Clientes',   valor: clientes.length   },
              { label: 'Documentos', valor: documentos.length  },
              { label: 'Serviços',   valor: servicos.length    },
            ].map((s) => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="card bg-white bg-opacity-25 text-white border-0">
                  <div className="card-body text-center py-3">
                    <h3 className="fw-bold mb-1">{carregando ? '…' : s.valor}</h3>
                    <p className="mb-0 small">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {erro ? (
        <div className="alert alert-danger">{erro}</div>
      ) : carregando ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border mb-3" role="status"></div>
          <p>A carregar dados…</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">

            {/* Incidentes por Severidade */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Incidentes por Severidade</div>
                <div className="card-body">
                  {incidentesPorSeveridade.length === 0
                    ? <p className="text-muted text-center py-3">Sem dados.</p>
                    : incidentesPorSeveridade.map((item) => (
                        <BarraProgresso key={item.name} label={item.name} valor={item.value} total={totalSev} cor={SEV_CORES[item.name] || 'bg-secondary'} />
                      ))
                  }
                </div>
              </div>
            </div>

            {/* Incidentes por Estado */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Incidentes por Estado</div>
                <div className="card-body">
                  {incidentesPorEstado.length === 0
                    ? <p className="text-muted text-center py-3">Sem dados.</p>
                    : incidentesPorEstado.map((item) => (
                        <BarraProgresso key={item.name} label={item.name} valor={item.value} total={totalEst} cor={EST_CORES[item.name] || 'bg-secondary'} />
                      ))
                  }
                </div>
              </div>
            </div>

          </div>

          <div className="row g-4 mb-4">

            {/* Incidentes por mês */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Incidentes nos últimos 6 meses</div>
                <div className="card-body p-0">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Mês</th><th className="text-center">Incidentes</th></tr>
                    </thead>
                    <tbody>
                      {incidentesPorMes.map((m) => (
                        <tr key={m.month}>
                          <td>{m.month}</td>
                          <td className="text-center">
                            <span className={`badge ${m.quantidade > 0 ? 'bg-danger' : 'bg-secondary'}`}>{m.quantidade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Documentos por Tipo */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Documentos por Tipo</div>
                <div className="card-body">
                  {documentosPorTipo.length === 0
                    ? <p className="text-muted text-center py-3">Sem dados.</p>
                    : documentosPorTipo.map((item) => (
                        <BarraProgresso key={item.name} label={item.name} valor={item.value} total={totalDoc} cor={DOC_CORES[item.name] || 'bg-secondary'} />
                      ))
                  }
                </div>
              </div>
            </div>

          </div>

          <div className="row g-4">

            {/* Clientes por Estado */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Clientes por Estado</div>
                <div className="card-body">
                  {[
                    { label: 'Ativos',   valor: clientes.filter(c => c.estado === 'Ativo').length,   cor: 'bg-success' },
                    { label: 'Inativos', valor: clientes.filter(c => c.estado !== 'Ativo').length,   cor: 'bg-secondary' },
                  ].map((item) => (
                    <BarraProgresso key={item.label} label={item.label} valor={item.valor} total={clientes.length || 1} cor={item.cor} />
                  ))}
                </div>
              </div>
            </div>

            {/* Serviços Ativos / Inativos */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Serviços Ativos / Inativos</div>
                <div className="card-body">
                  {[
                    { label: 'Ativos',   valor: servicos.filter(s => s.ativo).length,  cor: 'bg-primary' },
                    { label: 'Inativos', valor: servicos.filter(s => !s.ativo).length, cor: 'bg-secondary' },
                  ].map((item) => (
                    <BarraProgresso key={item.label} label={item.label} valor={item.valor} total={servicos.length || 1} cor={item.cor} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </AdminLayout>
  );
}

export default Analises;

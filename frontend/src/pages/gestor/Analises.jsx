import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const MES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatMonthLabel(date) {
  return `${MES_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildLastMonths(count = 6) {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(formatMonthLabel(d));
  }
  return months;
}

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

function GestorAnalises() {
  const { utilizador } = useAuth();
  const primeiroNome = utilizador?.nome?.split(' ')[0] || 'Gestor';

  const [incidentes, setIncidentes] = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');

  useEffect(() => {
    setCarregando(true);
    Promise.allSettled([api.get('/incidentes'), api.get('/clientes'), api.get('/documentos')])
      .then(([incRes, cliRes, docRes]) => {
        if (incRes.status === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
        if (cliRes.status === 'fulfilled') setClientes(Array.isArray(cliRes.value.data)   ? cliRes.value.data : []);
        if (docRes.status === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data) ? docRes.value.data : []);
        if ([incRes, cliRes, docRes].every(r => r.status === 'rejected')) setErro('Não foi possível carregar os dados.');
      })
      .finally(() => setCarregando(false));
  }, []);

  const mesesUltimosSeis = useMemo(() => buildLastMonths(6), []);

  const incidentesPorSeveridade = useMemo(() => {
    const mapa = {};
    incidentes.forEach((i) => { const c = i.severidade || 'Outro'; mapa[c] = (mapa[c] || 0) + 1; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [incidentes]);

  const incidentesPorEstado = useMemo(() => {
    const mapa = {};
    incidentes.forEach((i) => { const c = i.estado || 'Outro'; mapa[c] = (mapa[c] || 0) + 1; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [incidentes]);

  const incidentesPorMes = useMemo(() => {
    const mapa = {};
    incidentes.forEach((i) => {
      const d = parseDate(i.created_at || i.createdAt);
      if (!d) return;
      const label = formatMonthLabel(d);
      mapa[label] = (mapa[label] || 0) + 1;
    });
    return mesesUltimosSeis.map((month) => ({ month, quantidade: mapa[month] || 0 }));
  }, [incidentes, mesesUltimosSeis]);

  const documentosPorTipo = useMemo(() => {
    const mapa = {};
    documentos.forEach((d) => { const t = d.tipo || 'Outro'; mapa[t] = (mapa[t] || 0) + 1; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [documentos]);

  const totalSev = incidentesPorSeveridade.reduce((s, i) => s + i.value, 0);
  const totalEst = incidentesPorEstado.reduce((s, i) => s + i.value, 0);
  const totalDoc = documentosPorTipo.reduce((s, d) => s + d.value, 0);

  const SEV_CORES = { 'Crítico': 'bg-danger', 'Alto': 'bg-warning', 'Médio': 'bg-primary', 'Baixo': 'bg-success' };
  const EST_CORES = { 'Aberto': 'bg-primary', 'A Investigar': 'bg-warning', 'Resolvido': 'bg-success', 'Fechado': 'bg-secondary' };
  const DOC_CORES = { 'Política': 'bg-primary', 'Pentest': 'bg-success', 'Auditoria': 'bg-warning', 'Contrato': 'bg-danger', 'Relatório': 'bg-info' };

  return (
    <AdminLayout>

      <div className="card bg-primary text-white mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Análises — Olá, {primeiroNome} 📊</h4>
          <p className="mb-3 opacity-75">Resumo visual dos indicadores dos seus clientes.</p>
          <div className="row g-3">
            {[
              { label: 'Incidentes', valor: incidentes.length },
              { label: 'Clientes',   valor: clientes.length   },
              { label: 'Documentos', valor: documentos.length  },
            ].map((s) => (
              <div key={s.label} className="col-4">
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
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Incidentes por Severidade</div>
                <div className="card-body">
                  {incidentesPorSeveridade.length === 0
                    ? <p className="text-muted text-center py-3">Sem dados.</p>
                    : incidentesPorSeveridade.map((item) => (
                        <BarraProgresso key={item.name} label={item.name} valor={item.value} total={totalSev} cor={SEV_CORES[item.name] || 'bg-secondary'} />
                      ))}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Incidentes por Estado</div>
                <div className="card-body">
                  {incidentesPorEstado.length === 0
                    ? <p className="text-muted text-center py-3">Sem dados.</p>
                    : incidentesPorEstado.map((item) => (
                        <BarraProgresso key={item.name} label={item.name} valor={item.value} total={totalEst} cor={EST_CORES[item.name] || 'bg-secondary'} />
                      ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Incidentes nos últimos 6 meses</div>
                <div className="card-body p-0">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light"><tr><th>Mês</th><th className="text-center">Incidentes</th></tr></thead>
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
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Documentos por Tipo</div>
                <div className="card-body">
                  {documentosPorTipo.length === 0
                    ? <p className="text-muted text-center py-3">Sem dados.</p>
                    : documentosPorTipo.map((item) => (
                        <BarraProgresso key={item.name} label={item.name} valor={item.value} total={totalDoc} cor={DOC_CORES[item.name] || 'bg-secondary'} />
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

export default GestorAnalises;

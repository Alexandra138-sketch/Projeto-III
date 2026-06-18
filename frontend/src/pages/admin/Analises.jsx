import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
  Legend,
} from 'recharts';

const MES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SEVERIDADE_CORES = {
  Crítico: '#ef4444',
  Alto: '#f97316',
  Médio: '#3b82f6',
  Baixo: '#22c55e',
};
const ESTADO_CORES = {
  Aberto: '#2563eb',
  'A Investigar': '#f59e0b',
  Resolvido: '#16a34a',
  Fechado: '#64748b',
};
const DOCUMENTO_TIPOS_CORES = {
  Política: '#6366f1',
  Pentest: '#22c55e',
  Auditoria: '#f59e0b',
  Contrato: '#ec4899',
  Relatório: '#14b8a6',
};

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
  return item.created_at || item.createdAt || item.data_criacao || item.createdAt;
}

const CHART_HEIGHT = 250;

function Analises() {
  const [incidentes, setIncidentes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    // allSettled garante que se uma chamada falhar, as outras ainda carregam
    Promise.allSettled([
      api.get('/incidentes'),
      api.get('/clientes'),
      api.get('/documentos'),
      api.get('/servicos'),
    ])
      .then(([incRes, cliRes, docRes, servRes]) => {
        if (incRes.status === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
        if (cliRes.status === 'fulfilled') setClientes(Array.isArray(cliRes.value.data) ? cliRes.value.data : []);
        if (docRes.status === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data) ? docRes.value.data : []);
        if (servRes.status === 'fulfilled') setServicos(Array.isArray(servRes.value.data) ? servRes.value.data : []);

        // Só mostrar erro se TODAS as chamadas falharam
        const todasFalharam = [incRes, cliRes, docRes, servRes].every(r => r.status === 'rejected');
        if (todasFalharam) setErro('Não foi possível carregar os dados de análises.');
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  const mesesUltimosSeis = useMemo(() => buildLastMonths(6), []);

  const incidentesPorSeveridade = useMemo(() => {
    const mapa = {};
    incidentes.forEach((inc) => {
      const chave = inc.severidade || 'Outro';
      mapa[chave] = (mapa[chave] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value, cor: SEVERIDADE_CORES[name] || '#64748b' }));
  }, [incidentes]);

  const incidentesPorEstado = useMemo(() => {
    const mapa = {};
    incidentes.forEach((inc) => {
      const chave = inc.estado || 'Outro';
      mapa[chave] = (mapa[chave] || 0) + 1;
    });
    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value, cor: ESTADO_CORES[name] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
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
    documentos.forEach((doc) => {
      const tipo = doc.tipo || 'Outro';
      mapa[tipo] = (mapa[tipo] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value, cor: DOCUMENTO_TIPOS_CORES[name] || '#64748b' }));
  }, [documentos]);

  const clientesPorEstado = useMemo(() => {
    const mapa = { Ativo: 0, Inativo: 0 };
    clientes.forEach((cliente) => {
      const estado = cliente.estado || 'Inativo';
      mapa[estado] = (mapa[estado] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value, cor: name === 'Ativo' ? '#22c55e' : '#94a3b8' }));
  }, [clientes]);

  const servicosStatus = useMemo(() => {
    const ativo = servicos.filter((s) => s.ativo).length;
    const inativo = servicos.length - ativo;
    return [
      { name: 'Ativos', value: ativo, cor: '#3b82f6' },
      { name: 'Inativos', value: inativo, cor: '#94a3b8' },
    ];
  }, [servicos]);

  const totalIncidentes = incidentes.length;
  const totalClientes = clientes.length;
  const totalDocumentos = documentos.length;
  const totalServicos = servicos.length;

  return (
    <AdminLayout>
      <div className="dash-banner">
        <h4>Análises &amp; Gráficos</h4>
        <p>Resumo visual dos indicadores mais importantes da plataforma.</p>
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalIncidentes}</div>
              <div className="stat-label">Incidentes</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalClientes}</div>
              <div className="stat-label">Clientes</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalDocumentos}</div>
              <div className="stat-label">Documentos</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : totalServicos}</div>
              <div className="stat-label">Serviços</div>
            </div>
          </div>
        </div>
      </div>

      {erro ? (
        <div className="dash-card" style={{ textAlign: 'center', color: '#ef4444' }}>
          {erro}
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="dash-card chart-card">
                <h5>Incidentes por Severidade</h5>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <PieChart>
                      <Pie
                        data={incidentesPorSeveridade}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={40}
                      >
                        {incidentesPorSeveridade.map((entry) => (
                          <Cell key={entry.name} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {incidentesPorSeveridade.map((item) => (
                      <div className="pie-legend-item" key={item.name}>
                        <span className="pie-dot" style={{ backgroundColor: item.cor }}></span>
                        {item.name}: {item.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="dash-card chart-card">
                <h5>Incidentes por Estado</h5>
                <div className="chart-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <BarChart 
                      data={incidentesPorEstado}
                      margin={{ top: 15, right: 10, left: 10, bottom: 35 }}
                    >
                      <defs>
                        {incidentesPorEstado.map((entry, idx) => (
                          <linearGradient key={`barGrad-${idx}`} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={entry.cor} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={entry.cor} stopOpacity={0.6} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }} 
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        formatter={(value) => [value, 'Quantidade']}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {incidentesPorEstado.map((entry, idx) => (
                          <Cell key={entry.name} fill={`url(#barGrad-${idx})`} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Incidentes nos últimos 6 meses</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={incidentesPorMes} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="quantidade" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Documentos por Tipo</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={documentosPorTipo}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {documentosPorTipo.map((entry) => (
                        <Cell key={entry.name} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Clientes por Estado</h5>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={clientesPorEstado} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]}>
                      {clientesPorEstado.map((entry) => (
                        <Cell key={entry.name} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Serviços Ativos / Inativos</h5>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={servicosStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                    >
                      {servicosStatus.map((entry) => (
                        <Cell key={entry.name} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default Analises;

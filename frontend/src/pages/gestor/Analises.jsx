import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
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
} from 'recharts';

// ── Constantes de cores e labels ──
const MES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const SEVERIDADE_CORES = {
  Crítico: '#ef4444',
  Alto:    '#f97316',
  Médio:   '#3b82f6',
  Baixo:   '#22c55e',
};

const ESTADO_CORES = {
  Aberto:          '#2563eb',
  'A Investigar':  '#f59e0b',
  Resolvido:       '#16a34a',
  Fechado:         '#64748b',
};

const DOCUMENTO_TIPOS_CORES = {
  Política:  '#6366f1',
  Pentest:   '#22c55e',
  Auditoria: '#f59e0b',
  Contrato:  '#ec4899',
  Relatório: '#14b8a6',
};

// ── Funções auxiliares ──
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

function GestorAnalises() {
  const { utilizador } = useAuth();

  const [incidentes, setIncidentes] = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');

  // ── Carregar dados filtrados pelo backend (gestor só vê os seus clientes) ──
  useEffect(() => {
    setCarregando(true);
    // allSettled: se uma chamada falhar, as outras ainda carregam
    Promise.allSettled([
      api.get('/incidentes'),
      api.get('/clientes'),
      api.get('/documentos'),
    ])
      .then(([incRes, cliRes, docRes]) => {
        if (incRes.status === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
        if (cliRes.status === 'fulfilled') setClientes(Array.isArray(cliRes.value.data)   ? cliRes.value.data   : []);
        if (docRes.status === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data) ? docRes.value.data   : []);

        const todasFalharam = [incRes, cliRes, docRes].every(r => r.status === 'rejected');
        if (todasFalharam) setErro('Não foi possível carregar os dados.');
      })
      .finally(() => setCarregando(false));
  }, []);

  const mesesUltimosSeis = useMemo(() => buildLastMonths(6), []);

  // ── Incidentes por severidade (gráfico de donut) ──
  const incidentesPorSeveridade = useMemo(() => {
    const mapa = {};
    incidentes.forEach(inc => {
      const chave = inc.severidade || 'Outro';
      mapa[chave] = (mapa[chave] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({
      name, value, cor: SEVERIDADE_CORES[name] || '#64748b',
    }));
  }, [incidentes]);

  // ── Incidentes por estado (gráfico de barras) ──
  const incidentesPorEstado = useMemo(() => {
    const mapa = {};
    incidentes.forEach(inc => {
      const chave = inc.estado || 'Outro';
      mapa[chave] = (mapa[chave] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({
      name, value, cor: ESTADO_CORES[name] || '#64748b',
    }));
  }, [incidentes]);

  // ── Incidentes por mês (últimos 6 meses) ──
  const incidentesPorMes = useMemo(() => {
    const mapa = {};
    incidentes.forEach(inc => {
      const d = parseDate(inc.created_at || inc.createdAt);
      if (!d) return;
      const label = formatMonthLabel(d);
      mapa[label] = (mapa[label] || 0) + 1;
    });
    return mesesUltimosSeis.map(month => ({ month, quantidade: mapa[month] || 0 }));
  }, [incidentes, mesesUltimosSeis]);

  // ── Documentos por tipo ──
  const documentosPorTipo = useMemo(() => {
    const mapa = {};
    documentos.forEach(doc => {
      const tipo = doc.tipo || 'Outro';
      mapa[tipo] = (mapa[tipo] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({
      name, value, cor: DOCUMENTO_TIPOS_CORES[name] || '#64748b',
    }));
  }, [documentos]);

  // ── Clientes por estado ──
  const clientesPorEstado = useMemo(() => {
    const mapa = { Ativo: 0, Inativo: 0 };
    clientes.forEach(c => {
      const estado = c.estado || 'Inativo';
      mapa[estado] = (mapa[estado] || 0) + 1;
    });
    return Object.entries(mapa).map(([name, value]) => ({
      name, value, cor: name === 'Ativo' ? '#22c55e' : '#94a3b8',
    }));
  }, [clientes]);

  // ── Incidentes resolvidos vs abertos (taxa de resolução) ──
  const taxaResolucao = useMemo(() => {
    const resolvidos = incidentes.filter(i => i.estado === 'Resolvido' || i.estado === 'Fechado').length;
    const abertos    = incidentes.length - resolvidos;
    return [
      { name: 'Resolvidos', value: resolvidos, cor: '#16a34a' },
      { name: 'Por resolver', value: abertos,  cor: '#ef4444' },
    ];
  }, [incidentes]);

  return (
    <AdminLayout>
      {/* ── Banner com totais ── */}
      <div className="dash-banner">
        <h4>Análises &amp; Gráficos</h4>
        <p>Resumo visual dos teus clientes e incidentes.</p>
        <div className="row g-3">
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : clientes.length}</div>
              <div className="stat-label">Clientes</div>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : incidentes.length}</div>
              <div className="stat-label">Incidentes</div>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : documentos.length}</div>
              <div className="stat-label">Documentos</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Erro geral ── */}
      {erro && (
        <div className="dash-card" style={{ textAlign: 'center', color: '#ef4444' }}>
          {erro}
        </div>
      )}

      {/* ── Gráficos ── */}
      {!erro && (
        <>
          {/* Linha 1: Severidade + Estado */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Incidentes por Severidade</h5>
                {incidentesPorSeveridade.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={incidentesPorSeveridade}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                        >
                          {incidentesPorSeveridade.map(entry => (
                            <Cell key={entry.name} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                      {incidentesPorSeveridade.map(item => (
                        <div className="pie-legend-item" key={item.name}>
                          <span className="pie-dot" style={{ backgroundColor: item.cor }}></span>
                          {item.name}: {item.value}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Incidentes por Estado</h5>
                {incidentesPorEstado.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={incidentesPorEstado} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {incidentesPorEstado.map(entry => (
                          <Cell key={entry.name} fill={entry.cor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Linha 2: Incidentes por mês + Taxa de resolução */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Incidentes nos últimos 6 meses</h5>
                <ResponsiveContainer width="100%" height={260}>
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
                <h5>Taxa de Resolução</h5>
                {taxaResolucao.every(t => t.value === 0) ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={taxaResolucao}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                        >
                          {taxaResolucao.map(entry => (
                            <Cell key={entry.name} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                      {taxaResolucao.map(item => (
                        <div className="pie-legend-item" key={item.name}>
                          <span className="pie-dot" style={{ backgroundColor: item.cor }}></span>
                          {item.name}: {item.value}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Linha 3: Documentos por tipo + Clientes por estado */}
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Documentos por Tipo</h5>
                {documentosPorTipo.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
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
                        {documentosPorTipo.map(entry => (
                          <Cell key={entry.name} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="dash-card">
                <h5>Os Meus Clientes por Estado</h5>
                {clientes.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem dados</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={clientesPorEstado} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {clientesPorEstado.map(entry => (
                          <Cell key={entry.name} fill={entry.cor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default GestorAnalises;

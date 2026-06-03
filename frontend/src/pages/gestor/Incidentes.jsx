import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Shield, AlertTriangle, Loader, Trash2 } from 'lucide-react';

/* ── Mapas de estilo (valores reais da BD) ── */
const SEV = {
  'Crítico': { label: 'Crítico', dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  'Alto':    { label: 'Alto',    dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  'Médio':   { label: 'Médio',   dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  'Baixo':   { label: 'Baixo',   dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

const STA = {
  'Aberto':       { label: 'Aberto',       bg: '#dbeafe', cor: '#2563eb' },
  'A Investigar': { label: 'A Investigar', bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { label: 'Resolvido',    bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { label: 'Fechado',      bg: '#f1f5f9', cor: '#64748b' },
};

/* ── Modal de criação / edição ── */
function ModalIncidente({ incidente, clientes, onClose, onGuardar }) {
  const { utilizador } = useAuth();
  const [form, setForm] = useState({
    titulo:        incidente?.titulo        || '',
    severidade:    incidente?.severidade    || 'Médio',
    estado:        incidente?.estado        || 'Aberto',
    descricao:     incidente?.descricao     || '',
    nis2_notificado: incidente?.nis2_notificado || false,
    cliente_id:    incidente?.cliente_id    || '',
    reportado_por: incidente?.reportado_por || utilizador?.id || '',
  });
  const [a_guardar, setAGuardar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    await onGuardar(form);
    setAGuardar(false);
  };

  const campo = (label, children, required = false) => (
    <div className="mb-3">
      <label className="form-label">{label}{required && ' *'}</label>
      {children}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>{incidente?.id ? 'Editar Incidente' : 'Reportar Incidente'}</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {campo('Título', (
              <input
                required
                className="form-input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Descreva o incidente brevemente"
              />
            ), true)}

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Severidade</label>
                <select className="form-select" value={form.severidade} onChange={(e) => setForm({ ...form, severidade: e.target.value })}>
                  <option>Crítico</option>
                  <option>Alto</option>
                  <option>Médio</option>
                  <option>Baixo</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  <option>Aberto</option>
                  <option>A Investigar</option>
                  <option>Resolvido</option>
                  <option>Fechado</option>
                </select>
              </div>
            </div>

            {campo('Cliente', (
              <select
                className="form-select"
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              >
                <option value="">— Selecionar cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            ))}

            {campo('Descrição', (
              <textarea
                required
                rows={4}
                className="form-textarea"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o que aconteceu, sistemas afetados, impacto…"
              />
            ), true)}

            <div
              className="nis2-checkbox mb-3"
              onClick={() => setForm({ ...form, nis2_notificado: !form.nis2_notificado })}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                id="nis2"
                checked={form.nis2_notificado}
                onChange={(e) => setForm({ ...form, nis2_notificado: e.target.checked })}
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="nis2" style={{ cursor: 'pointer' }}>
                <Shield size={14} /> Notificado às autoridades NIS2 (CNCS/ENISA)
              </label>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={a_guardar}>
              {a_guardar ? 'A guardar…' : (incidente?.id ? 'Guardar Alterações' : 'Reportar Incidente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Modal de confirmação de eliminação ── */
function ModalConfirmar({ titulo, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>Eliminar Incidente</h5>
          <button className="modal-close" onClick={onCancelar}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Tem a certeza que pretende eliminar o incidente <strong>"{titulo}"</strong>?
            Esta ação não pode ser revertida.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
          <button className="btn-guardar" style={{ background: '#ef4444' }} onClick={onConfirmar}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
function GestorIncidentes() {
  const [incidentes, setIncidentes] = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa,   setPesquisa]   = useState('');
  const [filtroSev,  setFiltroSev]  = useState('all');
  const [filtroEst,  setFiltroEst]  = useState('all');
  const [modal,      setModal]      = useState(undefined); // undefined=fechado, null=novo, obj=editar
  const [aEliminar,  setAEliminar]  = useState(null);

  /* ── Carregar dados (Axios) ── */
  useEffect(() => {
    Promise.all([api.get('/incidentes'), api.get('/clientes')])
      .then(([i, c]) => { setIncidentes(i.data); setClientes(c.data); })
      .catch((err) => console.error('Erro ao carregar incidentes:', err))
      .finally(() => setCarregando(false));
  }, []);

  /* ── Filtros ── */
  const filtrados = incidentes.filter((i) => {
    const matchP = i.titulo?.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   i.descricao?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchS = filtroSev === 'all' || i.severidade === filtroSev;
    const matchE = filtroEst === 'all' || i.estado     === filtroEst;
    return matchP && matchS && matchE;
  });

  const totalAbertos  = incidentes.filter((i) => i.estado === 'Aberto').length;
  const totalCriticos = incidentes.filter((i) => i.severidade === 'Crítico' && i.estado !== 'Fechado' && i.estado !== 'Resolvido').length;
  const totalNis2     = incidentes.filter((i) => i.nis2_notificado).length;

  /* ── CRUD ── */
  const handleGuardar = async (dados) => {
    try {
      if (modal?.id) {
        const { data } = await api.put(`/incidentes/update/${modal.id}`, dados);
        setIncidentes((prev) => prev.map((i) => i.id === modal.id ? { ...i, ...data } : i));
      } else {
        const { data } = await api.post('/incidentes/create', dados);
        setIncidentes((prev) => [data, ...prev]);
      }
      setModal(undefined);
    } catch (err) {
      console.error('Erro ao guardar incidente:', err);
    }
  };

  const handleEliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/incidentes/delete/${aEliminar.id}`);
      setIncidentes((prev) => prev.filter((i) => i.id !== aEliminar.id));
      setAEliminar(null);
    } catch (err) {
      console.error('Erro ao eliminar incidente:', err);
    }
  };

  return (
    <AdminLayout>

      {/* Cabeçalho */}
      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Incidentes</h4>
          <p className="incidentes-subtitulo">
            {carregando ? 'A carregar…' : `${incidentes.length} incidentes · ${totalAbertos} abertos · ${totalCriticos} críticos`}
          </p>
        </div>
        <button className="btn-gradient" onClick={() => setModal(null)}>
          <Plus size={16} /> Reportar Incidente
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="resumo-cards">
        {[
          { numero: carregando ? '…' : totalAbertos,       label: 'Abertos',         classe: 'card-aberto'  },
          { numero: carregando ? '…' : totalCriticos,      label: 'Críticos Ativos',  classe: 'card-critico' },
          { numero: carregando ? '…' : totalNis2,          label: 'Notificados NIS2', classe: 'card-nis2'    },
          { numero: carregando ? '…' : incidentes.length,  label: 'Total',            classe: 'card-total'   },
        ].map(({ numero, label, classe }) => (
          <div key={label} className={`resumo-card ${classe}`}>
            <p className="resumo-numero">{numero}</p>
            <p className="resumo-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="dash-card filtros-bar">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="pesquisa-wrapper">
            <Search size={15} />
            <input
              placeholder="Pesquisar incidentes…"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>
          <select value={filtroSev} onChange={(e) => setFiltroSev(e.target.value)}>
            <option value="all">Todas severidades</option>
            <option>Crítico</option>
            <option>Alto</option>
            <option>Médio</option>
            <option>Baixo</option>
          </select>
          <select value={filtroEst} onChange={(e) => setFiltroEst(e.target.value)}>
            <option value="all">Todos os estados</option>
            <option>Aberto</option>
            <option>A Investigar</option>
            <option>Resolvido</option>
            <option>Fechado</option>
          </select>
          <span className="filtros-count ms-auto">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar incidentes…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          Nenhum incidente encontrado com os filtros selecionados.
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
                  <span className="badge-pill" style={{ background: sev.bg, color: sev.cor }}>{sev.label}</span>
                  <span className="badge-pill" style={{ background: sta.bg, color: sta.cor }}>{sta.label}</span>
                  {inc.nis2_notificado && (
                    <span className="badge-pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                      <Shield size={10} /> NIS2
                    </span>
                  )}
                </div>
                {inc.descricao && <p className="incidente-descricao">{inc.descricao}</p>}
                <div className="d-flex flex-wrap gap-3">
                  {inc.cliente?.nome && <span className="incidente-data">Cliente: {inc.cliente.nome}</span>}
                  {inc.reportador?.nome && <span className="incidente-data">Reportado por: {inc.reportador.nome}</span>}
                  {inc.created_at && <span className="incidente-data">{new Date(inc.created_at).toLocaleDateString('pt-PT')}</span>}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn-editar" onClick={() => setModal(inc)}>Editar</button>
                <button
                  onClick={() => setAEliminar(inc)}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal criar/editar */}
      {modal !== undefined && (
        <ModalIncidente
          incidente={modal}
          clientes={clientes}
          onClose={() => setModal(undefined)}
          onGuardar={handleGuardar}
        />
      )}

      {/* Modal confirmar eliminação */}
      {aEliminar && (
        <ModalConfirmar
          titulo={aEliminar.titulo}
          onConfirmar={handleEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}

    </AdminLayout>
  );
}

export default GestorIncidentes;

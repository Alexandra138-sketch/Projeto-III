import { useEffect, useState } from 'react';
import { Plus, Search, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

// ── Mapeamento de severidade (valores da BD) ──
const SEV = {
  'Crítico': { label: 'Crítico', dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  'Alto':    { label: 'Alto',    dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  'Médio':   { label: 'Médio',   dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  'Baixo':   { label: 'Baixo',   dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

// ── Mapeamento de estado (valores da BD) ──
const STA = {
  'Aberto':       { label: 'Aberto',       bg: '#dbeafe', cor: '#2563eb' },
  'A Investigar': { label: 'A Investigar', bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { label: 'Resolvido',    bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { label: 'Fechado',      bg: '#f1f5f9', cor: '#64748b' },
};

function ModalIncidente({ incidente, clientes, onClose, onGuardar }) {
  const { utilizador } = useAuth();
  const [form, setForm] = useState({
    titulo:         incidente?.titulo         || '',
    severidade:     incidente?.severidade     || 'Médio',
    estado:         incidente?.estado         || 'Aberto',
    descricao:      incidente?.descricao      || '',
    nis2_notificado: incidente?.nis2_notificado || false,
    cliente_id:     incidente?.cliente_id     || '',
  });
  const [a_guardar, setAGuardar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    await onGuardar(form, incidente?.id);
    setAGuardar(false);
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
              <input
                required
                className="form-input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Severidade</label>
                <select
                  className="form-select"
                  value={form.severidade}
                  onChange={(e) => setForm({ ...form, severidade: e.target.value })}
                >
                  <option value="Crítico">Crítico</option>
                  <option value="Alto">Alto</option>
                  <option value="Médio">Médio</option>
                  <option value="Baixo">Baixo</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  <option value="Aberto">Aberto</option>
                  <option value="A Investigar">A Investigar</option>
                  <option value="Resolvido">Resolvido</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Cliente *</label>
              <select
                required
                className="form-select"
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              >
                <option value="">— Selecionar cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Descrição *</label>
              <textarea
                required
                rows={4}
                className="form-textarea"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div
              className="nis2-checkbox mb-3"
              onClick={() => setForm({ ...form, nis2_notificado: !form.nis2_notificado })}
            >
              <input
                type="checkbox"
                id="nis2"
                checked={form.nis2_notificado}
                onChange={(e) => setForm({ ...form, nis2_notificado: e.target.checked })}
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="nis2">
                <Shield size={14} /> Notificado às autoridades NIS2 (CNCS/ENISA)
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={a_guardar}>
              {a_guardar ? 'A guardar…' : incidente?.id ? 'Guardar' : 'Reportar Incidente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

function AdminIncidentes() {
  const [incidentes,   setIncidentes]   = useState([]);
  const [clientes,     setClientes]     = useState([]);
  const [carregando,   setCarregando]   = useState(true);
  const [pesquisa,     setPesquisa]     = useState('');
  const [filtroSev,    setFiltroSev]    = useState('all');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [modal,        setModal]        = useState(undefined);
  const [aEliminar,    setAEliminar]    = useState(null);

  // ── Carregar incidentes e clientes reais da BD ──
  useEffect(() => {
    setCarregando(true);
    Promise.all([api.get('/incidentes'), api.get('/clientes')])
      .then(([resIncidentes, resClientes]) => {
        setIncidentes(Array.isArray(resIncidentes.data) ? resIncidentes.data : []);
        setClientes(Array.isArray(resClientes.data) ? resClientes.data : []);
      })
      .catch(() => {
        setIncidentes([]);
        setClientes([]);
      })
      .finally(() => setCarregando(false));
  }, []);

  const totalAbertos  = incidentes.filter((i) => i.estado === 'Aberto').length;
  const totalCriticos = incidentes.filter((i) => i.severidade === 'Crítico' && i.estado !== 'Fechado' && i.estado !== 'Resolvido').length;
  const totalNis2     = incidentes.filter((i) => i.nis2_notificado).length;

  const filtrados = incidentes.filter((i) => {
    const matchP = (i.titulo || '').toLowerCase().includes(pesquisa.toLowerCase())
                || (i.descricao || '').toLowerCase().includes(pesquisa.toLowerCase());
    const matchS = filtroSev    === 'all' || i.severidade === filtroSev;
    const matchE = filtroEstado === 'all' || i.estado     === filtroEstado;
    return matchP && matchS && matchE;
  });

  // ── Criar ou atualizar incidente via API ──
  const handleGuardar = async (dados, id) => {
    try {
      if (id) {
        // Atualizar incidente existente
        const { data } = await api.put(`/incidentes/update/${id}`, dados);
        setIncidentes((prev) => prev.map((i) => i.id === id ? data : i));
      } else {
        // Criar novo incidente
        const { data } = await api.post('/incidentes/create', dados);
        setIncidentes((prev) => [data, ...prev]);
      }
      setModal(undefined);
    } catch (err) {
      alert(err?.response?.data?.erro || 'Erro ao guardar incidente. Verifica os campos obrigatórios.');
    }
  };

  // ── Eliminar incidente via API ──
  const handleEliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/incidentes/delete/${aEliminar.id}`);
      setIncidentes((prev) => prev.filter((i) => i.id !== aEliminar.id));
      setAEliminar(null);
    } catch (err) {
      console.error('Erro ao eliminar incidente:', err);
      alert(err?.response?.data?.erro || 'Erro ao eliminar incidente.');
    }
  };

  return (
    <AdminLayout>
      {/* Cabeçalho */}
      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Gestão de Incidentes</h4>
          <p className="incidentes-subtitulo">
            {incidentes.length} incidentes · {totalAbertos} abertos · {totalCriticos} críticos
          </p>
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
            <input
              placeholder="Pesquisar incidentes..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>
          <select value={filtroSev} onChange={(e) => setFiltroSev(e.target.value)}>
            <option value="all">Todas severidades</option>
            <option value="Crítico">Crítico</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="all">Todos os estados</option>
            <option value="Aberto">Aberto</option>
            <option value="A Investigar">A Investigar</option>
            <option value="Resolvido">Resolvido</option>
            <option value="Fechado">Fechado</option>
          </select>
          <span className="filtros-count ms-auto">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Estado de carregamento */}
      {carregando && (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          A carregar incidentes…
        </div>
      )}

      {/* Lista de incidentes */}
      {!carregando && filtrados.map((inc) => {
        const sev = SEV[inc.severidade] || SEV['Médio'];
        const sta = STA[inc.estado]     || STA['Aberto'];
        return (
          <div key={inc.id} className="dash-card incidente-card">
            <div className="d-flex align-items-start gap-3">
              <div className="incidente-dot" style={{ backgroundColor: sev.dot }} />
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
                <p className="incidente-descricao">{inc.descricao}</p>
                <div className="d-flex flex-wrap gap-3">
                  {inc.reportador?.nome && (
                    <span className="incidente-data">Reportado por: {inc.reportador.nome}</span>
                  )}
                  {inc.created_at && (
                    <span className="incidente-data">
                      {new Date(inc.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2 flex-shrink-0">
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

      {!carregando && filtrados.length === 0 && (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          {incidentes.length === 0
            ? 'Ainda não há incidentes registados.'
            : 'Nenhum incidente encontrado com os filtros selecionados.'}
        </div>
      )}

      {modal !== undefined && (
        <ModalIncidente
          incidente={modal}
          clientes={clientes}
          onClose={() => setModal(undefined)}
          onGuardar={handleGuardar}
        />
      )}

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

export default AdminIncidentes;
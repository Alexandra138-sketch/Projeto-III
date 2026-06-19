import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SEV_BADGE = { 'Crítico': 'badge bg-danger', 'Alto': 'badge bg-warning text-dark', 'Médio': 'badge bg-primary', 'Baixo': 'badge bg-success' };
const STA_BADGE = { 'Aberto': 'badge bg-primary', 'A Investigar': 'badge bg-warning text-dark', 'Resolvido': 'badge bg-success', 'Fechado': 'badge bg-secondary' };

/* ── Modal ── */
function ModalIncidente({ incidente, clientes, onClose, onGuardar }) {
  const { utilizador } = useAuth();
  const [form, setForm] = useState({
    titulo:          incidente?.titulo          || '',
    severidade:      incidente?.severidade      || 'Médio',
    estado:          incidente?.estado          || 'Aberto',
    descricao:       incidente?.descricao       || '',
    nis2_notificado: incidente?.nis2_notificado || false,
    cliente_id:      incidente?.cliente_id      || '',
    reportado_por:   incidente?.reportado_por   || utilizador?.id || '',
  });
  const [a_guardar, setAGuardar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    await onGuardar(form);
    setAGuardar(false);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{incidente?.id ? 'Editar Incidente' : 'Reportar Incidente'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label fw-semibold">Título *</label>
                <input required type="text" className="form-control" value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Descreva o incidente brevemente" />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Severidade</label>
                  <select className="form-select" value={form.severidade} onChange={(e) => setForm({ ...form, severidade: e.target.value })}>
                    <option>Crítico</option><option>Alto</option><option>Médio</option><option>Baixo</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                    <option>Aberto</option><option>A Investigar</option><option>Resolvido</option><option>Fechado</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Cliente</label>
                  <select className="form-select" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                    <option value="">— Selecionar —</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descrição *</label>
                <textarea required rows={4} className="form-control" value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva o que aconteceu, sistemas afetados, impacto…" />
              </div>

              <div className="form-check mb-3">
                <input type="checkbox" className="form-check-input" id="nis2" checked={form.nis2_notificado}
                  onChange={(e) => setForm({ ...form, nis2_notificado: e.target.checked })} />
                <label className="form-check-label" htmlFor="nis2">
                  Notificado às autoridades NIS2 (CNCS/ENISA)
                </label>
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={a_guardar}>
                {a_guardar ? 'A guardar…' : (incidente?.id ? 'Guardar Alterações' : 'Reportar Incidente')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmar({ titulo, onConfirmar, onCancelar }) {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onCancelar}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">Eliminar Incidente</h5>
            <button type="button" className="btn-close" onClick={onCancelar}></button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-0">Tem a certeza que pretende eliminar <strong>"{titulo}"</strong>? Esta ação não pode ser revertida.</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
            <button className="btn btn-danger" onClick={onConfirmar}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GestorIncidentes() {
  const [incidentes, setIncidentes] = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa,   setPesquisa]   = useState('');
  const [filtroSev,  setFiltroSev]  = useState('all');
  const [filtroEst,  setFiltroEst]  = useState('all');
  const [modal,      setModal]      = useState(undefined);
  const [aEliminar,  setAEliminar]  = useState(null);

  useEffect(() => {
    Promise.all([api.get('/incidentes'), api.get('/clientes')])
      .then(([i, c]) => { setIncidentes(i.data); setClientes(c.data); })
      .catch((err) => console.error('Erro:', err))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = incidentes.filter((i) => {
    const matchP = i.titulo?.toLowerCase().includes(pesquisa.toLowerCase()) || i.descricao?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchS = filtroSev === 'all' || i.severidade === filtroSev;
    const matchE = filtroEst === 'all' || i.estado     === filtroEst;
    return matchP && matchS && matchE;
  });

  const totalAbertos  = incidentes.filter((i) => i.estado === 'Aberto').length;
  const totalCriticos = incidentes.filter((i) => i.severidade === 'Crítico' && i.estado !== 'Fechado' && i.estado !== 'Resolvido').length;
  const totalNis2     = incidentes.filter((i) => i.nis2_notificado).length;

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
    } catch (err) { console.error('Erro ao guardar:', err); }
  };

  const handleEliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/incidentes/delete/${aEliminar.id}`);
      setIncidentes((prev) => prev.filter((i) => i.id !== aEliminar.id));
      setAEliminar(null);
    } catch (err) { console.error('Erro ao eliminar:', err); }
  };

  return (
    <AdminLayout>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Incidentes</h4>
          <p className="text-muted mb-0">{carregando ? 'A carregar…' : `${incidentes.length} incidentes · ${totalAbertos} abertos · ${totalCriticos} críticos`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(null)}>+ Reportar Incidente</button>
      </div>

      <div className="row g-3 mb-4">
        {[
          { numero: carregando ? '…' : totalAbertos,      label: 'Abertos',         bg: 'bg-primary'   },
          { numero: carregando ? '…' : totalCriticos,     label: 'Críticos Ativos', bg: 'bg-danger'    },
          { numero: carregando ? '…' : totalNis2,         label: 'Notif. NIS2',     bg: 'bg-warning'   },
          { numero: carregando ? '…' : incidentes.length, label: 'Total',           bg: 'bg-secondary' },
        ].map(({ numero, label, bg }) => (
          <div key={label} className="col-6 col-md-3">
            <div className={`card text-white ${bg}`}>
              <div className="card-body text-center py-3">
                <h3 className="fw-bold mb-1">{numero}</h3>
                <p className="mb-0 small">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="🔍 Pesquisar incidentes…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroSev} onChange={(e) => setFiltroSev(e.target.value)}>
                <option value="all">Todas as severidades</option>
                <option>Crítico</option><option>Alto</option><option>Médio</option><option>Baixo</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroEst} onChange={(e) => setFiltroEst(e.target.value)}>
                <option value="all">Todos os estados</option>
                <option>Aberto</option><option>A Investigar</option><option>Resolvido</option><option>Fechado</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <span className="text-muted small">{filtrados.length} resultado(s)</span>
            </div>
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border mb-3" role="status"></div>
          <p>A carregar incidentes…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card"><div className="card-body text-center py-5 text-muted">Nenhum incidente encontrado.</div></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Título</th>
                <th>Severidade</th>
                <th>Estado</th>
                <th>NIS2</th>
                <th>Cliente</th>
                <th>Data</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <p className="mb-0 fw-semibold small">{inc.titulo}</p>
                    {inc.descricao && <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{inc.descricao.slice(0, 60)}…</p>}
                  </td>
                  <td><span className={SEV_BADGE[inc.severidade] || 'badge bg-secondary'}>{inc.severidade}</span></td>
                  <td><span className={STA_BADGE[inc.estado] || 'badge bg-secondary'}>{inc.estado}</span></td>
                  <td>{inc.nis2_notificado ? <span className="badge bg-info text-dark">Sim</span> : <span className="badge bg-light text-muted">Não</span>}</td>
                  <td className="small">{inc.cliente?.nome || '—'}</td>
                  <td className="small text-muted">{inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}</td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-outline-warning btn-sm" onClick={() => setModal(inc)}>Editar</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => setAEliminar(inc)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== undefined && <ModalIncidente incidente={modal} clientes={clientes} onClose={() => setModal(undefined)} onGuardar={handleGuardar} />}
      {aEliminar && <ModalConfirmar titulo={aEliminar.titulo} onConfirmar={handleEliminar} onCancelar={() => setAEliminar(null)} />}

    </AdminLayout>
  );
}

export default GestorIncidentes;

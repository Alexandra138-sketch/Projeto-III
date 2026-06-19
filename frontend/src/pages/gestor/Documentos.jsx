import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const badgeEstado = (estado) => {
  if (estado === 'Ativo')      return 'badge bg-success';
  if (estado === 'Em Revisão') return 'badge bg-warning text-dark';
  if (estado === 'Expirado')   return 'badge bg-danger';
  return 'badge bg-secondary';
};

const badgeTipo = (tipo) => {
  if (tipo === 'Política')  return 'badge bg-primary';
  if (tipo === 'Pentest')   return 'badge bg-info text-dark';
  if (tipo === 'Auditoria') return 'badge bg-success';
  if (tipo === 'Contrato')  return 'badge bg-warning text-dark';
  return 'badge bg-secondary';
};

/* ── Modal ── */
function ModalDocumento({ documento, clientes, onClose, onGuardar }) {
  const { utilizador } = useAuth();
  const inputFicheiro = useRef(null);
  const [form, setForm] = useState({
    titulo:     documento?.titulo     || '',
    descricao:  documento?.descricao  || '',
    tipo:       documento?.tipo       || 'Política',
    versao:     documento?.versao     || 'v1.0',
    estado:     documento?.estado     || 'Ativo',
    cliente_id: documento?.cliente_id || '',
    criado_por: documento?.criado_por || utilizador?.id || '',
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
            <h5 className="modal-title">{documento?.id ? 'Editar Documento' : 'Adicionar Documento'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Título *</label>
                <input required type="text" className="form-control" value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Nome do documento" />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                    <option>Política</option><option>Pentest</option><option>Auditoria</option>
                    <option>Contrato</option><option>Relatório</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                    <option>Ativo</option><option>Em Revisão</option><option>Expirado</option>
                  </select>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Versão</label>
                  <input type="text" className="form-control" value={form.versao}
                    onChange={(e) => setForm({ ...form, versao: e.target.value })} placeholder="v1.0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Cliente</label>
                  <select className="form-select" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                    <option value="">— Selecionar —</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Descrição</label>
                <textarea rows={3} className="form-control" value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Breve descrição do conteúdo do documento…" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={a_guardar}>
                {a_guardar ? 'A guardar…' : (documento?.id ? 'Guardar Alterações' : 'Adicionar Documento')}
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
            <h5 className="modal-title text-danger">Eliminar Documento</h5>
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

/* ── Componente principal ── */
function GestorDocumentos() {
  const [documentos,  setDocumentos]  = useState([]);
  const [clientes,    setClientes]    = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [pesquisa,    setPesquisa]    = useState('');
  const [filtroTipo,  setFiltroTipo]  = useState('all');
  const [filtroEst,   setFiltroEst]   = useState('all');
  const [modal,       setModal]       = useState(undefined);
  const [aEliminar,   setAEliminar]   = useState(null);

  useEffect(() => {
    Promise.all([api.get('/documentos'), api.get('/clientes')])
      .then(([d, c]) => { setDocumentos(d.data); setClientes(c.data); })
      .catch((err) => console.error('Erro ao carregar documentos:', err))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = documentos.filter((d) => {
    const matchP = d.titulo?.toLowerCase().includes(pesquisa.toLowerCase()) || d.descricao?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchT = filtroTipo === 'all' || d.tipo   === filtroTipo;
    const matchE = filtroEst  === 'all' || d.estado === filtroEst;
    return matchP && matchT && matchE;
  });

  const totalAtivos    = documentos.filter((d) => d.estado === 'Ativo').length;
  const totalRevisao   = documentos.filter((d) => d.estado === 'Em Revisão').length;
  const totalExpirados = documentos.filter((d) => d.estado === 'Expirado').length;

  const handleGuardar = async (dados) => {
    try {
      const limpar = (obj) => ({ ...obj, cliente_id: obj.cliente_id || null, criado_por: obj.criado_por || null });
      if (modal?.id) {
        const { data } = await api.put(`/documentos/update/${modal.id}`, limpar(dados));
        setDocumentos((prev) => prev.map((d) => d.id === modal.id ? { ...d, ...data } : d));
      } else {
        const { data } = await api.post('/documentos/create', limpar(dados));
        setDocumentos((prev) => [data, ...prev]);
      }
      setModal(undefined);
    } catch (err) { console.error('Erro ao guardar documento:', err); }
  };

  const handleEliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/documentos/delete/${aEliminar.id}`);
      setDocumentos((prev) => prev.filter((d) => d.id !== aEliminar.id));
      setAEliminar(null);
    } catch (err) { console.error('Erro ao eliminar documento:', err); }
  };

  return (
    <AdminLayout>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Documentos</h4>
          <p className="text-muted mb-0">{carregando ? 'A carregar…' : `${documentos.length} documentos · ${totalAtivos} ativos · ${totalRevisao} em revisão`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(null)}>+ Adicionar Documento</button>
      </div>

      <div className="row g-3 mb-4">
        {[
          { numero: carregando ? '…' : totalAtivos,       label: 'Ativos',     bg: 'bg-success'   },
          { numero: carregando ? '…' : totalRevisao,      label: 'Em Revisão', bg: 'bg-warning'   },
          { numero: carregando ? '…' : totalExpirados,    label: 'Expirados',  bg: 'bg-danger'    },
          { numero: carregando ? '…' : documentos.length, label: 'Total',      bg: 'bg-secondary' },
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
              <input type="text" className="form-control" placeholder="🔍 Pesquisar documentos…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="all">Todos os tipos</option>
                <option>Política</option><option>Pentest</option><option>Auditoria</option>
                <option>Contrato</option><option>Relatório</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filtroEst} onChange={(e) => setFiltroEst(e.target.value)}>
                <option value="all">Todos os estados</option>
                <option>Ativo</option><option>Em Revisão</option><option>Expirado</option>
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
          <p>A carregar documentos…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card"><div className="card-body text-center py-5 text-muted">📄 Nenhum documento encontrado.</div></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Título</th><th>Tipo</th><th>Estado</th><th>Versão</th>
                <th>Cliente</th><th>Criado por</th><th>Data</th><th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((doc) => (
                <tr key={doc.id}>
                  <td className="fw-semibold">{doc.titulo}</td>
                  <td><span className={badgeTipo(doc.tipo)}>{doc.tipo}</span></td>
                  <td><span className={badgeEstado(doc.estado)}>{doc.estado}</span></td>
                  <td>{doc.versao || '—'}</td>
                  <td>{doc.cliente?.nome || '—'}</td>
                  <td>{doc.criador?.nome || '—'}</td>
                  <td className="small text-muted">{doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-PT') : '—'}</td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      {doc.ficheiro && (
                        <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${doc.ficheiro}`}
                          target="_blank" rel="noreferrer" className="btn btn-outline-info btn-sm" title="Descarregar">⬇</a>
                      )}
                      <button className="btn btn-outline-warning btn-sm" onClick={() => setModal(doc)}>Editar</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => setAEliminar(doc)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== undefined && <ModalDocumento documento={modal} clientes={clientes} onClose={() => setModal(undefined)} onGuardar={handleGuardar} />}
      {aEliminar && <ModalConfirmar titulo={aEliminar.titulo} onConfirmar={handleEliminar} onCancelar={() => setAEliminar(null)} />}

    </AdminLayout>
  );
}

export default GestorDocumentos;

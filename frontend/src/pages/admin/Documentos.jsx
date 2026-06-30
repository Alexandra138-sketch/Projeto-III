import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, FileText, Download, Loader, Trash2, Upload } from 'lucide-react';

const TIPO_CFG = {
  'Política':   { bg: '#dbeafe', cor: '#2563eb' },
  'Pentest':    { bg: '#ede9fe', cor: '#7c3aed' },
  'Auditoria':  { bg: '#f0fdf4', cor: '#16a34a' },
  'Contrato':   { bg: '#fff7ed', cor: '#c2410c' },
  'Relatório':  { bg: '#f8fafc', cor: '#475569' },
};

const EST_CFG = {
  'Ativo':      { bg: '#dcfce7', cor: '#16a34a' },
  'Em Revisão': { bg: '#fef9c3', cor: '#ca8a04' },
  'Expirado':   { bg: '#fee2e2', cor: '#dc2626' },
};

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
  const [ficheiro, setFicheiro] = useState(null);
  const [a_guardar, setAGuardar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    await onGuardar(form, ficheiro);
    setAGuardar(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>{documento?.id ? 'Editar Documento' : 'Adicionar Documento'}</h5>
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
                placeholder="Nome do documento"
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option>Política</option>
                  <option>Pentest</option>
                  <option>Auditoria</option>
                  <option>Contrato</option>
                  <option>Relatório</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  <option>Ativo</option>
                  <option>Em Revisão</option>
                  <option>Expirado</option>
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Versão</label>
                <input
                  className="form-input"
                  value={form.versao}
                  onChange={(e) => setForm({ ...form, versao: e.target.value })}
                  placeholder="v1.0"
                />
              </div>
              <div className="col-6">
                <label className="form-label">Cliente</label>
                <select className="form-select" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                  <option value="">— Selecionar —</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Breve descrição do conteúdo do documento…"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ficheiro</label>
              <div
                style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: 10,
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: ficheiro ? '#f0fdf4' : '#f8fafc',
                  color: '#64748b',
                }}
                onClick={() => inputFicheiro.current?.click()}
              >
                <Upload size={20} style={{ marginBottom: 6, color: ficheiro ? '#16a34a' : '#94a3b8' }} />
                <p style={{ margin: 0, fontSize: '0.8rem' }}>
                  {ficheiro ? ficheiro.name : 'Clique para selecionar um ficheiro do PC'}
                </p>
                {documento?.ficheiro && !ficheiro && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Ficheiro atual: {documento.ficheiro}
                  </p>
                )}
              </div>
              <input
                ref={inputFicheiro}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => setFicheiro(e.target.files[0] || null)}
              />
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={a_guardar}>
              {a_guardar ? 'A guardar…' : (documento?.id ? 'Guardar Alterações' : 'Adicionar Documento')}
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
          <h5>Eliminar Documento</h5>
          <button className="modal-close" onClick={onCancelar}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Tem a certeza que pretende eliminar o documento <strong>"{titulo}"</strong>?
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

function AdminDocumentos() {
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
      .catch((err) => console.error('Erro ao carregar dados:', err))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = documentos.filter((d) => {
    const matchP = d.titulo?.toLowerCase().includes(pesquisa.toLowerCase()) ||
                   d.descricao?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchT = filtroTipo === 'all' || d.tipo   === filtroTipo;
    const matchE = filtroEst  === 'all' || d.estado === filtroEst;
    return matchP && matchT && matchE;
  });

  const totalAtivos    = documentos.filter((d) => d.estado === 'Ativo').length;
  const totalRevisao   = documentos.filter((d) => d.estado === 'Em Revisão').length;
  const totalExpirados = documentos.filter((d) => d.estado === 'Expirado').length;

  const handleGuardar = async (dados, ficheiro) => {
    try {
      // converter strings vazias em null para campos inteiros
      const limpar = (obj) => ({
        ...obj,
        cliente_id: obj.cliente_id || null,
        criado_por: obj.criado_por  || null,
      });

      if (modal?.id) {
        const { data } = await api.put(`/documentos/update/${modal.id}`, limpar(dados));
        setDocumentos((prev) => prev.map((d) => d.id === modal.id ? { ...d, ...data } : d));
      } else {
        let resposta;
        if (ficheiro) {
          const fd = new FormData();
          const clean = limpar(dados);
          Object.entries(clean).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
          fd.append('ficheiro', ficheiro);
          resposta = await api.post('/documentos/create', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          resposta = await api.post('/documentos/create', limpar(dados));
        }
        setDocumentos((prev) => [resposta.data, ...prev]);
      }
      setModal(undefined);
    } catch (err) {
      console.error('Erro ao guardar documento:', err);
      alert('Erro ao guardar documento. Verifica a consola para detalhes.');
    }
  };

  const handleEliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.delete(`/documentos/delete/${aEliminar.id}`);
      setDocumentos((prev) => prev.filter((d) => d.id !== aEliminar.id));
      setAEliminar(null);
    } catch (err) {
      console.error('Erro ao eliminar documento:', err);
    }
  };

  return (
    <AdminLayout>

      <div className="incidentes-header">
        <div>
          <h4 className="incidentes-titulo">Documentos</h4>
          <p className="incidentes-subtitulo">
            {carregando ? 'A carregar…' : `${documentos.length} documentos · ${totalAtivos} ativos · ${totalRevisao} em revisão`}
          </p>
        </div>
        <button className="btn-gradient" onClick={() => setModal(null)}>
          <Plus size={16} /> Adicionar Documento
        </button>
      </div>

      <div className="resumo-cards">
        {[
          { numero: carregando ? '…' : totalAtivos,       label: 'Ativos',      classe: 'card-aberto'  },
          { numero: carregando ? '…' : totalRevisao,      label: 'Em Revisão',  classe: 'card-nis2'    },
          { numero: carregando ? '…' : totalExpirados,    label: 'Expirados',   classe: 'card-critico' },
          { numero: carregando ? '…' : documentos.length, label: 'Total',       classe: 'card-total'   },
        ].map(({ numero, label, classe }) => (
          <div key={label} className={`resumo-card ${classe}`}>
            <p className="resumo-numero">{numero}</p>
            <p className="resumo-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="dash-card filtros-bar">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="pesquisa-wrapper">
            <Search size={15} />
            <input
              placeholder="Pesquisar documentos…"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option>Política</option>
            <option>Pentest</option>
            <option>Auditoria</option>
            <option>Contrato</option>
            <option>Relatório</option>
          </select>
          <select value={filtroEst} onChange={(e) => setFiltroEst(e.target.value)}>
            <option value="all">Todos os estados</option>
            <option>Ativo</option>
            <option>Em Revisão</option>
            <option>Expirado</option>
          </select>
          <span className="filtros-count ms-auto">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {carregando ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar documentos…</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
          <FileText size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>Nenhum documento encontrado.</p>
        </div>
      ) : filtrados.map((doc) => {
        const tipoCfg = TIPO_CFG[doc.tipo]  || TIPO_CFG['Relatório'];
        const estCfg  = EST_CFG[doc.estado] || EST_CFG['Ativo'];
        return (
          <div key={doc.id} className="dash-card incidente-card">
            <div className="d-flex align-items-start gap-3">
              <div style={{ background: tipoCfg.bg, borderRadius: 10, padding: '0.6rem', flexShrink: 0 }}>
                <FileText size={18} color={tipoCfg.cor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <p className="incidente-nome">{doc.titulo}</p>
                  <span className="badge-pill" style={{ background: estCfg.bg, color: estCfg.cor }}>{doc.estado}</span>
                  <span className="badge-pill" style={{ background: tipoCfg.bg, color: tipoCfg.cor }}>{doc.tipo}</span>
                </div>
                {doc.descricao && (
                  <p className="incidente-descricao">{doc.descricao}</p>
                )}
                <div className="d-flex flex-wrap gap-3">
                  {doc.versao          && <span className="incidente-data">Versão: {doc.versao}</span>}
                  {doc.cliente?.nome   && <span className="incidente-data">Cliente: {doc.cliente.nome}</span>}
                  {doc.criador?.nome   && <span className="incidente-data">Criado por: {doc.criador.nome}</span>}
                  {doc.created_at      && <span className="incidente-data">{new Date(doc.created_at).toLocaleDateString('pt-PT')}</span>}
                  {doc.tamanho         && <span className="incidente-data">{doc.tamanho}</span>}
                </div>
              </div>
              <div className="d-flex gap-2 flex-shrink-0">
                {doc.ficheiro && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${doc.ficheiro}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-descarregar"
                    title="Descarregar"
                  >
                    <Download size={13} /> Descarregar
                  </a>
                )}
                <button className="btn-editar" onClick={() => setModal(doc)}>Editar</button>
                <button
                  onClick={() => setAEliminar(doc)}
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

      {modal !== undefined && (
        <ModalDocumento
          documento={modal}
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

export default AdminDocumentos;

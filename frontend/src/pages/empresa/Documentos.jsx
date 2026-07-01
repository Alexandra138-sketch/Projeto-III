// ─────────────────────────────────────────────────────────────
//  Página: empresa/Documentos.jsx
//
//  Lista todos os documentos disponíveis para a empresa.
//  A empresa pode:
//    - Ver e descarregar documentos partilhados pelo gestor
//    - Submeter documentação interna, pen tests e outras evidências
//      (ficam com estado "Em Revisão" até o gestor validar)
//
//  Funcionalidades:
//    - Pesquisa por título
//    - Filtro por tipo de documento
//    - Botão de download para cada documento
//    - Modal para submeter novos documentos com upload de ficheiro
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { Download, FileText, Upload } from 'lucide-react';

// URL base do backend para construir links de download
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tipos disponíveis para submissão pela empresa
const TIPOS_SUBMISSAO = [
  'Documentação Interna',
  'Pentest',
  'Auditoria',
  'Política',
  'Relatório',
  'Outras Evidências',
];

// Cores por tipo de documento
const TIPO_CFG = {
  'Política':             { bg: '#ede9fe', cor: '#7c3aed' },
  'Pentest':              { bg: '#dcfce7', cor: '#16a34a' },
  'Auditoria':            { bg: '#fef9c3', cor: '#ca8a04' },
  'Contrato':             { bg: '#fce7f3', cor: '#db2777' },
  'Relatório':            { bg: '#dbeafe', cor: '#2563eb' },
  'Documentação Interna': { bg: '#e0f2fe', cor: '#0284c7' },
  'Outras Evidências':    { bg: '#f1f5f9', cor: '#475569' },
};
const TIPO_PADRAO = { bg: '#f1f5f9', cor: '#475569' };

// Cores por estado do documento
const ESTADO_CFG = {
  'Ativo':      { bg: '#dcfce7', cor: '#16a34a' },
  'Em Revisão': { bg: '#fef9c3', cor: '#ca8a04' },
  'Expirado':   { bg: '#fee2e2', cor: '#dc2626' },
};

// Estado inicial do formulário de submissão
const FORM_INICIAL = {
  titulo:    '',
  tipo:      'Documentação Interna',
  descricao: '',
  versao:    'v1.0',
  ficheiro:  null,
};

function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');
  const [pesquisa,   setPesquisa]   = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // ── Modal de submissão ──
  const [modalAberto, setModalAberto] = useState(false);
  const [form,        setForm]        = useState(FORM_INICIAL);
  const [enviando,    setEnviando]    = useState(false);
  const [erroModal,   setErroModal]   = useState('');
  const [sucesso,     setSucesso]     = useState('');
  const ficheiroRef = useRef(null);

  // ── Carregar documentos ──
  const carregarDocumentos = () => {
    setCarregando(true);
    api.get('/empresa/documentos')
      .then(({ data }) => setDocumentos(Array.isArray(data) ? data : []))
      .catch(() => setErro('Não foi possível carregar os documentos.'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarDocumentos();
  }, []);

  // ── Tipos únicos para o filtro ──
  const tiposUnicos = [...new Set(documentos.map(d => d.tipo).filter(Boolean))];

  // ── Filtrar localmente ──
  const listaFiltrada = documentos.filter(doc => {
    const matchPesquisa = doc.titulo?.toLowerCase().includes(pesquisa.toLowerCase());
    const matchTipo     = filtroTipo ? doc.tipo === filtroTipo : true;
    return matchPesquisa && matchTipo;
  });

  // ── Construir URL de download ──
  const urlDownload = (ficheiro) => {
    if (!ficheiro) return null;
    return `${API_BASE}/uploads/${ficheiro}`;
  };

  // ── Abrir modal ──
  const abrirModal = () => {
    setForm(FORM_INICIAL);
    setErroModal('');
    setModalAberto(true);
  };

  // ── Fechar modal ──
  const fecharModal = () => {
    setModalAberto(false);
    setErroModal('');
    if (ficheiroRef.current) ficheiroRef.current.value = '';
  };

  // ── Submeter documento via FormData (suporta ficheiro) ──
  const handleSubmeter = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setErroModal('O título é obrigatório.');
      return;
    }

    setEnviando(true);
    setErroModal('');

    try {
      // FormData para enviar campos + ficheiro num único pedido multipart
      const formData = new FormData();
      formData.append('titulo',    form.titulo);
      formData.append('tipo',      form.tipo);
      formData.append('descricao', form.descricao || '');
      formData.append('versao',    form.versao || 'v1.0');
      if (form.ficheiro) {
        formData.append('ficheiro', form.ficheiro);
      }

      await api.post('/empresa/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Sucesso: fechar modal, recarregar lista e mostrar mensagem
      fecharModal();
      setSucesso('Documento submetido com sucesso! Aguarda validação do gestor de segurança.');
      carregarDocumentos();
      // Esconder a mensagem de sucesso após 5 segundos
      setTimeout(() => setSucesso(''), 5000);
    } catch (err) {
      setErroModal(err.response?.data?.erro || 'Erro ao submeter documento. Tenta novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AdminLayout>

      {/* ── Cabeçalho ── */}
      <div className="dash-banner">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <h4>Os Meus Documentos</h4>
            <p>
              Acede e descarrega os documentos partilhados pelo gestor,
              ou submete documentação interna, pen tests e outras evidências.
            </p>
          </div>
          {/* Botão para abrir o modal de submissão */}
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={abrirModal}
          >
            <Upload size={16} />
            Submeter Documento
          </button>
        </div>

        {/* KPIs */}
        <div className="row g-3 mt-1">
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : documentos.length}</div>
              <div className="stat-label">Total Documentos</div>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">
                {carregando ? '…' : documentos.filter(d => d.estado === 'Em Revisão').length}
              </div>
              <div className="stat-label">Em Revisão</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mensagem de sucesso após submissão ── */}
      {sucesso && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          {sucesso}
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="dash-card mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por título…"
              value={pesquisa}
              onChange={e => setPesquisa(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Erro de carregamento ── */}
      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* ── Lista de documentos em cards ── */}
      {carregando ? (
        <div className="dash-card">
          <p style={{ color: '#94a3b8' }}>A carregar documentos…</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="dash-card">
          <p style={{ color: '#94a3b8' }}>
            {documentos.length === 0
              ? 'Ainda não tens documentos disponíveis. Podes submeter um usando o botão acima.'
              : 'Nenhum resultado para os filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {listaFiltrada.map(doc => {
            const tipoCfg   = TIPO_CFG[doc.tipo] || TIPO_PADRAO;
            const estadoCfg = ESTADO_CFG[doc.estado] || TIPO_PADRAO;
            return (
              <div className="col-12 col-md-6 col-lg-4" key={doc.id}>
                <div className="dash-card h-100 d-flex flex-column">

                  {/* Tipo e estado */}
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <FileText size={20} style={{ color: tipoCfg.cor }} />
                    <span className="badge-pill" style={{ background: tipoCfg.bg, color: tipoCfg.cor }}>
                      {doc.tipo || 'Outro'}
                    </span>
                    {/* Mostrar estado só quando não for 'Ativo' (ex: "Em Revisão") */}
                    {doc.estado && doc.estado !== 'Ativo' && (
                      <span className="badge-pill" style={{ background: estadoCfg.bg, color: estadoCfg.cor }}>
                        {doc.estado}
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <h6 className="mb-1">{doc.titulo}</h6>

                  {/* Descrição */}
                  {doc.descricao && (
                    <p className="mb-2" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {doc.descricao}
                    </p>
                  )}

                  {/* Metadados */}
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 'auto' }}>
                    <span>Tamanho: {doc.tamanho || '—'}</span>
                    <span className="mx-2">·</span>
                    <span>
                      {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString('pt-PT')
                        : doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString('pt-PT')
                          : '—'}
                    </span>
                  </div>

                  {/* Adicionado por */}
                  {doc.criador && (
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Adicionado por: {doc.criador.nome}
                    </div>
                  )}

                  {/* Botão de download */}
                  {doc.ficheiro ? (
                    <a
                      href={urlDownload(doc.ficheiro)}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="btn-descarregar mt-3"
                      style={{ justifyContent: 'center' }}
                    >
                      <Download size={14} /> Descarregar
                    </a>
                  ) : (
                    <button
                      className="btn-descarregar mt-3"
                      style={{ justifyContent: 'center' }}
                      disabled
                    >
                      Sem ficheiro
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Submeter Documento ── */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) fecharModal(); }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              {/* Cabeçalho */}
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <Upload size={18} />
                  Submeter Documento
                </h5>
                <button className="btn-close" onClick={fecharModal} />
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmeter}>
                <div className="modal-body">

                  {/* Aviso informativo */}
                  <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
                    Os documentos submetidos ficam com estado <strong>Em Revisão</strong> até
                    o gestor de segurança os validar.
                  </div>

                  {/* Erro de submissão */}
                  {erroModal && (
                    <div className="alert alert-danger">{erroModal}</div>
                  )}

                  {/* Título */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Título <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Relatório de Pen Test — Janeiro 2026"
                      value={form.titulo}
                      onChange={e => setForm({ ...form, titulo: e.target.value })}
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tipo de Documento</label>
                    <select
                      className="form-select"
                      value={form.tipo}
                      onChange={e => setForm({ ...form, tipo: e.target.value })}
                    >
                      {TIPOS_SUBMISSAO.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Versão e Descrição */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Versão</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="v1.0"
                        value={form.versao}
                        onChange={e => setForm({ ...form, versao: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold">Descrição (opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Breve descrição do conteúdo…"
                        value={form.descricao}
                        onChange={e => setForm({ ...form, descricao: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Upload de ficheiro */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Ficheiro (opcional)</label>
                    <input
                      ref={ficheiroRef}
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.png,.jpg,.jpeg"
                      onChange={e => setForm({ ...form, ficheiro: e.target.files[0] || null })}
                    />
                    <div className="form-text">
                      Formatos aceites: PDF, Word, Excel, imagens, ZIP. Máx. recomendado: 10 MB.
                    </div>
                  </div>

                </div>

                {/* Rodapé */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={fecharModal}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={enviando}
                  >
                    {enviando ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        A enviar…
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        Submeter
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default Documentos;

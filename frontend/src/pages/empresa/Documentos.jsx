// ─────────────────────────────────────────────────────────────
//  Página: empresa/Documentos.jsx
//
//  Lista todos os documentos disponíveis para a empresa (read-only).
//  A empresa pode ver e descarregar os seus documentos,
//  mas não pode criar, editar nem apagar.
//
//  Funcionalidades:
//    - Pesquisa por título
//    - Filtro por tipo de documento
//    - Botão de download para cada documento
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import { Download, FileText } from 'lucide-react';

// URL base do backend para construir links de download
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cores por tipo de documento
const TIPO_CFG = {
  Política:  { bg: '#ede9fe', cor: '#7c3aed' },
  Pentest:   { bg: '#dcfce7', cor: '#16a34a' },
  Auditoria: { bg: '#fef9c3', cor: '#ca8a04' },
  Contrato:  { bg: '#fce7f3', cor: '#db2777' },
  Relatório: { bg: '#dbeafe', cor: '#2563eb' },
};
const TIPO_PADRAO = { bg: '#f1f5f9', cor: '#475569' };

function Documentos() {
  const [documentos,   setDocumentos]   = useState([]);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState('');
  const [pesquisa,     setPesquisa]     = useState('');
  const [filtroTipo,   setFiltroTipo]   = useState('');

  // ── Carregar documentos ──
  useEffect(() => {
    setCarregando(true);
    api.get('/empresa/documentos')
      .then(({ data }) => setDocumentos(Array.isArray(data) ? data : []))
      .catch(() => setErro('Não foi possível carregar os documentos.'))
      .finally(() => setCarregando(false));
  }, []);

  // ── Lista de tipos únicos para o filtro ──
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

  return (
    <AdminLayout>

      {/* ── Cabeçalho ── */}
      <div className="dash-banner">
        <h4>Os Meus Documentos</h4>
        <p>Acede e descarrega os documentos partilhados pelo teu gestor de segurança.</p>
        <div className="row g-3">
          <div className="col-6 col-md-4">
            <div className="stat-card">
              <div className="stat-number">{carregando ? '…' : documentos.length}</div>
              <div className="stat-label">Total Documentos</div>
            </div>
          </div>
        </div>
      </div>

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

      {/* ── Erro ── */}
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
              ? 'Ainda não tens documentos disponíveis.'
              : 'Nenhum resultado para os filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {listaFiltrada.map(doc => {
            const tipoCfg = TIPO_CFG[doc.tipo] || TIPO_PADRAO;
            return (
            <div className="col-12 col-md-6 col-lg-4" key={doc.id}>
              <div className="dash-card h-100 d-flex flex-column">

                {/* Ícone e tipo */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FileText size={20} style={{ color: tipoCfg.cor }} />
                  <span className="badge-pill" style={{ background: tipoCfg.bg, color: tipoCfg.cor }}>
                    {doc.tipo || 'Outro'}
                  </span>
                </div>

                {/* Título */}
                <h6 className="mb-1">{doc.titulo}</h6>

                {/* Descrição (se existir) */}
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
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString('pt-PT')
                      : '—'}
                  </span>
                </div>

                {/* Criado por */}
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
                  <button className="btn-descarregar mt-3" style={{ justifyContent: 'center' }} disabled>
                    Sem ficheiro
                  </button>
                )}

              </div>
            </div>
          );})}
        </div>
      )}

    </AdminLayout>
  );
}

export default Documentos;

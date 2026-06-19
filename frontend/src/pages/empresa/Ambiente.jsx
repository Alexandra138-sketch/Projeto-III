// ─────────────────────────────────────────────────────────────
//  Página: empresa/Ambiente.jsx
//
//  Visão geral do "ambiente de segurança" da empresa.
//  Dividida em secções via separadores (tabs):
//    1. Resumo         — estado geral, gestor, métricas
//    2. Documentos     — todos os documentos da empresa
//    3. Pentests       — documentos do tipo Pentest
//    4. Incidentes     — lista de incidentes
//    5. Comunicação    — chat com o gestor responsável
//
//  Todos os dados vêm das rotas /empresa/* do backend.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// URL base do backend para construir links de download
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Cores para badges ──────────────────────────────────────────
const BADGE_SEVERIDADE = {
  Crítico: 'badge bg-danger',
  Alto:    'badge bg-warning text-dark',
  Médio:   'badge bg-primary',
  Baixo:   'badge bg-success',
};

const BADGE_ESTADO_INC = {
  Aberto:          'badge bg-danger',
  'A Investigar':  'badge bg-warning text-dark',
  Resolvido:       'badge bg-success',
  Fechado:         'badge bg-secondary',
};

// ── Separadores disponíveis ────────────────────────────────────
const TABS = [
  { id: 'resumo',       label: '🛡 Resumo'      },
  { id: 'documentos',   label: '📄 Documentos'  },
  { id: 'pentests',     label: '🔍 Pentests'    },
  { id: 'incidentes',   label: '⚠ Incidentes'  },
  { id: 'comunicacao',  label: '💬 Comunicação' },
];

function Ambiente() {
  const { utilizador } = useAuth();
  const [tabAtiva, setTabAtiva] = useState('resumo');

  // Dados
  const [perfil,     setPerfil]     = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [semConta,   setSemConta]   = useState(false);

  // Chat
  const [mensagens,      setMensagens]      = useState([]);
  const [novaMensagem,   setNovaMensagem]   = useState('');
  const [enviando,       setEnviando]       = useState(false);
  const chatRef = useRef(null);

  // ── Carregar dados ──
  useEffect(() => {
    setCarregando(true);
    Promise.allSettled([
      api.get('/empresa/perfil'),
      api.get('/empresa/incidentes'),
      api.get('/empresa/documentos'),
    ]).then(([perfilRes, incRes, docRes]) => {
      const perfilData = perfilRes.status === 'fulfilled' ? perfilRes.value.data : null;

      // Se perfil for null, a conta ainda não está ligada a nenhum cliente
      if (!perfilData) {
        setSemConta(true);
      } else {
        setPerfil(perfilData);
      }

      if (incRes.status === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
      if (docRes.status === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data) ? docRes.value.data : []);
    }).finally(() => setCarregando(false));
  }, []);

  // ── Carregar mensagens do chat quando se muda para a tab Comunicação ──
  useEffect(() => {
    if (tabAtiva !== 'comunicacao' || !perfil?.id) return;

    api.get(`/chat/${perfil.id}`)
      .then(({ data }) => {
        // getMensagens devolve em ordem DESC — inverter para ASC
        const ordenadas = Array.isArray(data) ? [...data].reverse() : [];
        setMensagens(ordenadas);
        // Scroll para o fim
        setTimeout(() => {
          if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }, 50);
      })
      .catch(() => {});
  }, [tabAtiva, perfil]);

  // ── Enviar mensagem no chat ──
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !perfil?.id) return;

    setEnviando(true);
    try {
      const { data } = await api.post(`/chat/${perfil.id}`, { conteudo: novaMensagem.trim() });
      // Adicionar mensagem localmente
      setMensagens(prev => [...prev, {
        ...data,
        remetente: { nome: utilizador?.nome, perfil: 'empresa' },
        isMe: true,
      }]);
      setNovaMensagem('');
      // Scroll para o fim
      setTimeout(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 50);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  // Pentests = documentos com tipo 'Pentest'
  const pentests  = documentos.filter(d => d.tipo === 'Pentest');
  const incAbertos = incidentes.filter(i => i.estado === 'Aberto' || i.estado === 'A Investigar').length;

  // ── Aviso: conta não ligada ──
  if (!carregando && semConta) {
    return (
      <AdminLayout>
        <div className="dash-banner">
          <h4>Ambiente de Segurança</h4>
          <p>Visão geral da postura de segurança da tua empresa.</p>
        </div>
        <div className="dash-card text-center" style={{ padding: '3rem' }}>
          🛡
          <h5 style={{ color: '#374151' }}>Conta ainda não configurada</h5>
          <p style={{ color: '#64748b' }}>
            A tua conta de utilizador ainda não está ligada a nenhum cliente no sistema.<br />
            Contacta o teu gestor para que ele possa configurar o acesso.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      {/* ── Cabeçalho ── */}
      <div className="dash-banner">
        <h4>Ambiente de Segurança</h4>
        <p>
          {perfil ? `${perfil.nome} · Gestor: ${perfil.gestor?.nome || '—'}` : 'A carregar…'}
        </p>
        {!carregando && (
          <div className="row g-3 mt-1">
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-number">{incidentes.length}</div>
                <div className="stat-label">Incidentes</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-number">{incAbertos}</div>
                <div className="stat-label">Em Aberto</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-number">{documentos.length}</div>
                <div className="stat-label">Documentos</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-card">
                <div className="stat-number">{pentests.length}</div>
                <div className="stat-label">Pentests</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Separadores (Tabs) ── */}
      <div className="dash-card p-0 mb-4" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTabAtiva(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.85rem 1.25rem',
                border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: '0.875rem', fontWeight: 600,
                color: tabAtiva === id ? '#2563eb' : '#64748b',
                borderBottom: tabAtiva === id ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conteúdo da tab ── */}

      {/* TAB: Resumo */}
      {tabAtiva === 'resumo' && (
        <div className="dash-card">
          {carregando ? (
            <p style={{ color: '#94a3b8' }}>A carregar…</p>
          ) : (
            <>
              <h5 className="mb-3">Informação da Empresa</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Nome</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{perfil?.nome || '—'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Email</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{perfil?.email || '—'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Telefone</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{perfil?.telefone || '—'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Estado do contrato</p>
                    <p style={{ margin: 0 }}>
                      <span className={perfil?.estado === 'Ativo' ? 'badge bg-success' : 'badge bg-secondary'}>
                        {perfil?.estado || '—'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <h5 className="mb-3">Gestor Responsável</h5>
              {perfil?.gestor ? (
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '1rem', borderLeft: '4px solid #2563eb' }}>
                  <p style={{ fontWeight: 700, margin: 0, color: '#1e40af' }}>{perfil.gestor.nome}</p>
                  <p style={{ fontSize: '0.85rem', color: '#3b82f6', margin: 0 }}>{perfil.gestor.email}</p>
                </div>
              ) : (
                <p style={{ color: '#94a3b8' }}>Nenhum gestor atribuído ainda.</p>
              )}

              {/* Estado dos incidentes */}
              {incidentes.length > 0 && (
                <>
                  <h5 className="mb-3 mt-4">Estado de Segurança</h5>
                  <div style={{
                    background: incAbertos > 0 ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${incAbertos > 0 ? '#fecaca' : '#bbf7d0'}`,
                    borderRadius: 10, padding: '1rem',
                  }}>
                    {incAbertos > 0 ? (
                      <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>
                        ⚠️ Existem {incAbertos} incidente{incAbertos > 1 ? 's' : ''} em aberto que requer{incAbertos > 1 ? 'em' : ''} atenção.
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: '#16a34a', fontWeight: 600 }}>
                        ✅ Todos os incidentes estão resolvidos ou fechados.
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: Documentos */}
      {tabAtiva === 'documentos' && (
        <div>
          {carregando ? (
            <div className="dash-card"><p style={{ color: '#94a3b8' }}>A carregar…</p></div>
          ) : documentos.length === 0 ? (
            <div className="dash-card"><p style={{ color: '#94a3b8' }}>Sem documentos disponíveis.</p></div>
          ) : (
            <div className="row g-3">
              {documentos.map(doc => (
                <div className="col-12 col-md-6" key={doc.id}>
                  <div className="dash-card h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      📄
                      <span className="badge bg-info text-dark">{doc.tipo || 'Outro'}</span>
                    </div>
                    <h6 className="mb-1">{doc.titulo}</h6>
                    {doc.descricao && <p style={{ fontSize: '0.83rem', color: '#64748b' }}>{doc.descricao}</p>}
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      {doc.tamanho || '—'} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-PT') : '—'}
                    </div>
                    {doc.ficheiro ? (
                      <a
                        href={`${API_BASE}/uploads/${doc.ficheiro}`}
                        download target="_blank" rel="noreferrer"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 justify-content-center"
                      >
                        ⬇ Descarregar
                      </a>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" disabled>Sem ficheiro</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Pentests */}
      {tabAtiva === 'pentests' && (
        <div>
          <div className="dash-card mb-3" style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>
              <strong>O que é um Pentest?</strong> Um teste de penetração (pentest) simula um ataque real ao sistema para identificar vulnerabilidades antes que sejam exploradas por atacantes.
            </p>
          </div>

          {carregando ? (
            <div className="dash-card"><p style={{ color: '#94a3b8' }}>A carregar…</p></div>
          ) : pentests.length === 0 ? (
            <div className="dash-card"><p style={{ color: '#94a3b8' }}>Ainda não existem relatórios de Pentest disponíveis.</p></div>
          ) : (
            <div className="row g-3">
              {pentests.map(doc => (
                <div className="col-12 col-md-6" key={doc.id}>
                  <div className="dash-card h-100" style={{ borderLeft: '3px solid #22c55e' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      🔍
                      <span className="badge bg-success">Pentest</span>
                    </div>
                    <h6 className="mb-1">{doc.titulo}</h6>
                    {doc.descricao && <p style={{ fontSize: '0.83rem', color: '#64748b' }}>{doc.descricao}</p>}
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      {doc.tamanho || '—'} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-PT') : '—'}
                    </div>
                    {doc.ficheiro ? (
                      <a
                        href={`${API_BASE}/uploads/${doc.ficheiro}`}
                        download target="_blank" rel="noreferrer"
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 justify-content-center"
                      >
                        ⬇ Descarregar relatório
                      </a>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" disabled>Sem ficheiro</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Incidentes */}
      {tabAtiva === 'incidentes' && (
        <div className="dash-card">
          {carregando ? (
            <p style={{ color: '#94a3b8' }}>A carregar…</p>
          ) : incidentes.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Sem incidentes registados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Severidade</th>
                    <th>Estado</th>
                    <th>Responsável</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentes.map(inc => (
                    <tr key={inc.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inc.titulo}</div>
                        {inc.descricao && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {inc.descricao.length > 80 ? inc.descricao.slice(0, 80) + '…' : inc.descricao}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={BADGE_SEVERIDADE[inc.severidade] || 'badge bg-secondary'}>
                          {inc.severidade}
                        </span>
                      </td>
                      <td>
                        <span className={BADGE_ESTADO_INC[inc.estado] || 'badge bg-secondary'}>
                          {inc.estado}
                        </span>
                      </td>
                      <td>{inc.responsavel?.nome || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Comunicação */}
      {tabAtiva === 'comunicacao' && (
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', height: 520 }}>
          <h5 className="mb-3">Chat com o Gestor</h5>

          {!perfil ? (
            <p style={{ color: '#94a3b8' }}>Sem perfil de empresa ligado — não é possível aceder ao chat.</p>
          ) : (
            <>
              {/* Área de mensagens */}
              <div
                ref={chatRef}
                style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}
              >
                {mensagens.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>
                    Ainda não existem mensagens. Envia a primeira!
                  </p>
                ) : (
                  mensagens.map((msg, i) => {
                    // A empresa vê as suas próprias mensagens à direita
                    const souEu = msg.remetente?.perfil === 'empresa' || msg.isMe;
                    return (
                      <div
                        key={msg.id || i}
                        style={{
                          display: 'flex',
                          justifyContent: souEu ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          background: souEu ? '#2563eb' : '#f1f5f9',
                          color: souEu ? '#fff' : '#1e293b',
                          borderRadius: souEu ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          padding: '0.6rem 0.9rem',
                          fontSize: '0.875rem',
                        }}>
                          {!souEu && (
                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 2 }}>
                              {msg.remetente?.nome || 'Gestor'}
                            </p>
                          )}
                          <p style={{ margin: 0 }}>{msg.conteudo}</p>
                          <p style={{ margin: 0, fontSize: '0.68rem', opacity: 0.65, marginTop: 3, textAlign: 'right' }}>
                            {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Caixa de texto */}
              <form onSubmit={handleEnviar} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-control"
                  placeholder="Escreve uma mensagem…"
                  value={novaMensagem}
                  onChange={e => setNovaMensagem(e.target.value)}
                  disabled={enviando}
                />
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-1"
                  disabled={!novaMensagem.trim() || enviando}
                >
                  ✉
                  {enviando ? '…' : 'Enviar'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

    </AdminLayout>
  );
}

export default Ambiente;

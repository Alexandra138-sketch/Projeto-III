// ─────────────────────────────────────────────────────────────
//  Página: empresa/Ambiente.jsx
//
//  Visão geral do "ambiente de segurança" da empresa.
//  Design consistente com o gestor/ClientePerfil.jsx:
//    - Cartão de perfil com avatar, KPIs e contactos
//    - Tabs com abas-wrapper / aba-btn / aba-count
//    - Chat com cp-chat-* classes
//
//  Separadores (tabs):
//    1. Resumo       — estatísticas + docs/incidentes recentes
//    2. Documentos   — todos os documentos da empresa
//    3. Pentests     — documentos do tipo Pentest
//    4. Incidentes   — lista de incidentes
//    5. Comunicação  — chat com o gestor responsável
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Shield, FileText, AlertTriangle,
  MessageSquare, Download, Send, Mail, Phone, Calendar, User,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Cores de badge por severidade e estado ────────────────────
const SEV = {
  'Crítico': { dot: '#ef4444', bg: '#fee2e2', cor: '#dc2626' },
  'Alto':    { dot: '#f97316', bg: '#ffedd5', cor: '#c2410c' },
  'Médio':   { dot: '#f59e0b', bg: '#fef9c3', cor: '#ca8a04' },
  'Baixo':   { dot: '#22c55e', bg: '#dcfce7', cor: '#16a34a' },
};

const STA = {
  'Aberto':       { bg: '#dbeafe', cor: '#2563eb' },
  'A Investigar': { bg: '#fef9c3', cor: '#ca8a04' },
  'Resolvido':    { bg: '#dcfce7', cor: '#16a34a' },
  'Fechado':      { bg: '#f1f5f9', cor: '#64748b' },
};

// ── Iniciais do nome da empresa (ex: "Tech Corp" → "TC") ──────
function iniciais(nome) {
  if (!nome) return 'EM';
  return nome.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function Ambiente() {
  const { utilizador } = useAuth();
  const [tabAtiva, setTabAtiva] = useState('resumo');

  // Dados
  const [perfil,     setPerfil]     = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [mensagens,  setMensagens]  = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [semConta,   setSemConta]   = useState(false);

  // Chat
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando,     setEnviando]     = useState(false);
  const mensagensEndRef = useRef(null);

  // ── Carregar todos os dados ao arranque ──────────────────────
  useEffect(() => {
    setCarregando(true);
    Promise.allSettled([
      api.get('/empresa/perfil'),
      api.get('/empresa/incidentes'),
      api.get('/empresa/documentos'),
    ]).then(([perfilRes, incRes, docRes]) => {
      const perfilData = perfilRes.status === 'fulfilled' ? perfilRes.value.data : null;
      if (!perfilData) {
        setSemConta(true);
      } else {
        setPerfil(perfilData);
        // Carregar mensagens assim que temos o perfil (para o contador da tab)
        api.get(`/chat/${perfilData.id}`)
          .then(({ data }) => {
            const ordenadas = Array.isArray(data) ? [...data].reverse() : [];
            setMensagens(ordenadas);
          })
          .catch(() => {});
      }
      if (incRes.status === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
      if (docRes.status === 'fulfilled') setDocumentos(Array.isArray(docRes.value.data) ? docRes.value.data : []);
    }).finally(() => setCarregando(false));
  }, []);

  // ── Scroll automático do chat para o fim ─────────────────────
  useEffect(() => {
    if (tabAtiva === 'comunicacao') {
      setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [tabAtiva, mensagens]);

  // ── Enviar mensagem ───────────────────────────────────────────
  const handleEnviar = async () => {
    if (!novaMensagem.trim() || !perfil?.id) return;
    const conteudo = novaMensagem.trim();
    setNovaMensagem('');
    setEnviando(true);

    // Mensagem temporária para feedback imediato
    const tmpId = `tmp_${Date.now()}`;
    setMensagens(prev => [...prev, {
      id: tmpId,
      conteudo,
      remetente_id: utilizador?.id,
      criado_em: new Date().toISOString(),
      remetente: { nome: utilizador?.nome, perfil: 'empresa' },
      _temp: true,
    }]);
    setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      await api.post(`/chat/${perfil.id}`, { conteudo });
      setMensagens(prev => prev.filter(m => m.id !== tmpId));
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  // Derivados
  const pentests   = documentos.filter(d => d.tipo === 'Pentest');
  const incAbertos = incidentes.filter(i => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const dataCliente = perfil?.created_at || perfil?.createdAt;

  // ── Tabs com contadores ───────────────────────────────────────
  const TABS = [
    { id: 'resumo',      label: 'Resumo',      Icone: Shield,        count: null             },
    { id: 'documentos',  label: 'Documentos',  Icone: FileText,      count: documentos.length },
    { id: 'pentests',    label: 'Pentests',    Icone: Shield,        count: pentests.length  },
    { id: 'incidentes',  label: 'Incidentes',  Icone: AlertTriangle, count: incidentes.length },
    { id: 'comunicacao', label: 'Comunicação', Icone: MessageSquare, count: mensagens.length },
  ];

  // ── Conta não configurada ─────────────────────────────────────
  if (!carregando && semConta) {
    return (
      <AdminLayout>
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Shield size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <h5 style={{ color: '#374151' }}>Conta ainda não configurada</h5>
          <p style={{ color: '#64748b' }}>
            A tua conta ainda não está ligada a nenhum cliente.<br />Contacta o teu gestor.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      {/* ════════════════════════════════════════════════════════
          CARTÃO DE PERFIL — igual ao design gestor/ClientePerfil
      ════════════════════════════════════════════════════════ */}
      <div className="dash-card perfil-card">
        {carregando ? (
          <p style={{ color: '#94a3b8', margin: 0 }}>A carregar…</p>
        ) : (
          <div className="d-flex align-items-start gap-3 flex-wrap">

            {/* Avatar de iniciais */}
            <div className="perfil-avatar" style={{ backgroundColor: '#2563eb' }}>
              {iniciais(perfil?.nome)}
            </div>

            {/* Info + KPIs */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Nome + badge estado */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <h4 className="perfil-nome">{perfil?.nome || '—'}</h4>
                <span className="badge-pill" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  ✓ Conta ativa
                </span>
              </div>

              {/* Email · Telefone · Cliente desde */}
              <div className="d-flex flex-wrap gap-3 mb-3">
                {perfil?.email && (
                  <span className="perfil-meta"><Mail size={12} /> {perfil.email}</span>
                )}
                {perfil?.telefone && (
                  <span className="perfil-meta"><Phone size={12} /> {perfil.telefone}</span>
                )}
                {dataCliente && (
                  <span className="perfil-meta">
                    <Calendar size={12} /> Cliente desde {new Date(dataCliente).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>

              {/* KPIs rápidos */}
              <div className="d-flex gap-3 flex-wrap">
                <div className="perfil-kpi perfil-kpi-azul">
                  <p className="kpi-valor kpi-valor-azul">{documentos.length}</p>
                  <p className="kpi-label">Documentos</p>
                </div>
                <div className="perfil-kpi perfil-kpi-laranja">
                  <p className="kpi-valor kpi-valor-laranja">{incidentes.length}</p>
                  <p className="kpi-label">Incidentes</p>
                </div>
                <div className="perfil-kpi perfil-kpi-verde">
                  <p className="kpi-valor kpi-valor-verde">{mensagens.length}</p>
                  <p className="kpi-label">Mensagens</p>
                </div>
              </div>
            </div>

            {/* Contactos (Resp. Segurança + Contacto Permanente) */}
            {(perfil?.resp_seguranca_nome || perfil?.contacto_perm_nome) && (
              <div className="d-flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
                {perfil?.resp_seguranca_nome && (
                  <div className="contacto-box contacto-box-seguranca">
                    <div className="contacto-icon contacto-icon-seguranca">
                      <User size={13} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <p className="contacto-titulo">Resp. Segurança</p>
                      <p className="contacto-nome">{perfil.resp_seguranca_nome}</p>
                      {perfil.resp_seguranca_email && (
                        <p className="contacto-detalhe">{perfil.resp_seguranca_email}</p>
                      )}
                      {perfil.resp_seguranca_telefone && (
                        <p className="contacto-detalhe">{perfil.resp_seguranca_telefone}</p>
                      )}
                    </div>
                  </div>
                )}
                {perfil?.contacto_perm_nome && (
                  <div className="contacto-box contacto-box-permanente">
                    <div className="contacto-icon contacto-icon-permanente">
                      <User size={13} style={{ color: '#16a34a' }} />
                    </div>
                    <div>
                      <p className="contacto-titulo">Contacto Permanente</p>
                      <p className="contacto-nome">{perfil.contacto_perm_nome}</p>
                      {perfil.contacto_perm_email && (
                        <p className="contacto-detalhe">{perfil.contacto_perm_email}</p>
                      )}
                      {perfil.contacto_perm_telefone && (
                        <p className="contacto-detalhe">{perfil.contacto_perm_telefone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          TABS — mesmo padrão que gestor/ClientePerfil.jsx
      ════════════════════════════════════════════════════════ */}
      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="abas-wrapper">
          {TABS.map(({ id, label, Icone, count }) => (
            <button
              key={id}
              className={`aba-btn ${tabAtiva === id ? 'ativa' : ''}`}
              onClick={() => setTabAtiva(id)}
            >
              <Icone size={15} /> {label}
              {count !== null && !carregando && (
                <span className={`aba-count ${tabAtiva === id ? 'ativa' : 'inativa'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="aba-content">

          {/* ════════════ TAB: Resumo ════════════ */}
          {tabAtiva === 'resumo' && (
            carregando ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>A carregar…</p>
            ) : (
              <>
                {/* 3 cards coloridos com ícone — igual ao gestor */}
                <div className="row g-3 mb-4">
                  {[
                    { label: 'Documentos',  val: documentos.length,  bg: '#eff6ff', cor: '#2563eb', Icone: FileText       },
                    { label: 'Incidentes',  val: incidentes.length,  bg: '#fff7ed', cor: '#c2410c', Icone: AlertTriangle  },
                    { label: 'Mensagens',   val: mensagens.length,   bg: '#f0fdf4', cor: '#16a34a', Icone: MessageSquare  },
                  ].map(({ label, val, bg, cor: c, Icone: Ico }) => (
                    <div className="col-12 col-md-4" key={label}>
                      <div style={{ background: bg, borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
                        <Ico size={22} color={c} style={{ marginBottom: 8 }} />
                        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: c, margin: 0 }}>{val}</p>
                        <p style={{ fontSize: '0.8rem', color: c, margin: 0, fontWeight: 500 }}>{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documentos recentes + Incidentes recentes lado a lado */}
                <div className="row g-3">

                  <div className="col-12 col-md-6">
                    <h6 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                      Documentos recentes
                    </h6>
                    {documentos.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sem documentos.</p>
                    ) : documentos.slice(0, 4).map(doc => (
                      <div key={doc.id} className="resumo-recente-item">
                        <div className="perfil-item-icon" style={{ background: '#dbeafe' }}>
                          <FileText size={15} style={{ color: '#2563eb' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="perfil-item-titulo">{doc.titulo}</p>
                          <p className="perfil-item-meta">
                            {doc.tipo}
                            {doc.created_at && ` · ${new Date(doc.created_at).toLocaleDateString('pt-PT')}`}
                          </p>
                        </div>
                        <span className="badge-pill" style={{ background: '#dcfce7', color: '#16a34a' }}>Ativo</span>
                      </div>
                    ))}
                  </div>

                  <div className="col-12 col-md-6">
                    <h6 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                      Incidentes recentes
                    </h6>
                    {incidentes.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sem incidentes.</p>
                    ) : incidentes.slice(0, 4).map(inc => {
                      const sev = SEV[inc.severidade] || SEV['Médio'];
                      const sta = STA[inc.estado]     || STA['Aberto'];
                      return (
                        <div key={inc.id} className="resumo-recente-item">
                          <div style={{ width: 9, height: 9, borderRadius: '50%', background: sev.dot, flexShrink: 0, marginTop: 2 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="perfil-item-titulo">{inc.titulo}</p>
                            <p className="perfil-item-meta">
                              {inc.severidade}
                              {inc.created_at && ` · ${new Date(inc.created_at).toLocaleDateString('pt-PT')}`}
                            </p>
                          </div>
                          <span className="badge-pill" style={{ background: sta.bg, color: sta.cor }}>{inc.estado}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info empresa + gestor */}
                {dataCliente && (
                  <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                    Empresa registada desde {new Date(dataCliente).toLocaleDateString('pt-PT')}
                    {incAbertos > 0 && (
                      <> · <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ {incAbertos} incidente{incAbertos > 1 ? 's' : ''} em aberto</span></>
                    )}
                  </p>
                )}
              </>
            )
          )}

          {/* ════════════ TAB: Documentos ════════════ */}
          {tabAtiva === 'documentos' && (
            carregando ? (
              <p style={{ color: '#94a3b8', padding: '1rem 0' }}>A carregar…</p>
            ) : documentos.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '1rem 0' }}>Sem documentos disponíveis.</p>
            ) : documentos.map(doc => (
              <div key={doc.id} className="perfil-item">
                <div className="d-flex align-items-start gap-3">
                  <div className="perfil-item-icon" style={{ background: '#dbeafe' }}>
                    <FileText size={16} style={{ color: '#2563eb' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <p className="perfil-item-titulo">{doc.titulo}</p>
                      <span className="badge-pill" style={{ background: '#dbeafe', color: '#2563eb' }}>
                        {doc.tipo || 'Outro'}
                      </span>
                    </div>
                    {doc.descricao && (
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 4px' }}>{doc.descricao}</p>
                    )}
                    <div className="d-flex perfil-item-meta gap-3">
                      <span>{doc.tamanho || '—'}</span>
                      {doc.created_at && <span>{new Date(doc.created_at).toLocaleDateString('pt-PT')}</span>}
                    </div>
                  </div>
                  {doc.ficheiro ? (
                    <a
                      href={`${API_BASE}/uploads/${doc.ficheiro}`}
                      download target="_blank" rel="noreferrer"
                      className="btn-descarregar"
                    >
                      <Download size={13} /> Descarregar
                    </a>
                  ) : (
                    <button className="btn-descarregar" disabled>Sem ficheiro</button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* ════════════ TAB: Pentests ════════════ */}
          {tabAtiva === 'pentests' && (
            <>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>
                  <strong>O que é um Pentest?</strong> Um teste de penetração simula um ataque real para identificar vulnerabilidades antes que sejam exploradas.
                </p>
              </div>
              {carregando ? (
                <p style={{ color: '#94a3b8' }}>A carregar…</p>
              ) : pentests.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Ainda não existem relatórios de Pentest disponíveis.</p>
              ) : pentests.map(doc => (
                <div key={doc.id} className="perfil-item" style={{ borderLeft: '3px solid #22c55e' }}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="perfil-item-icon" style={{ background: '#dcfce7' }}>
                      <Shield size={16} style={{ color: '#16a34a' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <p className="perfil-item-titulo">{doc.titulo}</p>
                        <span className="badge-pill" style={{ background: '#dcfce7', color: '#16a34a' }}>Pentest</span>
                      </div>
                      {doc.descricao && (
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 4px' }}>{doc.descricao}</p>
                      )}
                      <div className="d-flex perfil-item-meta gap-3">
                        <span>{doc.tamanho || '—'}</span>
                        {doc.created_at && <span>{new Date(doc.created_at).toLocaleDateString('pt-PT')}</span>}
                      </div>
                    </div>
                    {doc.ficheiro ? (
                      <a
                        href={`${API_BASE}/uploads/${doc.ficheiro}`}
                        download target="_blank" rel="noreferrer"
                        className="btn-descarregar"
                        style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#16a34a' }}
                      >
                        <Download size={13} /> Descarregar
                      </a>
                    ) : (
                      <button className="btn-descarregar" disabled>Sem ficheiro</button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ════════════ TAB: Incidentes ════════════ */}
          {tabAtiva === 'incidentes' && (
            carregando ? (
              <p style={{ color: '#94a3b8', padding: '1rem 0' }}>A carregar…</p>
            ) : incidentes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sem incidentes registados.</p>
            ) : incidentes.map(inc => {
              const sev = SEV[inc.severidade] || SEV['Médio'];
              const sta = STA[inc.estado]     || STA['Aberto'];
              return (
                <div key={inc.id} className="perfil-item">
                  <div className="d-flex align-items-start gap-3">
                    <div className="incidente-dot" style={{ backgroundColor: sev.dot, marginTop: 5 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <p className="incidente-nome">{inc.titulo}</p>
                        <span className="badge-pill" style={{ background: sev.bg, color: sev.cor }}>{inc.severidade}</span>
                        <span className="badge-pill" style={{ background: sta.bg, color: sta.cor }}>{inc.estado}</span>
                      </div>
                      {inc.descricao && <p className="incidente-descricao">{inc.descricao}</p>}
                      <div className="d-flex flex-wrap gap-3">
                        {inc.responsavel?.nome && <span className="incidente-data">Responsável: {inc.responsavel.nome}</span>}
                        {inc.created_at && <span className="incidente-data">{new Date(inc.created_at).toLocaleDateString('pt-PT')}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* ════════════ TAB: Comunicação ════════════ */}
          {tabAtiva === 'comunicacao' && (
            !perfil ? (
              <p style={{ color: '#94a3b8' }}>Sem perfil ligado — não é possível aceder ao chat.</p>
            ) : (
              <div className="cp-chat-wrapper">
                <div className="cp-chat-mensagens" ref={el => {
                  // Auto scroll para o fim quando entra na tab
                  if (el) el.scrollTop = el.scrollHeight;
                }}>
                  {mensagens.length === 0 ? (
                    <div className="cp-chat-vazio">
                      <MessageSquare size={40} color="#e2e8f0" />
                      <p>Ainda não existem mensagens.</p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Inicia a conversa abaixo.</p>
                    </div>
                  ) : mensagens.map((msg, i) => {
                    const euEnviei = msg.remetente?.perfil === 'empresa' || msg.isMe || String(msg.remetente_id) === String(utilizador?.id);
                    const nomeRem  = msg.remetente?.nome || 'Gestor';
                    const inic     = nomeRem.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    const hora     = msg.criado_em
                      ? new Date(msg.criado_em).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <div key={msg.id || i} className={`cp-mensagem-row${euEnviei ? ' minha' : ''}`}>
                        {!euEnviei && <div className="cp-mensagem-avatar">{inic}</div>}
                        <div className={`cp-mensagem-body${euEnviei ? ' minha' : ''}`}>
                          <div className={`cp-mensagem-bubble${euEnviei ? ' minha' : ''}${msg._temp ? ' temp' : ''}`}>
                            {msg.conteudo}
                          </div>
                          <div className={`cp-mensagem-meta${euEnviei ? ' minha' : ''}`}>
                            {!euEnviei && <span>{nomeRem} · </span>}
                            <span>{hora}</span>
                            {euEnviei && !msg._temp && <span> ✓</span>}
                          </div>
                        </div>
                        {euEnviei && (
                          <div className="cp-mensagem-avatar eu">
                            {(utilizador?.nome || 'E').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={mensagensEndRef} />
                </div>

                <div className="cp-chat-input-area">
                  <textarea
                    className="cp-chat-input"
                    rows={1}
                    value={novaMensagem}
                    onChange={e => setNovaMensagem(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviar();
                      }
                    }}
                    placeholder="Escreve uma mensagem para o gestor…"
                    disabled={enviando}
                  />
                  <button
                    className={`cp-chat-enviar${novaMensagem.trim() ? ' ativo' : ''}`}
                    onClick={handleEnviar}
                    disabled={!novaMensagem.trim() || enviando}
                  >
                    <Send size={16} />
                  </button>
                  <span className="cp-chat-hint">Enter para enviar · Shift+Enter para nova linha</span>
                </div>
              </div>
            )
          )}

        </div>{/* fim aba-content */}
      </div>{/* fim dash-card tabs */}

    </AdminLayout>
  );
}

export default Ambiente;

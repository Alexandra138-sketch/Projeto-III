import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MessageSquare, Send,
  FileText, AlertTriangle, Loader, CheckCircle, XCircle, Shield, Download,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) { return CORES[(parseInt(id, 10) - 1) % CORES.length]; }

function GestorClientePerfil() {
  const { clienteId } = useParams();
  const navigate      = useNavigate();
  const { utilizador } = useAuth();

  const dbClienteId = parseInt(clienteId, 10);

  const [cliente,      setCliente]      = useState(null);
  const [carregando,   setCarregando]   = useState(true);
  const [abaAtiva,     setAbaAtiva]     = useState('resumo');
  const [msgs,         setMsgs]         = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [temMais,      setTemMais]      = useState(true);
  const [msgLoading,   setMsgLoading]   = useState(false);
  const [docs,         setDocs]         = useState([]);
  const [incidentes,   setIncidentes]   = useState([]);
  const [ativos,       setAtivos]       = useState([]);
  const [pedidos,      setPedidos]      = useState([]);
  // Estado do formulário de resposta ao pedido
  const [pedidoResposta, setPedidoResposta] = useState({ id: null, estado: '', resposta: '' });
  const [aResponder,     setAResponder]     = useState(false);

  const mensagensEndRef       = useRef(null);
  const mensagensContainerRef = useRef(null);
  const socketRef             = useRef(null);
  const carregandoRef         = useRef(false);

  /* ── Buscar cliente, documentos e incidentes ── */
  useEffect(() => {
    api.get(`/clientes/${dbClienteId}`)
      .then(({ data }) => setCliente(data))
      .catch(() => setCliente(null))
      .finally(() => setCarregando(false));

    // Buscar documentos deste cliente
    api.get('/documentos', { params: { cliente_id: dbClienteId } })
      .then(({ data }) => setDocs(Array.isArray(data) ? data : []))
      .catch(() => setDocs([]));

    // Buscar incidentes deste cliente usando o query param
    api.get(`/incidentes?cliente_id=${dbClienteId}`)
      .then(({ data }) => setIncidentes(Array.isArray(data) ? data : []))
      .catch(() => setIncidentes([]));

    // Buscar ativos tecnológicos deste cliente
    api.get('/ativos', { params: { cliente_id: dbClienteId } })
      .then(({ data }) => setAtivos(Array.isArray(data) ? data : []))
      .catch(() => setAtivos([]));

    // Buscar pedidos/questões deste cliente
    api.get('/pedidos', { params: { cliente_id: dbClienteId } })
      .then(({ data }) => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => setPedidos([]));
  }, [dbClienteId]);

  /* ── Socket.IO ── */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
    });
    socketRef.current = socket;

    socket.on('nova_mensagem', (msg) => {
      if (String(msg.cliente_id) === String(dbClienteId)) {
        setMsgs((prev) => [...prev, msg]);
        setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    });

    return () => socket.disconnect();
  }, [dbClienteId]);

  /* ── Entrar na sala de chat ── */
  useEffect(() => {
    if (abaAtiva === 'comunicacao') {
      socketRef.current?.emit('entrar_chat', dbClienteId);
      setMsgs([]);
      setTemMais(true);
      carregarMensagens(true);
    } else {
      socketRef.current?.emit('sair_chat', dbClienteId);
    }
  }, [abaAtiva, dbClienteId]); // eslint-disable-line

  /* ── Carregar mensagens ── */
  const carregarMensagens = async (inicial = false, antes = null) => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    setMsgLoading(true);

    try {
      const params = { limite: 20 };
      if (antes) params.antes = antes;
      const { data } = await api.get(`/chat/${dbClienteId}`, { params });

      if (data.length < 20) setTemMais(false);

      if (inicial) {
        setMsgs(data);
        setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } else {
        const container = mensagensContainerRef.current;
        const prevH = container?.scrollHeight || 0;
        setMsgs((prev) => [...data, ...prev]);
        setTimeout(() => {
          if (container) container.scrollTop = container.scrollHeight - prevH;
        }, 50);
      }
    } catch {
      setTemMais(false);
    } finally {
      carregandoRef.current = false;
      setMsgLoading(false);
    }
  };

  /* ── Infinite scroll ── */
  const handleScroll = () => {
    const container = mensagensContainerRef.current;
    if (!container || !temMais || carregandoRef.current) return;
    if (container.scrollTop < 80) {
      const primeira = msgs[0];
      if (primeira?.id) carregarMensagens(false, primeira.id);
    }
  };

  /* ── Enviar mensagem ── */
  const handleEnviar = async () => {
    if (!novaMensagem.trim()) return;
    const conteudo = novaMensagem.trim();
    setNovaMensagem('');

    const tmpId = `tmp_${Date.now()}`;
    setMsgs((prev) => [...prev, {
      id: tmpId,
      conteudo,
      remetente_id: utilizador?.id,
      cliente_id: dbClienteId,
      criado_em: new Date().toISOString(),
      remetente: { nome: utilizador?.nome },
      _temp: true,
    }]);
    setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      await api.post(`/chat/${dbClienteId}`, { conteudo });
      setMsgs((prev) => prev.filter((m) => m.id !== tmpId));
    } catch {
      /* manter a mensagem temporária */
    }
  };

  /* ── Loading / not found ── */
  if (carregando) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar cliente…</p>
        </div>
      </AdminLayout>
    );
  }

  if (!cliente) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <p>Cliente não encontrado.</p>
          <button className="btn-voltar" style={{ margin: '1rem auto 0', display: 'flex' }} onClick={() => navigate('/gestor/clientes')}>
            <ArrowLeft size={15} /> Voltar
          </button>
        </div>
      </AdminLayout>
    );
  }

  const ativo = cliente.estado === 'Ativo';
  const cor   = getCor(cliente.id);

  const pentests = docs.filter(d => d.tipo === 'Pentest');

  // Pedidos pendentes (para mostrar badge de atenção)
  const pedidosPendentes = pedidos.filter((p) => p.estado === 'Pendente').length;

  const abas = [
    { id: 'resumo',      label: 'Resumo',      Icone: FileText,      count: null              },
    { id: 'documentos',  label: 'Documentos',  Icone: FileText,      count: docs.length       },
    { id: 'pentests',    label: 'Pentests',    Icone: Shield,        count: pentests.length   },
    { id: 'incidentes',  label: 'Incidentes',  Icone: AlertTriangle, count: incidentes.length },
    { id: 'ativos',      label: 'Ativos',      Icone: Shield,        count: ativos.length     },
    { id: 'pedidos',     label: 'Pedidos',     Icone: MessageSquare, count: pedidosPendentes  },
    { id: 'comunicacao', label: 'Comunicação', Icone: MessageSquare, count: null              },
  ];

  return (
    <AdminLayout>

      {/* Botão voltar */}
      <button className="btn-voltar" onClick={() => navigate('/gestor/clientes')}>
        <ArrowLeft size={15} /> Voltar à listagem
      </button>

      {/* Cabeçalho do cliente */}
      <div className="dash-card perfil-card">
        <div className="d-flex align-items-start gap-3 flex-wrap">
          <div
            className="perfil-avatar"
            style={{ backgroundColor: ativo ? cor : '#94a3b8' }}
          >
            {cliente.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h4 className="perfil-nome">{cliente.nome}</h4>
              <span className="badge-pill" style={{ background: ativo ? '#dcfce7' : '#f1f5f9', color: ativo ? '#16a34a' : '#94a3b8' }}>
                {ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {' '}{ativo ? 'Cliente ativo' : 'Inativo'}
              </span>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-3">
              <span className="perfil-meta"><Mail size={12} /> {cliente.email}</span>
              {cliente.telefone && <span className="perfil-meta"><Phone size={12} /> {cliente.telefone}</span>}
            </div>

            {/* KPIs rápidos */}
            <div className="d-flex gap-3 flex-wrap">
              <div className="perfil-kpi perfil-kpi-azul">
                <p className="kpi-valor kpi-valor-azul">{cliente.total_documentos ?? 0}</p>
                <p className="kpi-label">Documentos</p>
              </div>
              <div className="perfil-kpi perfil-kpi-laranja">
                <p className="kpi-valor kpi-valor-laranja" style={{ color: '#c2410c' }}>{cliente.total_incidentes ?? 0}</p>
                <p className="kpi-label">Incidentes</p>
              </div>
              <div className="perfil-kpi perfil-kpi-verde">
                <p className="kpi-valor kpi-valor-verde" style={{ color: '#16a34a' }}>{cliente.total_mensagens ?? 0}</p>
                <p className="kpi-label">Mensagens</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="abas-wrapper">
          {abas.map(({ id, label, Icone, count }) => (
            <button
              key={id}
              className={`aba-btn ${abaAtiva === id ? 'ativa' : ''}`}
              onClick={() => setAbaAtiva(id)}
            >
              <Icone size={15} /> {label}
              {count !== null && (
                <span className={`aba-count ${abaAtiva === id ? 'ativa' : 'inativa'}`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="aba-content">

          {/* ── Documentos ── */}
          {abaAtiva === 'documentos' && (
            <div style={{ padding: '1rem 0' }}>
              {docs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Sem documentos para este cliente.
                </p>
              ) : docs.map((doc) => (
                <div key={doc.id} className="resumo-recente-item" style={{ marginBottom: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{doc.titulo}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      {doc.tipo} · v{doc.versao} · {doc.estado}
                    </p>
                  </div>
                  {doc.ficheiro && (
                    <a href={doc.ficheiro} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                      <Download size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Pentests ── */}
          {abaAtiva === 'pentests' && (
            <div style={{ padding: '1rem 0' }}>
              {pentests.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Sem pentests para este cliente.
                </p>
              ) : pentests.map((doc) => (
                <div key={doc.id} style={{ marginBottom: '0.75rem', padding: '1rem', background: '#f5f3ff', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{doc.titulo}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      v{doc.versao} · {doc.estado}
                      {doc.descricao && ` · ${doc.descricao}`}
                    </p>
                  </div>
                  {doc.ficheiro && (
                    <a href={doc.ficheiro} target="_blank" rel="noreferrer" style={{ color: '#7c3aed' }}>
                      <Download size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Incidentes ── */}
          {abaAtiva === 'incidentes' && (
            <div style={{ padding: '1rem 0' }}>
              {incidentes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Sem incidentes para este cliente.
                </p>
              ) : incidentes.map((inc) => {
                const sevCores = {
                  Crítico: { bg: '#fee2e2', cor: '#dc2626' },
                  Alto:    { bg: '#ffedd5', cor: '#c2410c' },
                  Médio:   { bg: '#fef9c3', cor: '#ca8a04' },
                  Baixo:   { bg: '#dcfce7', cor: '#16a34a' },
                };
                const { bg, cor: c } = sevCores[inc.severidade] || { bg: '#f1f5f9', cor: '#64748b' };
                return (
                  <div key={inc.id} style={{ marginBottom: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{inc.titulo}</p>
                      <span style={{ background: bg, color: c, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                        {inc.severidade}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                      {inc.estado}
                      {inc.data_ocorrencia && ` · ${new Date(inc.data_ocorrencia).toLocaleDateString('pt-PT')}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Ativos Tecnológicos ── */}
          {abaAtiva === 'ativos' && (
            <div style={{ padding: '1rem 0' }}>
              {ativos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Este cliente ainda não registou ativos tecnológicos.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Criticidade</th>
                        <th>IP</th>
                        <th>Sistema Operativo</th>
                        <th>Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ativos.map((a) => {
                        const corCrit = {
                          Crítica: { bg: '#fee2e2', cor: '#dc2626' },
                          Alta:    { bg: '#ffedd5', cor: '#c2410c' },
                          Média:   { bg: '#fef9c3', cor: '#ca8a04' },
                          Baixa:   { bg: '#dcfce7', cor: '#16a34a' },
                          Residual:{ bg: '#f1f5f9', cor: '#64748b' },
                        };
                        const { bg, cor: c } = corCrit[a.criticidade] || { bg: '#f1f5f9', cor: '#64748b' };
                        return (
                          <tr key={a.id}>
                            <td>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{a.nome}</p>
                              {a.numero_inventario && (
                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>#{a.numero_inventario}</p>
                              )}
                            </td>
                            <td style={{ fontSize: '0.82rem' }}>{a.tipo_equipamento || '—'}</td>
                            <td>
                              <span style={{ background: bg, color: c, fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                                {a.criticidade || '—'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{a.ip || '—'}</td>
                            <td style={{ fontSize: '0.82rem' }}>{a.sistema_operativo || '—'}</td>
                            <td style={{ fontSize: '0.82rem' }}>{a.responsavel || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Pedidos e Questões ── */}
          {abaAtiva === 'pedidos' && (
            <div style={{ padding: '1rem 0' }}>
              {pedidos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Este cliente ainda não submeteu pedidos.
                </p>
              ) : pedidos.map((pedido) => {
                const estadoCores = {
                  Pendente:    { bg: '#fffbeb', cor: '#b45309', borda: '#fcd34d' },
                  'Em Análise':{ bg: '#eff6ff', cor: '#1d4ed8', borda: '#93c5fd' },
                  Resolvido:   { bg: '#f0fdf4', cor: '#15803d', borda: '#86efac' },
                  Fechado:     { bg: '#f8fafc', cor: '#64748b', borda: '#e2e8f0' },
                };
                const cores = estadoCores[pedido.estado] || estadoCores.Fechado;

                // Mostrar painel de resposta para este pedido específico
                const esteAberto = pedidoResposta.id === pedido.id;

                return (
                  <div key={pedido.id} style={{ marginBottom: '0.75rem', padding: '1rem', background: cores.bg, borderRadius: 10, border: `1px solid ${cores.borda}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.72rem', fontWeight: 600, padding: '1px 7px', borderRadius: 99 }}>
                            {pedido.tipo}
                          </span>
                          <span style={{ background: cores.bg, color: cores.cor, fontSize: '0.72rem', fontWeight: 600, padding: '1px 7px', borderRadius: 99, border: `1px solid ${cores.borda}` }}>
                            {pedido.estado}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{pedido.assunto}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          {new Date(pedido.created_at).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <button
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => setPedidoResposta(
                          esteAberto
                            ? { id: null, estado: '', resposta: '' }
                            : { id: pedido.id, estado: pedido.estado, resposta: pedido.resposta || '' }
                        )}
                      >
                        {esteAberto ? 'Cancelar' : 'Responder'}
                      </button>
                    </div>

                    <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: '#374151', whiteSpace: 'pre-wrap' }}>
                      {pedido.descricao}
                    </p>

                    {pedido.resposta && !esteAberto && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#15803d' }}>
                          Resposta {pedido.respondedor ? `(${pedido.respondedor.nome})` : ''}:
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#374151', whiteSpace: 'pre-wrap' }}>
                          {pedido.resposta}
                        </p>
                      </div>
                    )}

                    {esteAberto && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold mb-1">Alterar Estado</label>
                            <select className="form-select form-select-sm"
                              value={pedidoResposta.estado}
                              onChange={(e) => setPedidoResposta((prev) => ({ ...prev, estado: e.target.value }))}>
                              <option>Pendente</option>
                              <option>Em Análise</option>
                              <option>Resolvido</option>
                              <option>Fechado</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-semibold mb-1">Resposta</label>
                          <textarea className="form-control form-control-sm" rows={3}
                            value={pedidoResposta.resposta}
                            onChange={(e) => setPedidoResposta((prev) => ({ ...prev, resposta: e.target.value }))}
                            placeholder="Escreve a resposta para o cliente…" />
                        </div>
                        <button
                          disabled={aResponder}
                          style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.82rem', cursor: 'pointer' }}
                          onClick={async () => {
                            setAResponder(true);
                            try {
                              const { data } = await api.put(`/pedidos/${pedido.id}`, {
                                estado:   pedidoResposta.estado,
                                resposta: pedidoResposta.resposta,
                              });
                              setPedidos((prev) => prev.map((p) => p.id === pedido.id ? { ...p, ...data } : p));
                              setPedidoResposta({ id: null, estado: '', resposta: '' });
                            } catch (err) {
                              console.error('Erro ao responder ao pedido:', err);
                            } finally {
                              setAResponder(false);
                            }
                          }}
                        >
                          {aResponder ? 'A guardar…' : 'Guardar Resposta'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Chat ── */}
          {abaAtiva === 'comunicacao' && (
            <div className="cp-chat-wrapper">
              <div
                className="cp-chat-mensagens"
                ref={mensagensContainerRef}
                onScroll={handleScroll}
              >
                {msgLoading && (
                  <p className="cp-chat-carregando">A carregar mensagens anteriores…</p>
                )}
                {!temMais && msgs.length > 0 && (
                  <p className="cp-chat-inicio">― Início da conversa ―</p>
                )}
                {msgs.length === 0 && !msgLoading ? (
                  <div className="cp-chat-vazio">
                    <MessageSquare size={40} color="#e2e8f0" />
                    <p>Ainda não há mensagens com este cliente.</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Inicie a conversa abaixo.</p>
                  </div>
                ) : msgs.map((msg) => {
                  const euEnviei = String(msg.remetente_id) === String(utilizador?.id);
                  const nomeRem  = msg.remetente?.nome || 'Desconhecido';
                  const iniciais = nomeRem.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  const hora     = new Date(msg.criado_em || msg.createdAt || Date.now())
                    .toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={msg.id} className={`cp-mensagem-row${euEnviei ? ' minha' : ''}`}>
                      {!euEnviei && <div className="cp-mensagem-avatar">{iniciais}</div>}
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
                          {(utilizador?.nome || 'G').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
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
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEnviar();
                    }
                  }}
                  placeholder="Escreva uma mensagem para o cliente…"
                />
                <button
                  className={`cp-chat-enviar${novaMensagem.trim() ? ' ativo' : ''}`}
                  onClick={handleEnviar}
                  disabled={!novaMensagem.trim()}
                >
                  <Send size={16} />
                </button>
                <span className="cp-chat-hint">Enter para enviar · Shift+Enter para nova linha</span>
              </div>
            </div>
          )}

          {/* ── Resumo ── */}
          {abaAtiva === 'resumo' && (
            <div style={{ padding: '1rem 0' }}>
              <div className="row g-3">
                {[
                  { label: 'Documentos',  val: cliente.total_documentos ?? 0,  bg: '#eff6ff', cor: '#2563eb', Icone: FileText       },
                  { label: 'Incidentes',  val: cliente.total_incidentes ?? 0,  bg: '#fff7ed', cor: '#c2410c', Icone: AlertTriangle   },
                  { label: 'Mensagens',   val: cliente.total_mensagens  ?? 0,  bg: '#f0fdf4', cor: '#16a34a', Icone: MessageSquare   },
                ].map(({ label, val, bg, cor: c, Icone }) => (
                  <div className="col-12 col-md-4" key={label}>
                    <div style={{ background: bg, borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
                      <Icone size={22} color={c} style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: '1.8rem', fontWeight: 700, color: c, margin: 0 }}>{val}</p>
                      <p style={{ fontSize: '0.8rem', color: c, margin: 0, fontWeight: 500 }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {cliente.created_at && (
                <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                  Cliente registado desde {new Date(cliente.created_at).toLocaleDateString('pt-PT')}
                </p>
              )}
            </div>
          )}

        </div>
      </div>

    </AdminLayout>
  );
}

export default GestorClientePerfil;

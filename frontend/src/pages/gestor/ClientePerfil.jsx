import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MessageSquare, Send,
  FileText, AlertTriangle, Loader, CheckCircle, XCircle,
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

  const [cliente,    setCliente]    = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva,   setAbaAtiva]   = useState('comunicacao');
  const [msgs,       setMsgs]       = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [temMais,    setTemMais]    = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  const mensagensEndRef       = useRef(null);
  const mensagensContainerRef = useRef(null);
  const socketRef             = useRef(null);
  const carregandoRef         = useRef(false);

  /* ── Buscar cliente ── */
  useEffect(() => {
    api.get(`/clientes/${dbClienteId}`)
      .then(({ data }) => setCliente(data))
      .catch(() => setCliente(null))
      .finally(() => setCarregando(false));
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

  const abas = [
    { id: 'comunicacao', label: 'Comunicação', Icone: MessageSquare },
    { id: 'resumo',      label: 'Resumo',      Icone: FileText      },
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
          {abas.map(({ id, label, Icone }) => (
            <button
              key={id}
              className={`aba-btn ${abaAtiva === id ? 'ativa' : ''}`}
              onClick={() => setAbaAtiva(id)}
            >
              <Icone size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="aba-content">

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

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../api/axios';
import {
  FiSend, FiMessageSquare, FiSearch, FiMessageCircle,
} from 'react-icons/fi';
import './Chat.css';

const SOCKET_URL = 'http://localhost:3000';

const CORES_DEMO = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
];

const DEMO_CLIENTES = [
  { id: 1, nome: 'Tech Corp Portugal', cor: '#3b82f6' },
  { id: 2, nome: 'Retail Group SA',    cor: '#8b5cf6' },
  { id: 3, nome: 'FinBank Portugal',   cor: '#10b981' },
  { id: 4, nome: 'MediSafe Clinic',    cor: '#f59e0b' },
];

function getDemoMensagens(clienteId, userId) {
  const now = Date.now();
  return [
    {
      id: 1, cliente_id: clienteId, remetente_id: 99,
      conteudo: 'Bom dia! Gostaria de saber o estado do último relatório de segurança.',
      criado_em: new Date(now - 3_600_000 * 5).toISOString(),
      remetente: { id: 99, nome: 'Cliente', perfil: 'empresa' },
    },
    {
      id: 2, cliente_id: clienteId, remetente_id: userId,
      conteudo: 'Bom dia! O relatório está em fase final de revisão. Enviamos até ao final do dia.',
      criado_em: new Date(now - 3_600_000 * 4.5).toISOString(),
      remetente: { id: userId, nome: 'Eu', perfil: 'admin' },
    },
    {
      id: 3, cliente_id: clienteId, remetente_id: 99,
      conteudo: 'Perfeito, obrigado! E relativamente ao incidente da semana passada?',
      criado_em: new Date(now - 3_600_000 * 4).toISOString(),
      remetente: { id: 99, nome: 'Cliente', perfil: 'empresa' },
    },
    {
      id: 4, cliente_id: clienteId, remetente_id: userId,
      conteudo: 'O incidente foi resolvido. A vulnerabilidade foi corrigida e não há risco de recorrência.',
      criado_em: new Date(now - 3_600_000 * 3.5).toISOString(),
      remetente: { id: userId, nome: 'Eu', perfil: 'admin' },
    },
    {
      id: 5, cliente_id: clienteId, remetente_id: 99,
      conteudo: 'Ótimo! Quando podemos agendar a próxima reunião de revisão?',
      criado_em: new Date(now - 3_600_000 * 2).toISOString(),
      remetente: { id: 99, nome: 'Cliente', perfil: 'empresa' },
    },
    {
      id: 6, cliente_id: clienteId, remetente_id: userId,
      conteudo: 'Podemos marcar para a próxima quinta-feira às 10h. Funciona?',
      criado_em: new Date(now - 1_800_000).toISOString(),
      remetente: { id: userId, nome: 'Eu', perfil: 'admin' },
    },
    {
      id: 7, cliente_id: clienteId, remetente_id: 99,
      conteudo: 'Sim, quinta às 10h está ótimo. Até lá!',
      criado_em: new Date(now - 600_000).toISOString(),
      remetente: { id: 99, nome: 'Cliente', perfil: 'empresa' },
    },
  ];
}

/* ── helpers ── */

function formatarHora(data) {
  if (!data) return '';
  return new Date(data).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function formatarData(data) {
  if (!data) return '';
  const d = new Date(data);
  const hoje = new Date();
  if (d.toDateString() === hoje.toDateString()) return 'Hoje';
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (d.toDateString() === ontem.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-PT');
}

/* ── Componente principal ── */

function Chat() {
  const { utilizador } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [clientes,     setClientes]     = useState([]);
  const [clienteAtivo, setClienteAtivo] = useState(null);
  const [mensagens,    setMensagens]    = useState([]);
  const [texto,        setTexto]        = useState('');
  const [carregando,   setCarregando]   = useState(false);
  const [temMais,      setTemMais]      = useState(true);
  const [aEscrever,    setAEscrever]    = useState(null);
  const [ultimasMsgs,  setUltimasMsgs]  = useState({});
  const [pesquisa,     setPesquisa]     = useState('');
  const [modoDemo,     setModoDemo]     = useState(false);

  const socketRef       = useRef(null);
  const mensagensRef    = useRef(null);
  const escritaTimeout  = useRef(null);
  const clienteAtivoRef = useRef(null);
  const carregandoRef   = useRef(false);

  /* Mantém ref sincronizada */
  useEffect(() => { clienteAtivoRef.current = clienteAtivo; }, [clienteAtivo]);
  useEffect(() => { carregandoRef.current = carregando; },    [carregando]);

  /* ── Socket.IO ── */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('nova_mensagem', (msg) => {
      const idAtivo = clienteAtivoRef.current?.id;
      if (msg.cliente_id == idAtivo) {
        setMensagens((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
      setUltimasMsgs((prev) => ({
        ...prev,
        [msg.cliente_id]: {
          conteudo:  msg.conteudo,
          nao_lidas: msg.remetente_id !== utilizador?.id && msg.cliente_id != idAtivo
            ? (prev[msg.cliente_id]?.nao_lidas || 0) + 1
            : prev[msg.cliente_id]?.nao_lidas || 0,
        },
      }));
    });

    socket.on('utilizador_a_escrever',    ({ nome }) => setAEscrever(nome));
    socket.on('utilizador_parou_escrever', ()        => setAEscrever(null));

    return () => socket.disconnect();
  }, []); // eslint-disable-line

  /* ── Buscar clientes ── */
  useEffect(() => {
    api.get('/clientes')
      .then(({ data }) => {
        setClientes(
          data.map((c, i) => ({
            id:   c.id,
            nome: c.nome,
            cor:  CORES_DEMO[i % CORES_DEMO.length],
          }))
        );
      })
      .catch(() => {
        setClientes(DEMO_CLIENTES);
        setModoDemo(true);
      });
  }, []);

  /* ── Buscar conversas (última msg + não lidas) ── */
  useEffect(() => {
    api.get('/chat/conversas')
      .then(({ data }) => {
        const mapa = {};
        data.forEach((c) => {
          mapa[c.cliente_id] = { conteudo: c.conteudo, nao_lidas: c.nao_lidas };
        });
        setUltimasMsgs(mapa);
      })
      .catch(() => {});
  }, []);

  /* ── Selecionar cliente via URL param ── */
  useEffect(() => {
    const id = searchParams.get('cliente');
    if (id && clientes.length > 0) {
      const found = clientes.find((c) => c.id == id);
      if (found) setClienteAtivo(found);
    }
  }, [searchParams, clientes]);

  /* ── Entrar/sair de sala ao mudar cliente ── */
  useEffect(() => {
    if (!clienteAtivo) return;
    socketRef.current?.emit('entrar_chat', clienteAtivo.id);
    setMensagens([]);
    setTemMais(true);
    carregarMensagens(clienteAtivo.id, null, true);
    return () => socketRef.current?.emit('sair_chat', clienteAtivo.id);
  }, [clienteAtivo?.id]); // eslint-disable-line

  /* ── Scroll até ao fundo ── */
  const scrollToBottom = () => {
    if (mensagensRef.current)
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
  };

  /* ── Carregar mensagens (com paginação) ── */
  const carregarMensagens = async (clienteId, antes = null, inicial = false) => {
    if (carregandoRef.current) return;
    setCarregando(true);
    try {
      const params = { limite: 20 };
      if (antes) params.antes = antes;
      const { data } = await api.get(`/chat/${clienteId}`, { params });

      if (data.length < 20) setTemMais(false);

      if (inicial) {
        setMensagens(data);
        setTimeout(scrollToBottom, 50);
      } else {
        const container = mensagensRef.current;
        const prevH = container?.scrollHeight || 0;
        setMensagens((prev) => [...data, ...prev]);
        setTimeout(() => {
          if (container) container.scrollTop = container.scrollHeight - prevH;
        }, 50);
      }
    } catch {
      if (inicial && modoDemo) {
        const demo = getDemoMensagens(clienteId, utilizador?.id);
        setMensagens(demo);
        setTemMais(false);
        setTimeout(scrollToBottom, 50);
      }
    } finally {
      setCarregando(false);
    }
  };

  /* ── Infinite scroll ── */
  const handleScroll = () => {
    const el = mensagensRef.current;
    if (!el || !temMais || carregandoRef.current || !clienteAtivo) return;
    if (el.scrollTop < 80) {
      const primeira = mensagens[0];
      if (primeira) carregarMensagens(clienteAtivo.id, primeira.id, false);
    }
  };

  /* ── Enviar mensagem ── */
  const enviar = async () => {
    if (!texto.trim() || !clienteAtivo) return;
    const conteudo = texto.trim();
    setTexto('');

    // Reset textarea height
    const ta = document.querySelector('.chat-input');
    if (ta) { ta.style.height = 'auto'; }

    // Parar indicador de escrita
    socketRef.current?.emit('parou_escrever', { clienteId: clienteAtivo.id });
    clearTimeout(escritaTimeout.current);

    if (modoDemo) {
      setMensagens((prev) => [...prev, {
        id:          Date.now(),
        conteudo,
        remetente_id: utilizador?.id,
        cliente_id:   clienteAtivo.id,
        criado_em:    new Date().toISOString(),
        remetente:    utilizador,
      }]);
      setTimeout(scrollToBottom, 50);
      return;
    }

    // Optimistic update
    const tmpId = `tmp_${Date.now()}`;
    setMensagens((prev) => [...prev, {
      id: tmpId, conteudo,
      remetente_id: utilizador?.id,
      cliente_id:   clienteAtivo.id,
      criado_em:    new Date().toISOString(),
      remetente:    utilizador,
      _temp:        true,
    }]);
    setTimeout(scrollToBottom, 50);

    try {
      await api.post(`/chat/${clienteAtivo.id}`, { conteudo });
      // A mensagem real chega via socket — remove o temp
      setMensagens((prev) => prev.filter((m) => m.id !== tmpId));
    } catch {
      // Manter a temp em caso de erro
    }
  };

  /* ── Textarea: resize automático + typing ── */
  const handleTextoChange = (e) => {
    setTexto(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

    if (clienteAtivo && socketRef.current) {
      socketRef.current.emit('a_escrever', {
        clienteId: clienteAtivo.id,
        nome:      utilizador?.nome,
      });
      clearTimeout(escritaTimeout.current);
      escritaTimeout.current = setTimeout(() => {
        socketRef.current?.emit('parou_escrever', { clienteId: clienteAtivo.id });
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  /* ── Selecionar cliente ── */
  const selecionarCliente = (c) => {
    setClienteAtivo(c);
    setSearchParams({ cliente: c.id });
    setUltimasMsgs((prev) => ({
      ...prev,
      [c.id]: { ...prev[c.id], nao_lidas: 0 },
    }));
  };

  /* ── Agrupar mensagens por data ── */
  const itens = [];
  let dataAtual = null;
  mensagens.forEach((msg) => {
    const d = formatarData(msg.criado_em || msg.createdAt);
    if (d !== dataAtual) {
      itens.push({ tipo: 'sep', data: d });
      dataAtual = d;
    }
    itens.push({ tipo: 'msg', msg });
  });

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  /* ────────────────────────────────────────── */
  return (
    <AdminLayout contentClass="admin-content-chat">
      <div className="chat-wrapper">

        {/* ── Painel esquerdo ── */}
        <div className="chat-lista">
          <div className="chat-lista-header">
            <h6>
              <FiMessageCircle size={17} style={{ marginRight: 7 }} />
              Mensagens
            </h6>
            <div className="chat-pesquisa">
              <FiSearch size={13} color="#94a3b8" />
              <input
                placeholder="Pesquisar cliente..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-lista-items">
            {clientesFiltrados.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                Nenhum cliente encontrado
              </div>
            )}
            {clientesFiltrados.map((c) => {
              const ultima = ultimasMsgs[c.id];
              return (
                <div
                  key={c.id}
                  className={`chat-lista-item${clienteAtivo?.id === c.id ? ' ativo' : ''}`}
                  onClick={() => selecionarCliente(c)}
                >
                  <div className="chat-avatar" style={{ background: c.cor }}>
                    {c.nome[0]}
                  </div>
                  <div className="chat-lista-info">
                    <div className="chat-lista-nome">{c.nome}</div>
                    <div className="chat-lista-ultima">
                      {ultima?.conteudo || 'Iniciar conversa'}
                    </div>
                  </div>
                  {ultima?.nao_lidas > 0 && (
                    <span className="chat-badge">{ultima.nao_lidas}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Painel direito ── */}
        {clienteAtivo ? (
          <div className="chat-area">

            {/* Cabeçalho */}
            <div className="chat-header">
              <div className="chat-avatar" style={{ background: clienteAtivo.cor, width: 38, height: 38 }}>
                {clienteAtivo.nome[0]}
              </div>
              <div>
                <div className="chat-header-nome">{clienteAtivo.nome}</div>
                <div className="chat-header-sub">● Online</div>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="chat-mensagens" ref={mensagensRef} onScroll={handleScroll}>
              {carregando && (
                <div className="chat-carregando">A carregar mensagens anteriores...</div>
              )}
              {!temMais && mensagens.length > 0 && (
                <div className="chat-inicio">― Início da conversa ―</div>
              )}

              {itens.map((item, i) => {
                if (item.tipo === 'sep') {
                  return (
                    <div key={`sep_${i}`} className="chat-data-sep">
                      <span>{item.data}</span>
                    </div>
                  );
                }

                const { msg } = item;
                const euEnviei = msg.remetente_id == utilizador?.id;

                /* Mostrar avatar só na primeira mensagem seguida do mesmo remetente */
                const anteriorMsg = itens[i - 1]?.tipo === 'msg' ? itens[i - 1].msg : null;
                const mostrarAvatar = !euEnviei && (
                  !anteriorMsg || anteriorMsg.remetente_id !== msg.remetente_id
                );

                return (
                  <div key={msg.id} className={`chat-msg-row ${euEnviei ? 'eu' : 'outro'}`}>
                    {!euEnviei && (
                      <div
                        className="chat-msg-avatar"
                        style={{ visibility: mostrarAvatar ? 'visible' : 'hidden' }}
                      >
                        {msg.remetente?.nome?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      {mostrarAvatar && !euEnviei && (
                        <div className="chat-msg-remetente">
                          {msg.remetente?.nome || 'Cliente'}
                        </div>
                      )}
                      <div className={`chat-bolha ${euEnviei ? 'eu' : 'outro'}${msg._temp ? ' temp' : ''}`}>
                        {msg.conteudo}
                      </div>
                      <div className={`chat-hora ${euEnviei ? 'eu' : 'outro'}`}>
                        {formatarHora(msg.criado_em || msg.createdAt || new Date())}
                        {euEnviei && !msg._temp && (
                          <span style={{ marginLeft: 4, opacity: 0.7 }}>✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {aEscrever && (
                <div className="chat-typing">
                  <div className="chat-typing-dots">
                    <span /><span /><span />
                  </div>
                  <span className="chat-typing-texto">{aEscrever} está a escrever...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder="Escreve uma mensagem… (Enter para enviar)"
                value={texto}
                onChange={handleTextoChange}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="chat-enviar"
                onClick={enviar}
                disabled={!texto.trim()}
                title="Enviar"
              >
                <FiSend size={17} />
              </button>
            </div>

          </div>
        ) : (
          <div className="chat-vazio">
            <FiMessageSquare size={52} color="#cbd5e1" />
            <p>Seleciona um cliente para iniciar o chat</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default Chat;

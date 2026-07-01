import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Shield, User, FileText, AlertTriangle,
  MessageSquare, Download, CheckCircle, Send, Calendar, Tag,
  Clock, TrendingUp, ToggleLeft, ToggleRight, XCircle,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* Cor gerada a partir do ID do cliente */
const CORES_PERFIL = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) {
  return CORES_PERFIL[(parseInt(id, 10) - 1) % CORES_PERFIL.length];
}


const DOC_TIPO = { policy: 'Política', report: 'Relatório', contract: 'Contrato', audit: 'Auditoria', pentest: 'Pentest' };
const DOC_EST = { 'Ativo': { label: 'Ativo', bg: '#dcfce7', cor: '#16a34a' }, 'Expirado': { label: 'Expirado', bg: '#fee2e2', cor: '#dc2626' }, 'Em Revisão': { label: 'Em revisão', bg: '#fef9c3', cor: '#ca8a04' } };
const SEV_CFG = { 'Crítico': { label: 'Crítico', dot: 'findings-bar-seg-critical', bg: '#fee2e2', cor: '#dc2626' }, 'Alto': { label: 'Alto', dot: 'findings-bar-seg-high', bg: '#ffedd5', cor: '#c2410c' }, 'Médio': { label: 'Médio', dot: 'findings-bar-seg-medium', bg: '#fef9c3', cor: '#ca8a04' }, 'Baixo': { label: 'Baixo', dot: 'findings-bar-seg-low', bg: '#dcfce7', cor: '#16a34a' } };
const INC_EST = { 'Aberto': { label: 'Aberto', bg: '#fee2e2', cor: '#dc2626' }, 'A Investigar': { label: 'A investigar', bg: '#fef9c3', cor: '#ca8a04' }, 'Resolvido': { label: 'Resolvido', bg: '#dcfce7', cor: '#16a34a' }, 'Fechado': { label: 'Fechado', bg: '#f1f5f9', cor: '#64748b' } };
const PT_TIPO = { internal: 'Interno', external: 'Externo', web: 'Web', mobile: 'Mobile', social: 'Eng. Social' };
const PT_EST = { scheduled: { label: 'Agendado', bg: '#dbeafe', cor: '#2563eb' }, in_progress: { label: 'Em curso', bg: '#fef9c3', cor: '#ca8a04' }, completed: { label: 'Concluído', bg: '#dcfce7', cor: '#16a34a' }, report_sent: { label: 'Relatório enviado', bg: '#ede9fe', cor: '#7c3aed' } };

const RESUMO_KPIS = [
  { key: 'docs', label: 'Total de documentos', sub: (d, p, i, m) => `${d.filter(x => x.estado === 'Ativo').length} ativos`, cardClass: 'resumo-kpi-azul', valClass: 'resumo-kpi-val-azul', Icone: FileText },
  { key: 'findings', label: 'Findings totais', sub: (d, p, i, m) => `${p.filter(x => x.critical > 0).length} com críticos`, cardClass: 'resumo-kpi-roxo', valClass: 'resumo-kpi-val-roxo', Icone: Shield },
  { key: 'inc', label: 'Incidentes totais', sub: (d, p, i, m) => `${i.filter(x => x.estado === 'Aberto' || x.estado === 'A Investigar').length} abertos`, cardClass: 'resumo-kpi-laranja', valClass: 'resumo-kpi-val-laranja', Icone: AlertTriangle },
  { key: 'msgs', label: 'Mensagens trocadas', sub: (d, p, i, m) => 'no histórico', cardClass: 'resumo-kpi-verde', valClass: 'resumo-kpi-val-verde', Icone: MessageSquare },
];

function Pill({ bg, cor, children }) {
  return <span className="badge-pill" style={{ background: bg, color: cor }}>{children}</span>;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `há ${d}d`;
  if (h > 0) return `há ${h}h`;
  return 'agora';
}

function ClientePerfil() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const { utilizador } = useAuth();

  /* ID inteiro real na BD */
  const dbClienteId = parseInt(clienteId, 10);

  const [cliente, setCliente]           = useState(null);
  const [clienteCarregando, setClienteCarregando] = useState(true);
  const [msgs, setMsgs]                 = useState([]);
  const [abaAtiva, setAbaAtiva]         = useState('resumo');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [confirmarEstado, setConfirmarEstado] = useState(false);
  const [contaModal, setContaModal]           = useState(false);
  const [contaId, setContaId]                 = useState('');
  const [utilizadoresEmpresa, setUtilizadoresEmpresa] = useState([]);
  const [temMais, setTemMais]           = useState(true);
  const [carregando, setCarregando]     = useState(false);
  const [modoDemo, setModoDemo]         = useState(false);
  const [docs, setDocs]                 = useState([]);
  const [incidentes, setIncidentes]     = useState([]);

  const mensagensEndRef       = useRef(null);
  const mensagensContainerRef = useRef(null);
  const socketRef             = useRef(null);
  const carregandoRef         = useRef(false);

  /* Pentests — sem tabela na BD, sempre vazio */
  const pentests = [];

  /* Buscar incidentes e documentos reais da BD */
  useEffect(() => {
    if (!dbClienteId) return;
    Promise.allSettled([
      api.get('/incidentes', { params: { cliente_id: dbClienteId } }),
      api.get('/documentos', { params: { cliente_id: dbClienteId } }),
    ]).then(([incRes, docRes]) => {
      if (incRes.status === 'fulfilled') setIncidentes(Array.isArray(incRes.value.data) ? incRes.value.data : []);
      if (docRes.status === 'fulfilled') setDocs(Array.isArray(docRes.value.data) ? docRes.value.data : []);
    });
  }, [dbClienteId]);

  /* ── Buscar cliente da BD ── */
  useEffect(() => {
    setClienteCarregando(true);
    api.get(`/clientes/${dbClienteId}`)
      .then(({ data }) => setCliente(data))
      .catch(() => setCliente(null))
      .finally(() => setClienteCarregando(false));
  }, [dbClienteId]);

  const totalFindings  = pentests.reduce((s, p) => s + p.findings, 0);
  const incAbertos     = incidentes.filter((i) => i.estado === 'Aberto' || i.estado === 'A Investigar').length;
  const pentestsAtivos = pentests.filter((p) => p.estado === 'in_progress').length;
  const docsAtivos     = docs.filter((d) => d.estado === 'Ativo').length;

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
  }, [dbClienteId]); // eslint-disable-line

  /* ── Entrar/sair da sala ao mudar de aba ── */
  useEffect(() => {
    if (abaAtiva === 'comunicacao') {
      socketRef.current?.emit('entrar_chat', dbClienteId);
      setMsgs([]);
      setTemMais(true);
      setModoDemo(false);
      carregarMensagens(true);
    } else {
      socketRef.current?.emit('sair_chat', dbClienteId);
    }
  }, [abaAtiva, dbClienteId]); // eslint-disable-line

  /* ── Carregar mensagens (paginadas) ── */
  const carregarMensagens = async (inicial = false, antes = null) => {
    if (carregandoRef.current) return;
    carregandoRef.current = true;
    setCarregando(true);

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
      if (inicial) {
        setMsgs([]);
        setTemMais(false);
      }
    } finally {
      carregandoRef.current = false;
      setCarregando(false);
    }
  };

  /* ── Infinite scroll (carregar mensagens anteriores) ── */
  const handleMsgScroll = () => {
    const container = mensagensContainerRef.current;
    if (!container || !temMais || carregandoRef.current) return;
    if (container.scrollTop < 80) {
      const primeira = msgs[0];
      if (primeira?.id) carregarMensagens(false, primeira.id);
    }
  };

  /* ── Enviar mensagem ── */
  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim()) return;
    const conteudo = novaMensagem.trim();
    setNovaMensagem('');

    if (modoDemo) {
      setMsgs((prev) => [...prev, {
        id: `demo_${Date.now()}`,
        conteudo,
        remetente_id: utilizador?.id ?? 1,
        cliente_id: dbClienteId,
        criado_em: new Date().toISOString(),
        remetente: { nome: utilizador?.nome || 'Admin' },
      }]);
      setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      return;
    }

    /* optimistic update */
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
      /* manter mensagem temporária em caso de erro */
    }
  };

  const abrirContaModal = () => {
    setContaId(cliente?.utilizador?.id || '');
    api.get('/utilizadores').then(({ data }) => {
      setUtilizadoresEmpresa(data.filter((u) => u.perfil === 'empresa'));
    });
    setContaModal(true);
  };

  const handleVincularConta = async () => {
    try {
      const { data } = await api.put(`/clientes/update/${dbClienteId}`, {
        utilizador_id: contaId || null,
      });
      setCliente((prev) => ({ ...prev, utilizador_id: data.utilizador_id, utilizador: utilizadoresEmpresa.find((u) => String(u.id) === String(contaId)) || null }));
      setContaModal(false);
    } catch {
      /* manter modal aberto em caso de erro */
    }
  };

  const handleToggleAtivo = async () => {
    const novoEstado = cliente?.estado === 'Ativo' ? 'Inativo' : 'Ativo';
    setConfirmarEstado(false);
    try {
      const { data } = await api.put(`/clientes/update/${dbClienteId}`, { estado: novoEstado });
      setCliente((prev) => ({ ...prev, estado: data.estado }));
    } catch {
      /* fallback local se a API falhar */
      setCliente((prev) => ({ ...prev, estado: novoEstado }));
    }
  };

  if (clienteCarregando) {
    return (
      <AdminLayout>
        <div className="text-center py-5 text-muted">
          <p>A carregar cliente…</p>
        </div>
      </AdminLayout>
    );
  }

  if (!cliente) {
    return (
      <AdminLayout>
        <div className="text-center py-5 text-muted">
          <p>Cliente não encontrado.</p>
          <button className="btn-voltar mx-auto mt-3" onClick={() => navigate('/admin/clientes')}>
            <ArrowLeft size={15} /> Voltar à listagem
          </button>
        </div>
      </AdminLayout>
    );
  }

  /* Campos calculados a partir dos dados da BD */
  const ativo    = cliente.estado === 'Ativo';
  const cor      = getCor(cliente.id);
  const criadoEm = (cliente.created_at || cliente.createdAt)
    ? new Date(cliente.created_at || cliente.createdAt).toLocaleDateString('pt-PT')
    : '—';
  const respSeg  = cliente.responsavel_seguranca || null;
  const contPerm = cliente.contato_permanente    || null;

  const abas = [
    { id: 'resumo', label: 'Resumo', Icone: FileText, count: null },
    { id: 'documentos', label: 'Documentos', Icone: FileText, count: docs.length },
    { id: 'pentests', label: 'Pentests', Icone: Shield, count: pentests.length },
    { id: 'incidentes', label: 'Incidentes', Icone: AlertTriangle, count: incidentes.length },
    { id: 'comunicacao', label: 'Comunicação', Icone: MessageSquare, count: msgs.length },
  ];

  const resumoVals = {
    docs:     docs.length,
    findings: totalFindings,
    inc:      incidentes.length,
    msgs:     msgs.length,
  };

  return (
    <AdminLayout>

      {contaModal && (
        <div className="modal-overlay" onClick={() => setContaModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Vincular Conta de Empresa</h5>
              <button className="modal-close" onClick={() => setContaModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Seleciona o utilizador com perfil <strong>empresa</strong> que terá acesso ao portal desta empresa.
              </p>
              <select
                className="form-select"
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
              >
                <option value="">— Sem conta vinculada —</option>
                {utilizadoresEmpresa.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setContaModal(false)}>Cancelar</button>
              <button className="btn-guardar" onClick={handleVincularConta}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {confirmarEstado && (
        <div className="modal-overlay" onClick={() => setConfirmarEstado(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{ativo ? 'Desativar cliente?' : 'Ativar cliente?'}</h5>
              <button className="modal-close" onClick={() => setConfirmarEstado(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                {ativo
                  ? `"${cliente.nome}" ficará inativo e o acesso será suspenso.`
                  : `"${cliente.nome}" voltará a ter acesso ativo à plataforma.`}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setConfirmarEstado(false)}>Cancelar</button>
              <button
                className="btn-guardar"
                style={{ background: ativo ? '#ef4444' : '#16a34a' }}
                onClick={handleToggleAtivo}
              >
                {ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="btn-voltar" onClick={() => navigate('/admin/clientes')}>
        <ArrowLeft size={15} /> Voltar à listagem
      </button>

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
              <Pill bg={ativo ? '#dcfce7' : '#f1f5f9'} cor={ativo ? '#16a34a' : '#94a3b8'}>
                {ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {' '}{ativo ? 'Cliente ativo' : 'Inativo'}
              </Pill>
              <button
                className={`btn-toggle-estado ${ativo ? 'desativar' : 'ativar'}`}
                onClick={() => setConfirmarEstado(true)}
              >
                {ativo ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                {ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-3">
              <span className="perfil-meta"><Mail size={12} /> {cliente.email}</span>
              {cliente.telefone && <span className="perfil-meta"><Phone size={12} /> {cliente.telefone}</span>}
              <span className="perfil-meta"><Calendar size={12} /> Cliente desde {criadoEm}</span>
            </div>

            <div className="d-flex align-items-start flex-wrap gap-3">
              <div className="d-flex gap-2">
                <div className="perfil-kpi perfil-kpi-azul">
                  <p className="kpi-valor kpi-valor-azul">{docsAtivos}<span className="kpi-total">/{docs.length}</span></p>
                  <p className="kpi-label">Documentos</p>
                </div>
                <div className="perfil-kpi perfil-kpi-roxo">
                  <p className="kpi-valor kpi-valor-roxo">{pentestsAtivos}<span className="kpi-total">/{pentests.length}</span></p>
                  <p className="kpi-label">Pentests ativos</p>
                </div>
                <div className={`perfil-kpi ${incAbertos > 0 ? 'perfil-kpi-vermelho' : 'perfil-kpi-neutro'}`}>
                  <p className={`kpi-valor ${incAbertos > 0 ? 'kpi-valor-vermelho' : 'kpi-valor-neutro'}`}>{incAbertos}<span className="kpi-total">/{incidentes.length}</span></p>
                  <p className="kpi-label">Incidentes abertos</p>
                </div>
              </div>

              <div className="perfil-divisor" />

              <div className="d-flex flex-wrap gap-2">
                {/* Gestor responsável (vem da BD) */}
                {cliente.gestor && (
                  <div className="contacto-box contacto-box-seguranca">
                    <div className="contacto-icon contacto-icon-seguranca">
                      <Shield size={13} color="#2563eb" />
                    </div>
                    <div>
                      <p className="contacto-titulo">Gestor Responsável</p>
                      <p className="contacto-nome">{cliente.gestor?.nome || cliente.gestor_nome}</p>
                      <p className="contacto-detalhe">{cliente.gestor?.email || '—'}</p>
                    </div>
                  </div>
                )}
                {/* Conta de acesso empresa */}
                <div className="contacto-box contacto-box-permanente">
                  <div className="contacto-icon contacto-icon-permanente">
                    <User size={13} color="#16a34a" />
                  </div>
                  <div>
                    <p className="contacto-titulo">Conta de Acesso</p>
                    {cliente.utilizador
                      ? <>
                          <p className="contacto-nome">{cliente.utilizador.nome}</p>
                          <p className="contacto-detalhe">{cliente.utilizador.email}</p>
                        </>
                      : <p className="contacto-detalhe" style={{ color: '#ef4444' }}>Sem conta vinculada</p>
                    }
                    <button
                      onClick={abrirContaModal}
                      style={{ marginTop: 4, fontSize: '0.72rem', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      {cliente.utilizador ? 'Alterar conta' : 'Vincular conta'}
                    </button>
                  </div>
                </div>

                {/* Resp. de Segurança — campo extra (quando existir na BD) */}
                {respSeg && (
                  <div className="contacto-box contacto-box-permanente">
                    <div className="contacto-icon contacto-icon-permanente">
                      <User size={13} color="#16a34a" />
                    </div>
                    <div>
                      <p className="contacto-titulo">Resp. Segurança</p>
                      <p className="contacto-nome">{respSeg.nome}</p>
                      <p className="contacto-detalhe">{respSeg.email} · {respSeg.telefone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="abas-wrapper">
          {abas.map(({ id, label, Icone, count }) => (
            <button
              key={id}
              className={`aba-btn ${abaAtiva === id ? 'ativa' : ''}`}
              onClick={() => setAbaAtiva(id)}
            >
              <Icone size={15} />
              {label}
              {count !== null && (
                <span className={`aba-count ${abaAtiva === id ? 'ativa' : 'inativa'}`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="aba-content">

          {abaAtiva === 'resumo' && (
            <div>
              <div className="resumo-kpi-grid">
                {RESUMO_KPIS.map(({ key, label, sub, cardClass, valClass, Icone }) => (
                  <div key={key} className={`resumo-kpi-card ${cardClass}`}>
                    <div className="resumo-kpi-header">
                      <p className="resumo-kpi-titulo">{label}</p>
                      <Icone size={14} />
                    </div>
                    <p className={`resumo-kpi-valor ${valClass}`}>{resumoVals[key]}</p>
                    <p className="resumo-kpi-sub">{sub(docs, pentests, incidentes, msgs)}</p>
                  </div>
                ))}
              </div>
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <p className="incidente-nome mb-3">Documentos recentes</p>
                  {docs.length === 0
                    ? <p className="text-center text-muted py-3">Sem documentos.</p>
                    : docs.slice(0, 3).map((doc) => {
                        const est = DOC_EST[doc.estado] || DOC_EST['Ativo'];
                        return (
                          <div key={doc.id} className="resumo-recente-item">
                            <FileText size={15} color="#3b82f6" />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <p className="incidente-nome text-truncate">{doc.titulo}</p>
                              <p className="incidente-data">v{doc.versao} · {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('pt-PT') : '—'}</p>
                            </div>
                            <Pill bg={est.bg} cor={est.cor}>{est.label}</Pill>
                          </div>
                        );
                      })
                  }
                </div>
                <div className="col-12 col-lg-6">
                  <p className="incidente-nome mb-3">Incidentes recentes</p>
                  {incidentes.length === 0
                    ? <p className="text-center text-muted py-3">Sem incidentes.</p>
                    : incidentes.slice(0, 3).map((inc) => {
                        const sev = SEV_CFG[inc.severidade] || SEV_CFG['Médio'];
                        const est = INC_EST[inc.estado] || INC_EST['Aberto'];
                        return (
                          <div key={inc.id} className="resumo-recente-item">
                            <div className={`incidente-dot ${sev.dot}`} />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <p className="incidente-nome text-truncate">{inc.titulo}</p>
                              <p className="incidente-data">{inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}</p>
                            </div>
                            <Pill bg={est.bg} cor={est.cor}>{est.label}</Pill>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'documentos' && (
            <div>
              {docs.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FileText size={40} color="#e2e8f0" className="mb-3" />
                  <p>Sem documentos associados a este cliente.</p>
                </div>
              ) : docs.map((doc) => {
                const est = DOC_EST[doc.estado] || DOC_EST['Ativo'];
                return (
                  <div key={doc.id} className="perfil-item">
                    <div className="d-flex align-items-start gap-3">
                      <div className="perfil-item-icon" style={{ background: '#dbeafe' }}>
                        <FileText size={17} color="#2563eb" />
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <p className="perfil-item-titulo">{doc.titulo}</p>
                          <Pill bg={est.bg} cor={est.cor}>{est.label}</Pill>
                          <Pill bg="#f1f5f9" cor="#64748b">{DOC_TIPO[doc.tipo] || doc.tipo}</Pill>
                        </div>
                        <p className="incidente-data mb-2">{doc.descricao}</p>
                        <div className="d-flex flex-wrap gap-3">
                          <span className="perfil-item-meta"><Tag size={11} /> v{doc.versao}</span>
                          <span className="perfil-item-meta"><Clock size={11} /> {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('pt-PT') : '—'}</span>
                          <span className="perfil-item-meta">{doc.tamanho}</span>
                        </div>
                      </div>
                      <button className="btn-descarregar">
                        <Download size={13} /> Descarregar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {abaAtiva === 'pentests' && (
            <div>
              {pentests.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Shield size={40} color="#e2e8f0" className="mb-3" />
                  <p>Sem pentests registados para este cliente.</p>
                </div>
              ) : pentests.map((pt) => {
                const est = PT_EST[pt.estado] || PT_EST.scheduled;
                return (
                  <div key={pt.id} className="perfil-item">
                    <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                      <div className="d-flex align-items-start gap-3">
                        <div className="perfil-item-icon" style={{ background: '#ede9fe' }}>
                          <Shield size={17} color="#7c3aed" />
                        </div>
                        <div>
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <p className="perfil-item-titulo">Pentest {PT_TIPO[pt.tipo]}</p>
                            <Pill bg={est.bg} cor={est.cor}>{est.label}</Pill>
                          </div>
                          <div className="d-flex flex-wrap gap-3">
                            <span className="perfil-item-meta"><Calendar size={11} /> Agendado: {pt.agendado}</span>
                            {pt.concluido && <span className="perfil-item-meta"><CheckCircle size={11} /> Concluído: {pt.concluido}</span>}
                          </div>
                        </div>
                      </div>
                      {pt.findings > 0 && (
                        <div className="findings-grid">
                          {[
                            { label: 'C', val: pt.critical, bg: '#fee2e2', cor: '#dc2626' },
                            { label: 'A', val: pt.high, bg: '#ffedd5', cor: '#c2410c' },
                            { label: 'M', val: pt.medium, bg: '#fef9c3', cor: '#ca8a04' },
                            { label: 'B', val: pt.low, bg: '#dcfce7', cor: '#16a34a' },
                            { label: 'Total', val: pt.findings, bg: '#f1f5f9', cor: '#475569' },
                          ].map((f) => (
                            <div key={f.label} className="finding-box" style={{ background: f.bg }}>
                              <p className="finding-valor" style={{ color: f.cor }}>{f.val}</p>
                              <p className="finding-label" style={{ color: f.cor }}>{f.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {pt.findings > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <TrendingUp size={12} color="#94a3b8" />
                          <span className="perfil-item-meta">Distribuição de findings</span>
                        </div>
                        <div className="findings-bar">
                          {pt.critical > 0 && <div className="findings-bar-seg-critical" style={{ width: `${(pt.critical / pt.findings) * 100}%` }} />}
                          {pt.high > 0 && <div className="findings-bar-seg-high" style={{ width: `${(pt.high / pt.findings) * 100}%` }} />}
                          {pt.medium > 0 && <div className="findings-bar-seg-medium" style={{ width: `${(pt.medium / pt.findings) * 100}%` }} />}
                          {pt.low > 0 && <div className="findings-bar-seg-low" style={{ width: `${(pt.low / pt.findings) * 100}%` }} />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {abaAtiva === 'incidentes' && (
            <div>
              {incidentes.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <AlertTriangle size={40} color="#e2e8f0" className="mb-3" />
                  <p>Sem incidentes registados para este cliente.</p>
                </div>
              ) : incidentes.map((inc) => {
                const sev = SEV_CFG[inc.severidade] || SEV_CFG['Médio'];
                const est = INC_EST[inc.estado] || INC_EST['Aberto'];
                return (
                  <div key={inc.id} className="perfil-item">
                    <div className="d-flex align-items-start gap-3">
                      <div className={`incidente-dot ${sev.dot}`} style={{ marginTop: 5 }} />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <p className="perfil-item-titulo">{inc.titulo}</p>
                          <Pill bg={sev.bg} cor={sev.cor}>{sev.label}</Pill>
                          <Pill bg={est.bg} cor={est.cor}>{est.label}</Pill>
                          {inc.nis2_notificado && <Pill bg="#e0e7ff" cor="#4338ca"><Shield size={10} /> NIS2</Pill>}
                        </div>
                        <p className="incidente-data mb-2">{inc.descricao}</p>
                        <div className="d-flex flex-wrap gap-3">
                          <span className="perfil-item-meta"><Calendar size={11} /> Reportado: {inc.created_at ? new Date(inc.created_at).toLocaleDateString('pt-PT') : '—'}</span>
                          <span className="perfil-item-meta"><User size={11} /> {inc.reportador?.nome || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {abaAtiva === 'comunicacao' && (
            <div className="cp-chat-wrapper">
              <div
                className="cp-chat-mensagens"
                ref={mensagensContainerRef}
                onScroll={handleMsgScroll}
              >
                {carregando && (
                  <p className="cp-chat-carregando">A carregar mensagens anteriores…</p>
                )}
                {!temMais && msgs.length > 0 && (
                  <p className="cp-chat-inicio">― Início da conversa ―</p>
                )}
                {msgs.length === 0 && !carregando ? (
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
                      {!euEnviei && (
                        <div className="cp-mensagem-avatar">{iniciais}</div>
                      )}
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
                          {(utilizador?.nome || 'A').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
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
                      handleEnviarMensagem();
                    }
                  }}
                  placeholder="Escreva uma mensagem para o cliente…"
                />
                <button
                  className={`cp-chat-enviar${novaMensagem.trim() ? ' ativo' : ''}`}
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim()}
                >
                  <Send size={16} />
                </button>
                <span className="cp-chat-hint">Enter para enviar · Shift+Enter para nova linha</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}

export default ClientePerfil;
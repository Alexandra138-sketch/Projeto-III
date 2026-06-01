import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Shield, User, FileText, AlertTriangle,
  MessageSquare, Download, CheckCircle, Send, Calendar, Tag,
  Clock, TrendingUp, ToggleLeft, ToggleRight, XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';

const CLIENTES_DB = [
  { id: 'c1', nome: 'Tech Corp Portugal', email: 'seguranca@techcorp.pt', telefone: '+351 215 000 100', cor: '#3b82f6', ativo: true, criadoEm: '2024-05-20', gestorResponsavel: 'João Silva', responsavelSeguranca: { nome: 'Carlos Mendes', email: 'c.mendes@techcorp.pt', telefone: '+351 916 000 004' }, contatoPermanente: { nome: 'Sofia Lopes', email: 's.lopes@techcorp.pt', telefone: '+351 917 000 005' } },
  { id: 'c2', nome: 'Retail Group SA', email: 'it@retailgroup.pt', telefone: '+351 218 000 200', cor: '#8b5cf6', ativo: true, criadoEm: '2024-03-08', gestorResponsavel: 'Ana Costa', responsavelSeguranca: { nome: 'Miguel Ferreira', email: 'm.ferreira@retailgroup.pt', telefone: '+351 918 000 006' }, contatoPermanente: { nome: 'Inês Pereira', email: 'i.pereira@retailgroup.pt', telefone: '+351 919 000 007' } },
  { id: 'c3', nome: 'FinBank Portugal', email: 'ciso@finbank.pt', telefone: '+351 213 000 300', cor: '#10b981', ativo: true, criadoEm: '2024-05-20', gestorResponsavel: 'João Silva', responsavelSeguranca: { nome: 'Ricardo Nunes', email: 'r.nunes@finbank.pt', telefone: '+351 920 000 008' }, contatoPermanente: { nome: 'Beatriz Santos', email: 'b.santos@finbank.pt', telefone: '+351 921 000 009' } },
  { id: 'c4', nome: 'MediSafe Clinic', email: 'admin@medisafe.pt', telefone: '+351 222 000 400', cor: '#f59e0b', ativo: false, criadoEm: '2024-07-01', gestorResponsavel: 'Ana Costa', responsavelSeguranca: { nome: 'Ana Rodrigues', email: 'a.rodrigues@medisafe.pt', telefone: '+351 922 000 010' }, contatoPermanente: { nome: 'Luís Faria', email: 'l.faria@medisafe.pt', telefone: '+351 923 000 011' } },
];

const DOCUMENTOS_DB = {
  c1: [
    { id: 'd1', titulo: 'Política de Segurança da Informação NIS2', tipo: 'policy', estado: 'active', versao: '3.1', descricao: 'Política geral de segurança conforme diretiva NIS2.', atualizado: '2025-02-15', tamanho: '2.4 MB' },
    { id: 'd2', titulo: 'Relatório de Pentest - Infraestrutura Web', tipo: 'pentest', estado: 'active', versao: '1.0', descricao: 'Relatório completo do teste de intrusão à infra web.', atualizado: '2025-01-30', tamanho: '8.7 MB' },
    { id: 'd3', titulo: 'Relatório de Incidente - Ransomware Q1 2025', tipo: 'report', estado: 'active', versao: '2.1', descricao: 'Relatório de incidente notificado às autoridades NIS2.', atualizado: '2025-02-28', tamanho: '3.5 MB' },
  ],
  c2: [
    { id: 'd4', titulo: 'Plano de Continuidade de Negócio', tipo: 'policy', estado: 'pending_review', versao: '2.0', descricao: 'BCP conforme requisitos NIS2 artigo 21.', atualizado: '2025-03-01', tamanho: '5.1 MB' },
    { id: 'd5', titulo: 'Contrato de Serviços de Cibersegurança', tipo: 'contract', estado: 'active', versao: '1.0', descricao: 'Contrato de prestação de serviços geridos de segurança.', atualizado: '2024-06-15', tamanho: '1.8 MB' },
  ],
  c3: [], c4: [],
};

const PENTESTS_DB = {
  c1: [
    { id: 'p1', tipo: 'external', estado: 'completed', agendado: '2025-01-15', concluido: '2025-01-28', findings: 12, critical: 1, high: 3, medium: 5, low: 3 },
    { id: 'p2', tipo: 'web', estado: 'in_progress', agendado: '2025-03-10', concluido: null, findings: 7, critical: 0, high: 2, medium: 3, low: 2 },
  ],
  c2: [{ id: 'p3', tipo: 'internal', estado: 'scheduled', agendado: '2025-04-05', concluido: null, findings: 0, critical: 0, high: 0, medium: 0, low: 0 }],
  c3: [], c4: [],
};

const INCIDENTES_DB = {
  c1: [
    { id: 'i1', titulo: 'Ransomware - Servidores de Ficheiros', severidade: 'critical', estado: 'resolved', descricao: 'Ataque de ransomware detetado nos servidores de ficheiros.', reportado: '2025-02-10', resolvido: '2025-02-12', reportadoPor: 'João Silva', nis2: true },
    { id: 'i3', titulo: 'Acesso Não Autorizado - VPN', severidade: 'medium', estado: 'open', descricao: 'Tentativas de acesso não autorizado via VPN detetadas nos logs.', reportado: '2025-03-15', resolvido: null, reportadoPor: 'João Silva', nis2: false },
    { id: 'i5', titulo: 'Vazamento de Credenciais', severidade: 'critical', estado: 'resolved', descricao: 'Credenciais encontradas em repositório público. Reset realizado.', reportado: '2025-01-05', resolvido: '2025-01-07', reportadoPor: 'João Silva', nis2: true },
  ],
  c2: [{ id: 'i2', titulo: 'Phishing Campaign - Executivos', severidade: 'high', estado: 'investigating', descricao: 'Campanha de phishing direcionada a executivos.', reportado: '2025-03-10', resolvido: null, reportadoPor: 'Ana Costa', nis2: false }],
  c3: [], c4: [],
};

const MENSAGENS_INICIAIS = {
  c1: [
    { id: 'm1', remetente: 'João Silva', isMe: true, conteudo: 'Bom dia, o relatório de pentest já está disponível para consulta.', timestamp: new Date(Date.now() - 259200000).toISOString() },
    { id: 'm2', remetente: 'Tech Corp Portugal', isMe: false, conteudo: 'Obrigado. Temos dúvidas sobre o item 3.2. Poderão agendar uma reunião?', timestamp: new Date(Date.now() - 172800000).toISOString() },
    { id: 'm3', remetente: 'João Silva', isMe: true, conteudo: 'Claro. Proponho quinta-feira às 10h00. Vou enviar o convite de calendário.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm4', remetente: 'Tech Corp Portugal', isMe: false, conteudo: 'Perfeito, quinta às 10h fica bem. Até lá!', timestamp: new Date(Date.now() - 72000000).toISOString() },
  ],
  c2: [], c3: [], c4: [],
};

const DOC_TIPO = { policy: 'Política', report: 'Relatório', contract: 'Contrato', audit: 'Auditoria', pentest: 'Pentest' };
const DOC_EST = { active: { label: 'Ativo', bg: '#dcfce7', cor: '#16a34a' }, expired: { label: 'Expirado', bg: '#fee2e2', cor: '#dc2626' }, pending_review: { label: 'Em revisão', bg: '#fef9c3', cor: '#ca8a04' } };
const SEV_CFG = { critical: { label: 'Crítico', dot: 'findings-bar-seg-critical', bg: '#fee2e2', cor: '#dc2626' }, high: { label: 'Alto', dot: 'findings-bar-seg-high', bg: '#ffedd5', cor: '#c2410c' }, medium: { label: 'Médio', dot: 'findings-bar-seg-medium', bg: '#fef9c3', cor: '#ca8a04' }, low: { label: 'Baixo', dot: 'findings-bar-seg-low', bg: '#dcfce7', cor: '#16a34a' } };
const INC_EST = { open: { label: 'Aberto', bg: '#fee2e2', cor: '#dc2626' }, investigating: { label: 'A investigar', bg: '#fef9c3', cor: '#ca8a04' }, resolved: { label: 'Resolvido', bg: '#dcfce7', cor: '#16a34a' }, closed: { label: 'Fechado', bg: '#f1f5f9', cor: '#64748b' } };
const PT_TIPO = { internal: 'Interno', external: 'Externo', web: 'Web', mobile: 'Mobile', social: 'Eng. Social' };
const PT_EST = { scheduled: { label: 'Agendado', bg: '#dbeafe', cor: '#2563eb' }, in_progress: { label: 'Em curso', bg: '#fef9c3', cor: '#ca8a04' }, completed: { label: 'Concluído', bg: '#dcfce7', cor: '#16a34a' }, report_sent: { label: 'Relatório enviado', bg: '#ede9fe', cor: '#7c3aed' } };

const RESUMO_KPIS = [
  { key: 'docs', label: 'Total de documentos', sub: (d, p, i, m) => `${d.filter(x => x.estado === 'active').length} ativos`, cardClass: 'resumo-kpi-azul', valClass: 'resumo-kpi-val-azul', Icone: FileText },
  { key: 'findings', label: 'Findings totais', sub: (d, p, i, m) => `${p.filter(x => x.critical > 0).length} com críticos`, cardClass: 'resumo-kpi-roxo', valClass: 'resumo-kpi-val-roxo', Icone: Shield },
  { key: 'inc', label: 'Incidentes totais', sub: (d, p, i, m) => `${i.filter(x => x.estado === 'open' || x.estado === 'investigating').length} abertos`, cardClass: 'resumo-kpi-laranja', valClass: 'resumo-kpi-val-laranja', Icone: AlertTriangle },
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

  const [clientes, setClientes] = useState(CLIENTES_DB);
  const [mensagens, setMensagens] = useState(MENSAGENS_INICIAIS);
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [confirmarEstado, setConfirmarEstado] = useState(false);
  const mensagensEndRef = useRef(null);

  const cliente = clientes.find((c) => c.id === clienteId);
  const docs = DOCUMENTOS_DB[clienteId] || [];
  const pentests = PENTESTS_DB[clienteId] || [];
  const incidentes = INCIDENTES_DB[clienteId] || [];
  const msgs = mensagens[clienteId] || [];

  const totalFindings = pentests.reduce((s, p) => s + p.findings, 0);
  const incAbertos = incidentes.filter((i) => i.estado === 'open' || i.estado === 'investigating').length;
  const pentestsAtivos = pentests.filter((p) => p.estado === 'in_progress').length;
  const docsAtivos = docs.filter((d) => d.estado === 'active').length;

  useEffect(() => {
    if (abaAtiva === 'comunicacao') {
      setTimeout(() => mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [abaAtiva, msgs.length]);

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim()) return;
    setMensagens((prev) => ({
      ...prev,
      [clienteId]: [...(prev[clienteId] || []), {
        id: `m${Date.now()}`,
        remetente: utilizador?.nome || 'Admin',
        isMe: true,
        conteudo: novaMensagem.trim(),
        timestamp: new Date().toISOString(),
      }],
    }));
    setNovaMensagem('');
  };

  const handleToggleAtivo = () => {
    setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, ativo: !c.ativo } : c));
    setConfirmarEstado(false);
  };

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

  const abas = [
    { id: 'resumo', label: 'Resumo', Icone: FileText, count: null },
    { id: 'documentos', label: 'Documentos', Icone: FileText, count: docs.length },
    { id: 'pentests', label: 'Pentests', Icone: Shield, count: pentests.length },
    { id: 'incidentes', label: 'Incidentes', Icone: AlertTriangle, count: incidentes.length },
    { id: 'comunicacao', label: 'Comunicação', Icone: MessageSquare, count: msgs.length },
  ];

  const resumoVals = {
    docs: docs.length,
    findings: totalFindings,
    inc: incidentes.length,
    msgs: msgs.length,
  };

  return (
    <AdminLayout>

      {confirmarEstado && (
        <div className="modal-overlay" onClick={() => setConfirmarEstado(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{cliente.ativo ? 'Desativar cliente?' : 'Ativar cliente?'}</h5>
              <button className="modal-close" onClick={() => setConfirmarEstado(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                {cliente.ativo
                  ? `"${cliente.nome}" ficará inativo e o acesso será suspenso.`
                  : `"${cliente.nome}" voltará a ter acesso ativo à plataforma.`}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setConfirmarEstado(false)}>Cancelar</button>
              <button
                className="btn-guardar"
                style={{ background: cliente.ativo ? '#ef4444' : '#16a34a' }}
                onClick={handleToggleAtivo}
              >
                {cliente.ativo ? 'Desativar' : 'Ativar'}
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
            style={{ backgroundColor: cliente.ativo ? cliente.cor : '#94a3b8' }}
          >
            {cliente.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h4 className="perfil-nome">{cliente.nome}</h4>
              <Pill bg={cliente.ativo ? '#dcfce7' : '#f1f5f9'} cor={cliente.ativo ? '#16a34a' : '#94a3b8'}>
                {cliente.ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {' '}{cliente.ativo ? 'Cliente ativo' : 'Inativo'}
              </Pill>
              <button
                className={`btn-toggle-estado ${cliente.ativo ? 'desativar' : 'ativar'}`}
                onClick={() => setConfirmarEstado(true)}
              >
                {cliente.ativo ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                {cliente.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-3">
              <span className="perfil-meta"><Mail size={12} /> {cliente.email}</span>
              <span className="perfil-meta"><Phone size={12} /> {cliente.telefone}</span>
              <span className="perfil-meta"><Calendar size={12} /> Cliente desde {cliente.criadoEm}</span>
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
                <div className="contacto-box contacto-box-seguranca">
                  <div className="contacto-icon contacto-icon-seguranca">
                    <Shield size={13} color="#2563eb" />
                  </div>
                  <div>
                    <p className="contacto-titulo">Resp. Segurança</p>
                    <p className="contacto-nome">{cliente.responsavelSeguranca.nome}</p>
                    <p className="contacto-detalhe">{cliente.responsavelSeguranca.email} · {cliente.responsavelSeguranca.telefone}</p>
                  </div>
                </div>
                <div className="contacto-box contacto-box-permanente">
                  <div className="contacto-icon contacto-icon-permanente">
                    <User size={13} color="#16a34a" />
                  </div>
                  <div>
                    <p className="contacto-titulo">Contacto Permanente</p>
                    <p className="contacto-nome">{cliente.contatoPermanente.nome}</p>
                    <p className="contacto-detalhe">{cliente.contatoPermanente.email} · {cliente.contatoPermanente.telefone}</p>
                  </div>
                </div>
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
                        const est = DOC_EST[doc.estado] || DOC_EST.active;
                        return (
                          <div key={doc.id} className="resumo-recente-item">
                            <FileText size={15} color="#3b82f6" />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <p className="incidente-nome text-truncate">{doc.titulo}</p>
                              <p className="incidente-data">v{doc.versao} · {doc.atualizado}</p>
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
                        const sev = SEV_CFG[inc.severidade] || SEV_CFG.medium;
                        const est = INC_EST[inc.estado] || INC_EST.open;
                        return (
                          <div key={inc.id} className="resumo-recente-item">
                            <div className={`incidente-dot ${sev.dot}`} />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <p className="incidente-nome text-truncate">{inc.titulo}</p>
                              <p className="incidente-data">{inc.reportado}</p>
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
                const est = DOC_EST[doc.estado] || DOC_EST.active;
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
                          <span className="perfil-item-meta"><Clock size={11} /> {doc.atualizado}</span>
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
                const sev = SEV_CFG[inc.severidade] || SEV_CFG.medium;
                const est = INC_EST[inc.estado] || INC_EST.open;
                return (
                  <div key={inc.id} className="perfil-item">
                    <div className="d-flex align-items-start gap-3">
                      <div className={`incidente-dot ${sev.dot}`} style={{ marginTop: 5 }} />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <p className="perfil-item-titulo">{inc.titulo}</p>
                          <Pill bg={sev.bg} cor={sev.cor}>{sev.label}</Pill>
                          <Pill bg={est.bg} cor={est.cor}>{est.label}</Pill>
                          {inc.nis2 && <Pill bg="#e0e7ff" cor="#4338ca"><Shield size={10} /> NIS2</Pill>}
                        </div>
                        <p className="incidente-data mb-2">{inc.descricao}</p>
                        <div className="d-flex flex-wrap gap-3">
                          <span className="perfil-item-meta"><Calendar size={11} /> Reportado: {inc.reportado}</span>
                          {inc.resolvido && <span className="perfil-item-meta" style={{ color: '#16a34a' }}><CheckCircle size={11} /> Resolvido: {inc.resolvido}</span>}
                          <span className="perfil-item-meta"><User size={11} /> {inc.reportadoPor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {abaAtiva === 'comunicacao' && (
            <div className="chat-wrapper">
              <div className="chat-mensagens">
                {msgs.length === 0 ? (
                  <div className="chat-vazio">
                    <MessageSquare size={40} color="#e2e8f0" className="mb-3" />
                    <p>Ainda não há mensagens com este cliente.</p>
                    <p>Inicie a conversa abaixo.</p>
                  </div>
                ) : msgs.map((msg) => (
                  <div key={msg.id} className={`mensagem-row ${msg.isMe ? 'minha' : ''}`}>
                    <div className="mensagem-avatar" style={{ background: msg.isMe ? '#2563eb' : '#94a3b8' }}>
                      {msg.remetente.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className={`mensagem-bubble-wrapper ${msg.isMe ? 'minha' : ''}`}>
                      <div className={`mensagem-bubble ${msg.isMe ? 'minha' : 'deles'}`}>
                        {msg.conteudo}
                      </div>
                      <div className={`mensagem-info ${msg.isMe ? 'mensagem-info-right' : ''}`}>
                        <span>{msg.remetente}</span>
                        <span>·</span>
                        <span>{timeAgo(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={mensagensEndRef} />
              </div>
              <div className="chat-input-area">
                <div className="chat-input-row">
                  <div className="chat-input-box">
                    <textarea
                      rows={2}
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleEnviarMensagem();
                        }
                      }}
                      placeholder="Escreva uma mensagem para o cliente..."
                    />
                  </div>
                  <button
                    className={`chat-send-btn ${novaMensagem.trim() ? 'ativo' : 'inativo'}`}
                    onClick={handleEnviarMensagem}
                    disabled={!novaMensagem.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="chat-hint">Enter para enviar · Shift+Enter para nova linha</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}

export default ClientePerfil;
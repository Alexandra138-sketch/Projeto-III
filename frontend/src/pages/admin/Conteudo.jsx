import { useState, useEffect } from 'react';
import {
  Save as SaveIcon,
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  CheckCircle as CheckCircleIcon,
  Globe as GlobeIcon,
  FileText as FileTextIcon,
  Sparkles as SparklesIcon,
  Mail as MailIcon,
  Newspaper as NewspaperIcon,
  Calendar as CalendarIcon,
  Inbox as InboxIcon,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';


const TABS = [
  { key: 'principal', label: 'Página Principal', icon: 'bi-stars' },
  { key: 'servicos', label: 'Serviços', icon: 'bi-globe2' },
  { key: 'noticias', label: 'Notícias', icon: 'bi-newspaper' },
  { key: 'contactos', label: 'Contactos', icon: 'bi-envelope' },
];

// Ícones disponíveis para escolher num serviço, com o gradiente que acompanha cada cartão
const ICONES_SERVICO = [
  { valor: 'bi-shield-lock', label: 'Escudo' },
  { valor: 'bi-exclamation-triangle', label: 'Alerta' },
  { valor: 'bi-clipboard-check', label: 'Auditoria' },
  { valor: 'bi-display', label: 'Monitor' },
  { valor: 'bi-phone', label: 'Telemóvel' },
  { valor: 'bi-cloud', label: 'Cloud' },
  { valor: 'bi-bug', label: 'Bug' },
  { valor: 'bi-lock', label: 'Cadeado' },
];

const SERVICOS_INICIAIS = [
  {
    id: 1,
    icone: 'bi-shield-lock',
    titulo: 'Testes de Penetração (Pentesting)',
    descricao:
      'Simulação de ataques reais para identificar vulnerabilidades na sua infraestrutura antes que os atacantes o façam.',
    badge: 'NIS2',
  },
  {
    id: 2,
    icone: 'bi-exclamation-triangle',
    titulo: 'Gestão de Incidentes NIS2',
    descricao:
      'Resposta rápida a incidentes de segurança com notificação às autoridades dentro dos prazos NIS2 (24h/72h).',
    badge: 'NIS2',
  },
  {
    id: 3,
    icone: 'bi-clipboard-check',
    titulo: 'Auditoria de Conformidade NIS2',
    descricao: 'Avaliação completa do estado de conformidade com a Diretiva NIS2 e elaboração de planos de ação.',
    badge: 'NIS2',
  },
  {
    id: 4,
    icone: 'bi-display',
    titulo: 'SIEM & Monitorização Contínua',
    descricao: 'Monitorização contínua de eventos de segurança com correlação avançada de ameaças.',
    badge: 'NIS2',
  },
  {
    id: 5,
    icone: 'bi-phone',
    titulo: 'Formação e Consciencialização',
    descricao: 'Programas de formação personalizados para aumentar a maturidade de segurança das suas equipas.',
    badge: '',
  },
  {
    id: 6,
    icone: 'bi-cloud',
    titulo: 'Segurança Cloud & DevSecOps',
    descricao: 'Proteção de ambientes cloud e integração de segurança no ciclo de desenvolvimento de software.',
    badge: '',
  },
];

const SERVICO_VAZIO = { icone: 'bi-shield-lock', titulo: '', descricao: '', badge: '' };

// --- Notícias ---
const NOTICIAS_HERO_INICIAL = {
  titulo: 'Notícias de Cibersegurança',
  subtitulo:
    'Mantenha-se informado sobre as últimas tendências, ameaças e boas práticas em segurança digital e conformidade regulamentar.',
};

// Começa vazio — preenchido pela API
const ARTIGOS_INICIAIS = [];

const ARTIGO_VAZIO = {
  categoria: '',
  titulo: '',
  resumo: '',
  dataPublicacao: '',
  tempoLeitura: '',
  imagem: '',
  publicado: true,
};

const formatarDataPt = (isoDate) => {
  if (!isoDate) return '';
  const [ano, mes, dia] = isoDate.split('-');
  if (!ano || !mes || !dia) return isoDate;
  return `${dia}/${mes}/${ano}`;
};

// --- Contactos ---
const CONTACTOS_CABECALHO_INICIAL = {
  titulo: 'Fale Connosco',
  subtitulo: 'Fale com os nossos especialistas em cibersegurança. Resposta garantida em 24 horas.',
};

const CONTACTOS_INFO_INICIAL = {
  email: 'info@cyberboxsecur.pt',
  telefone: '+351 210 000 000',
  morada: 'Av. da Liberdade, 100\n1250-001 Lisboa, Portugal',
  horario: 'Seg–Sex: 9h–18h\nSOC: 24/7/365',
  numeroSoc: '+351 800 000 SOC',
};

const CONTACTOS_FORMULARIO_INICIAL = {
  titulo: 'Envie-nos uma Mensagem',
  mensagemSucesso: 'Obrigado pelo seu contacto. A nossa equipa responderá em menos de 24 horas.',
};

function Conteudo() {
  const [tabAtiva, setTabAtiva] = useState('principal');

  const [hero, setHero] = useState({
    titulo: 'Segurança Digital para um Mundo Conectado',
    subtitulo:
      'Proteja a sua empresa contra ameaças digitais e garanta conformidade com as diretivas europeias de cibersegurança.',
  });

  const [servicosHeader, setServicosHeader] = useState({
    titulo: 'Serviços Especializados',
    subtitulo: 'Soluções completas para elevar a segurança e conformidade da sua empresa',
  });

  const [aGuardar, setAGuardar] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // IDs dos registos da BD para a página principal (para guardar via API)
  const [heroId,    setHeroId]    = useState(null);
  const [servicosId, setServicosId] = useState(null);

  // Mensagens recebidas pelo formulário de contacto
  const [mensagens,        setMensagens]        = useState([]);
  const [carregandoMsgs,   setCarregandoMsgs]   = useState(false);

  // ── Carregar conteúdo da página principal da BD ──
  useEffect(() => {
    api.get('/conteudo/admin')
      .then(({ data }) => {
        if (!Array.isArray(data)) return;
        // Filtrar registos da página 'principal'
        const principal = data.filter(c => c.pagina === 'principal');
        principal.forEach(c => {
          if (c.seccao === 'hero') {
            setHero({ titulo: c.titulo || '', subtitulo: c.subtitulo || '' });
            setHeroId(c.id);
          }
          if (c.seccao === 'servicos_header') {
            setServicosHeader({ titulo: c.titulo || '', subtitulo: c.subtitulo || '' });
            setServicosId(c.id);
          }
        });
      })
      .catch(() => {}); // se falhar, usa os valores iniciais locais
  }, []);

  // ── Carregar artigos da BD quando a aba de notícias está activa ──
  useEffect(() => {
    if (tabAtiva !== 'noticias') return;
    api.get('/noticias')
      .then(({ data }) => {
        if (!Array.isArray(data)) return;
        // Mapear campos da BD para os campos usados no formulário
        const mapeados = data.map(n => ({
          id:             n.id,
          categoria:      n.categoria      || '',
          titulo:         n.titulo         || '',
          resumo:         n.resumo         || '',
          dataPublicacao: n.created_at     ? n.created_at.slice(0, 10) : '',
          tempoLeitura:   n.tempo_leitura  || '',
          imagem:         n.imagem_url     || '',
          publicado:      Boolean(n.ativo),
        }));
        setArtigos(mapeados);
      })
      .catch(() => {});
  }, [tabAtiva]);

  // ── Carregar mensagens recebidas quando a aba de contactos está activa ──
  useEffect(() => {
    if (tabAtiva !== 'contactos') return;
    setCarregandoMsgs(true);
    api.get('/contactos')
      .then(({ data }) => setMensagens(Array.isArray(data) ? data : []))
      .catch(() => setMensagens([]))
      .finally(() => setCarregandoMsgs(false));
  }, [tabAtiva]);

  // --- Gestão de Serviços ---
  const [servicos, setServicos] = useState(SERVICOS_INICIAIS);
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null); // null = a criar; objeto = a editar
  const [formServico, setFormServico] = useState(SERVICO_VAZIO);
  const [servicoAEliminar, setServicoAEliminar] = useState(null);

  const abrirNovoServico = () => {
    setServicoEmEdicao(null);
    setFormServico(SERVICO_VAZIO);
    setModalAberto(true);
  };

  const abrirEditarServico = (servico) => {
    setServicoEmEdicao(servico);
    setFormServico({
      icone: servico.icone,
      titulo: servico.titulo,
      descricao: servico.descricao,
      badge: servico.badge || '',
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setServicoEmEdicao(null);
    setFormServico(SERVICO_VAZIO);
  };

  const handleFormServicoChange = (campo) => (e) => {
    setFormServico((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const guardarServico = (e) => {
    e.preventDefault();
    if (!formServico.titulo.trim() || !formServico.descricao.trim()) return;

    if (servicoEmEdicao) {
      setServicos((prev) =>
        prev.map((s) => (s.id === servicoEmEdicao.id ? { ...s, ...formServico } : s))
      );
    } else {
      const novoId = servicos.length > 0 ? Math.max(...servicos.map((s) => s.id)) + 1 : 1;
      setServicos((prev) => [...prev, { id: novoId, ...formServico }]);
    }
    fecharModal();
  };

  const confirmarEliminar = (servico) => setServicoAEliminar(servico);
  const cancelarEliminar = () => setServicoAEliminar(null);
  const eliminarServico = () => {
    setServicos((prev) => prev.filter((s) => s.id !== servicoAEliminar.id));
    setServicoAEliminar(null);
  };

  // --- Notícias ---
  const [noticiasHero, setNoticiasHero] = useState(NOTICIAS_HERO_INICIAL);
  const [artigos, setArtigos] = useState(ARTIGOS_INICIAIS);
  const [modalArtigoAberto, setModalArtigoAberto] = useState(false);
  const [artigoEmEdicao, setArtigoEmEdicao] = useState(null); // null = a criar
  const [formArtigo, setFormArtigo] = useState(ARTIGO_VAZIO);
  const [artigoAEliminar, setArtigoAEliminar] = useState(null);

  const handleNoticiasHeroChange = (campo) => (e) => {
    setNoticiasHero((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const abrirNovoArtigo = () => {
    setArtigoEmEdicao(null);
    setFormArtigo(ARTIGO_VAZIO);
    setModalArtigoAberto(true);
  };

  const abrirEditarArtigo = (artigo) => {
    setArtigoEmEdicao(artigo);
    setFormArtigo({
      categoria: artigo.categoria,
      titulo: artigo.titulo,
      resumo: artigo.resumo,
      dataPublicacao: artigo.dataPublicacao,
      tempoLeitura: artigo.tempoLeitura,
      imagem: artigo.imagem,
      publicado: artigo.publicado,
    });
    setModalArtigoAberto(true);
  };

  const fecharModalArtigo = () => {
    setModalArtigoAberto(false);
    setArtigoEmEdicao(null);
    setFormArtigo(ARTIGO_VAZIO);
  };

  const handleFormArtigoChange = (campo) => (e) => {
    const valor = campo === 'publicado' ? e.target.checked : e.target.value;
    setFormArtigo((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleImagemArtigoSelecionada = (e) => {
    const ficheiro = e.target.files && e.target.files[0];
    if (!ficheiro) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      setFormArtigo((prev) => ({ ...prev, imagem: leitor.result }));
    };
    leitor.readAsDataURL(ficheiro);
  };

  const guardarArtigo = async (e) => {
    e.preventDefault();
    if (!formArtigo.titulo.trim() || !formArtigo.resumo.trim()) return;

    // Mapear campos do formulário para os campos esperados pela BD
    const dadosApi = {
      titulo:       formArtigo.titulo,
      resumo:       formArtigo.resumo,
      categoria:    formArtigo.categoria,
      imagem_url:   formArtigo.imagem,
      tempo_leitura: formArtigo.tempoLeitura,
      ativo:        formArtigo.publicado,
    };

    try {
      if (artigoEmEdicao) {
        // Editar artigo existente
        const { data } = await api.put(`/noticias/update/${artigoEmEdicao.id}`, dadosApi);
        setArtigos(prev => prev.map(a => a.id === data.id ? {
          ...a, ...formArtigo, id: data.id,
        } : a));
      } else {
        // Criar novo artigo
        const { data } = await api.post('/noticias/create', dadosApi);
        setArtigos(prev => [...prev, {
          id:             data.id,
          categoria:      data.categoria      || '',
          titulo:         data.titulo         || '',
          resumo:         data.resumo         || '',
          dataPublicacao: data.created_at     ? data.created_at.slice(0, 10) : '',
          tempoLeitura:   data.tempo_leitura  || '',
          imagem:         data.imagem_url     || '',
          publicado:      Boolean(data.ativo),
        }]);
      }
      fecharModalArtigo();
    } catch {
      alert('Erro ao guardar o artigo. Verifica a ligação ao servidor.');
    }
  };

  const confirmarEliminarArtigo = (artigo) => setArtigoAEliminar(artigo);
  const cancelarEliminarArtigo = () => setArtigoAEliminar(null);
  const eliminarArtigo = async () => {
    try {
      await api.delete(`/noticias/delete/${artigoAEliminar.id}`);
      setArtigos(prev => prev.filter(a => a.id !== artigoAEliminar.id));
      setArtigoAEliminar(null);
    } catch {
      alert('Erro ao eliminar o artigo.');
    }
  };

  // --- Contactos ---
  const [contactosCabecalho, setContactosCabecalho] = useState(CONTACTOS_CABECALHO_INICIAL);
  const [contactosInfo, setContactosInfo] = useState(CONTACTOS_INFO_INICIAL);
  const [contactosFormulario, setContactosFormulario] = useState(CONTACTOS_FORMULARIO_INICIAL);

  const handleContactosCabecalhoChange = (campo) => (e) => {
    setContactosCabecalho((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleContactosInfoChange = (campo) => (e) => {
    setContactosInfo((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleContactosFormularioChange = (campo) => (e) => {
    setContactosFormulario((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  // ── Marcar mensagem recebida como lida/não lida ──
  const toggleLido = async (id) => {
    try {
      const { data } = await api.put(`/contactos/lido/${id}`);
      setMensagens(prev => prev.map(m => m.id === data.id ? data : m));
    } catch {
      alert('Erro ao atualizar mensagem.');
    }
  };

  // ── Eliminar mensagem recebida ──
  const eliminarMensagem = async (id) => {
    if (!window.confirm('Eliminar esta mensagem de contacto?')) return;
    try {
      await api.delete(`/contactos/delete/${id}`);
      setMensagens(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Erro ao eliminar mensagem.');
    }
  };

  const handleHeroChange = (campo) => (e) => {
    setHero((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleServicosHeaderChange = (campo) => (e) => {
    setServicosHeader((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleGuardarTodas = async () => {
    setAGuardar(true);
    setGuardado(false);
    try {
      // Guardar hero e servicos_header na BD se tivermos os IDs
      const promessas = [];
      if (heroId)     promessas.push(api.put(`/conteudo/update/${heroId}`,     hero));
      if (servicosId) promessas.push(api.put(`/conteudo/update/${servicosId}`, servicosHeader));
      await Promise.all(promessas);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch {
      alert('Erro ao guardar. Verifica a ligação ao servidor.');
    } finally {
      setAGuardar(false);
    }
  };


  // Ícones Lucide para os tabs (como no Figma Make)
  const TAB_ICONS = {
    principal: <SparklesIcon size={16} />,
    servicos:  <GlobeIcon size={16} />,
    noticias:  <NewspaperIcon size={16} />,
    contactos: <MailIcon size={16} />,
  };

  return (
    <AdminLayout>

        {/* Cabeçalho — mesmo estilo usado em Logs de Atividade / Incidentes */}
        <div className="incidentes-header">
          <div>
            <h4 className="incidentes-titulo">Gestão de Conteúdo do Site</h4>
            <p className="incidentes-subtitulo">
              Edite os textos e conteúdos exibidos nas páginas públicas
            </p>
          </div>
          {/* Mensagem de guardado com sucesso */}
          {guardado && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 small fw-medium"
              style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
            >
              <CheckCircleIcon size={16} /> Alterações guardadas com sucesso!
            </div>
          )}
        </div>

        {/* Tabs — cartão branco com abas, no mesmo espírito da barra de filtros dos Logs */}
        <div className="dash-card filtros-bar">
          <div className="d-flex gap-1 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTabAtiva(tab.key)}
                className="btn d-flex align-items-center gap-2 px-3 py-2"
                style={{
                  borderRadius: 8,
                  border: tabAtiva === tab.key ? '1px solid #93c5fd' : '1px solid transparent',
                  backgroundColor: tabAtiva === tab.key ? '#eff6ff' : 'transparent',
                  color: tabAtiva === tab.key ? '#2563eb' : '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: tabAtiva === tab.key ? 600 : 500,
                  transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
                }}
              >
                {TAB_ICONS[tab.key]}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: Página Principal ── */}
        {tabAtiva === 'principal' && (
          <div className="d-flex flex-column gap-4">

            {/* Secção Hero */}
            <div className="dash-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                      style={{ width: 32, height: 32, backgroundColor: '#ede9fe', color: '#7c3aed' }}
                    >
                      <SparklesIcon size={15} />
                    </span>
                    <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>
                      Secção Hero (Topo da Página)
                    </h5>
                  </div>
                  <p className="text-secondary small mb-0 ms-1">
                    O primeiro conteúdo que os visitantes veem ao entrar no site
                  </p>
                </div>
                <a href="/" target="_blank" rel="noopener noreferrer"
                  className="d-flex align-items-center gap-1 text-primary text-decoration-none small">
                  <EyeIcon size={14} /> Pré-visualizar
                </a>
              </div>

              <div className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Título Principal
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      (aparece em destaque no topo)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem' }}
                    value={hero.titulo}
                    onChange={handleHeroChange('titulo')}
                  />
                </div>
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Subtítulo
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      (texto explicativo abaixo do título)
                    </span>
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={3}
                    value={hero.subtitulo}
                    onChange={handleHeroChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Secção de Serviços */}
            <div className="dash-card">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: '#dbeafe', color: '#2563eb' }}
                >
                  <GlobeIcon size={15} />
                </span>
                <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>Secção de Serviços</h5>
              </div>
              <p className="text-secondary small mb-3 ms-1">
                Cabeçalho da área onde os serviços são apresentados
              </p>

              <div className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Título da Secção
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      (aparece antes da lista de serviços)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem' }}
                    value={servicosHeader.titulo}
                    onChange={handleServicosHeaderChange('titulo')}
                  />
                </div>
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Subtítulo da Secção
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      (descrição breve dos serviços)
                    </span>
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={2}
                    value={servicosHeader.subtitulo}
                    onChange={handleServicosHeaderChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Botão Guardar */}
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                style={{ fontSize: '0.875rem' }}
                onClick={handleGuardarTodas}
                disabled={aGuardar}
              >
                {aGuardar
                  ? <><span className="spinner-border spinner-border-sm" role="status"></span> A guardar...</>
                  : <><SaveIcon size={16} /> Guardar Todas as Alterações</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Serviços ── */}
        {tabAtiva === 'servicos' && (
          <div className="d-flex flex-column gap-4">
            {/* Banner informativo */}
            <div
              className="d-flex flex-wrap justify-content-between align-items-center gap-3 rounded-3 p-3"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <p className="mb-0 small" style={{ color: '#1e40af', flex: 1 }}>
                <strong>Gestão de Serviços:</strong> Adicione, edite ou remova serviços exibidos na
                página principal. Cada serviço aparece como um cartão com ícone, título e descrição.
              </p>
              {!modalAberto && (
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2 rounded-3 flex-shrink-0"
                  style={{ fontSize: '0.875rem' }}
                  onClick={abrirNovoServico}
                >
                  <PlusIcon size={16} /> Novo Serviço
                </button>
              )}
            </div>

            {/* Grid de serviços */}
            <div className="row g-3">
              {servicos.map((servico) => (
                <div className="col-12 col-md-6" key={servico.id}>
                  <div className="bg-white rounded-3 p-4 h-100"
                    style={{ border: '1px solid #e5e7eb', transition: 'border-color 0.15s' }}>
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div className="d-flex align-items-start gap-3 flex-1">
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                          style={{
                            width: 40, height: 40,
                            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                            color: '#fff',
                          }}
                        >
                          <i className={`bi ${servico.icone}`}></i>
                        </span>
                        <div className="flex-1" style={{ minWidth: 0 }}>
                          <h6 className="fw-semibold mb-1" style={{ color: '#111827' }}>
                            {servico.titulo}
                          </h6>
                          <p className="text-secondary mb-0 small"
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {servico.descricao}
                          </p>
                        </div>
                      </div>
                      {servico.badge && (
                        <span
                          className="badge rounded-pill flex-shrink-0"
                          style={{ backgroundColor: '#f3e8fd', color: '#7c3aed', fontSize: '0.7rem' }}
                        >
                          {servico.badge}
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none fw-medium flex-1 text-center"
                        style={{ color: '#2563eb', fontSize: '0.875rem' }}
                        onClick={() => abrirEditarServico(servico)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded-2"
                        style={{ color: '#dc2626', fontSize: '0.875rem', backgroundColor: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => confirmarEliminar(servico)}
                      >
                        <Trash2Icon size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {servicos.length === 0 && (
                <div className="col-12 text-center text-secondary py-5 small">
                  Ainda não existem serviços. Clica em "Novo Serviço" para adicionar o primeiro.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Notícias ── */}
        {tabAtiva === 'noticias' && (
          <div className="d-flex flex-column gap-4">

            {/* Hero notícias */}
            <div className="dash-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                      style={{ width: 32, height: 32, backgroundColor: '#ede9fe', color: '#7c3aed' }}
                    >
                      <SparklesIcon size={15} />
                    </span>
                    <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>
                      Secção Hero (Topo da Página)
                    </h5>
                  </div>
                  <p className="text-secondary small mb-0 ms-1">
                    O primeiro conteúdo que os visitantes veem na página de notícias
                  </p>
                </div>
                <a href="/noticias" target="_blank" rel="noopener noreferrer"
                  className="d-flex align-items-center gap-1 text-primary text-decoration-none small">
                  <EyeIcon size={14} /> Pré-visualizar
                </a>
              </div>

              <div className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Título Principal
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      (aparece em destaque no topo)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem' }}
                    value={noticiasHero.titulo}
                    onChange={handleNoticiasHeroChange('titulo')}
                  />
                </div>
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Subtítulo
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                      (texto explicativo abaixo do título)
                    </span>
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={3}
                    value={noticiasHero.subtitulo}
                    onChange={handleNoticiasHeroChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Gestão de artigos */}
            <div
              className="d-flex flex-wrap justify-content-between align-items-center gap-3 rounded-3 p-3"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <p className="mb-0 small" style={{ color: '#1e40af', flex: 1 }}>
                <strong>Gestão de Artigos:</strong> Adicione, edite ou remova artigos exibidos na
                página de notícias. Cada artigo aparece com título, resumo e imagem.
              </p>
              {!modalArtigoAberto && (
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2 rounded-3 flex-shrink-0"
                  style={{ fontSize: '0.875rem' }}
                  onClick={abrirNovoArtigo}
                >
                  <PlusIcon size={16} /> Novo Artigo
                </button>
              )}
            </div>

            {/* Grid de artigos */}
            <div className="row g-3">
              {artigos.map((artigo) => (
                <div className="col-12 col-md-6 col-lg-4" key={artigo.id}>
                  <div className="bg-white rounded-3 overflow-hidden h-100" style={{ border: '1px solid #e5e7eb' }}>
                    <div
                      style={{
                        height: 160,
                        backgroundImage: `url(${artigo.imagem})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#f1f5f9',
                      }}
                    />
                    <div className="p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                        {artigo.categoria && (
                          <span className="badge rounded-pill"
                            style={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontSize: '0.7rem' }}>
                            {artigo.categoria}
                          </span>
                        )}
                        <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                          <CalendarIcon size={12} /> {formatarDataPt(artigo.dataPublicacao)}
                        </span>
                      </div>
                      <h6 className="fw-semibold mb-1" style={{ color: '#111827', fontSize: '0.875rem' }}>
                        {artigo.titulo}
                      </h6>
                      <p className="text-secondary mb-3 flex-grow-1"
                        style={{
                          fontSize: '0.75rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                        {artigo.resumo}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3"
                        style={{ fontSize: '0.75rem' }}>
                        <span className="text-secondary">{artigo.tempoLeitura}</span>
                        <span style={{ color: artigo.publicado ? '#16a34a' : '#d97706', fontWeight: 500 }}>
                          {artigo.publicado ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-medium flex-1 text-center"
                          style={{ color: '#2563eb', fontSize: '0.875rem' }}
                          onClick={() => abrirEditarArtigo(artigo)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded-2"
                          style={{ color: '#dc2626', fontSize: '0.875rem', backgroundColor: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => confirmarEliminarArtigo(artigo)}
                        >
                          <Trash2Icon size={14} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {artigos.length === 0 && (
                <div className="col-12 text-center text-secondary py-5 small">
                  Ainda não existem artigos. Clica em "Novo Artigo" para adicionar o primeiro.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Contactos ── */}
        {tabAtiva === 'contactos' && (
          <div className="d-flex flex-column gap-4">

            {/* Cabeçalho da Página */}
            <div className="dash-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                      style={{ width: 32, height: 32, backgroundColor: '#dbeafe', color: '#2563eb' }}
                    >
                      <MailIcon size={15} />
                    </span>
                    <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>Cabeçalho da Página</h5>
                  </div>
                  <p className="text-secondary small mb-0 ms-1">Textos principais da página de contactos</p>
                </div>
                <a href="/contacto" target="_blank" rel="noopener noreferrer"
                  className="d-flex align-items-center gap-1 text-primary text-decoration-none small">
                  <EyeIcon size={14} /> Pré-visualizar
                </a>
              </div>
              <div className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Título Principal
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem' }}
                    value={contactosCabecalho.titulo}
                    onChange={handleContactosCabecalhoChange('titulo')}
                  />
                </div>
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Subtítulo
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={2}
                    value={contactosCabecalho.subtitulo}
                    onChange={handleContactosCabecalhoChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Informações de Contacto */}
            <div className="dash-card">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: '#dcfce7', color: '#16a34a' }}
                >
                  <MailIcon size={15} />
                </span>
                <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>Informações de Contacto</h5>
              </div>
              <p className="text-secondary small mb-3 ms-1">Dados exibidos na barra lateral da página</p>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>E-mail</label>
                  <input type="email" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                    value={contactosInfo.email} onChange={handleContactosInfoChange('email')} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Telefone</label>
                  <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                    value={contactosInfo.telefone} onChange={handleContactosInfoChange('telefone')} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Morada</label>
                  <textarea className="form-control rounded-3" style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={2} value={contactosInfo.morada} onChange={handleContactosInfoChange('morada')} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Horário</label>
                  <textarea className="form-control rounded-3" style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={2} value={contactosInfo.horario} onChange={handleContactosInfoChange('horario')} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Número SOC
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>(Security Operations Center)</span>
                  </label>
                  <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                    value={contactosInfo.numeroSoc} onChange={handleContactosInfoChange('numeroSoc')} />
                </div>
              </div>
            </div>

            {/* Formulário de Contacto */}
            <div className="dash-card">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: '#ede9fe', color: '#7c3aed' }}
                >
                  <FileTextIcon size={15} />
                </span>
                <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>Formulário de Contacto</h5>
              </div>
              <p className="text-secondary small mb-3 ms-1">Textos do formulário de envio de mensagens</p>

              <div className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Título do Formulário
                  </label>
                  <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                    value={contactosFormulario.titulo}
                    onChange={handleContactosFormularioChange('titulo')} />
                </div>
                <div>
                  <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Mensagem de Sucesso
                    <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>(exibida após envio)</span>
                  </label>
                  <textarea className="form-control rounded-3" style={{ fontSize: '0.875rem', resize: 'none' }}
                    rows={2} value={contactosFormulario.mensagemSucesso}
                    onChange={handleContactosFormularioChange('mensagemSucesso')} />
                </div>
              </div>
            </div>

            {/* Mensagens Recebidas */}
            <div className="dash-card">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: '#fef9c3', color: '#a16207' }}
                >
                  <InboxIcon size={15} />
                </span>
                <h5 className="fw-semibold mb-0" style={{ color: '#111827' }}>
                  Mensagens Recebidas
                  {mensagens.filter(m => !m.lido).length > 0 && (
                    <span className="badge rounded-pill ms-2"
                      style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.7rem' }}>
                      {mensagens.filter(m => !m.lido).length} novas
                    </span>
                  )}
                </h5>
              </div>
              <p className="text-secondary small mb-3 ms-1">
                Mensagens enviadas pelo formulário de contacto do site
              </p>

              {carregandoMsgs ? (
                <p className="text-secondary small">A carregar mensagens…</p>
              ) : mensagens.length === 0 ? (
                <p className="text-center text-secondary small py-3">Ainda não há mensagens recebidas.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {mensagens.map(msg => (
                    <div
                      key={msg.id}
                      className="rounded-3 p-3"
                      style={{
                        backgroundColor: msg.lido ? '#f8fafc' : '#eff6ff',
                        border: msg.lido ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <MailIcon size={14} style={{ color: msg.lido ? '#94a3b8' : '#2563eb' }} />
                            <span className="fw-semibold small">{msg.nome}</span>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{msg.email}</span>
                            {!msg.lido && (
                              <span className="badge rounded-pill"
                                style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.7rem' }}>
                                Não lida
                              </span>
                            )}
                          </div>
                          {msg.assunto && (
                            <p className="fw-medium mb-1 small" style={{ color: '#374151' }}>{msg.assunto}</p>
                          )}
                          <p className="mb-1 small" style={{ color: '#4a5565' }}>{msg.mensagem}</p>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.7rem' }}>
                            {new Date(msg.created_at).toLocaleString('pt-PT')}
                            {msg.telefone && ` · ${msg.telefone}`}
                          </p>
                        </div>
                        <div className="d-flex gap-2 flex-shrink-0">
                          <button type="button" className="btn btn-link p-0 text-decoration-none"
                            title={msg.lido ? 'Marcar como não lida' : 'Marcar como lida'}
                            onClick={() => toggleLido(msg.id)}>
                            {msg.lido
                              ? <EyeOffIcon size={16} style={{ color: '#2563eb' }} />
                              : <CheckCircleIcon size={16} style={{ color: '#2563eb' }} />
                            }
                          </button>
                          <button type="button" className="btn btn-link p-0 text-decoration-none"
                            title="Eliminar mensagem"
                            onClick={() => eliminarMensagem(msg.id)}>
                            <Trash2Icon size={16} style={{ color: '#dc2626' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botão Guardar */}
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                style={{ fontSize: '0.875rem' }}
                onClick={handleGuardarTodas}
                disabled={aGuardar}
              >
                {aGuardar
                  ? <><span className="spinner-border spinner-border-sm" role="status"></span> A guardar...</>
                  : <><SaveIcon size={16} /> Guardar Todas as Alterações</>
                }
              </button>
            </div>
          </div>
        )}

      {/* Modal: Criar / Editar Serviço */}
      {modalAberto && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow">
                <form onSubmit={guardarServico}>
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-semibold" style={{ color: '#111827' }}>
                      {servicoEmEdicao ? 'Editar Serviço' : 'Novo Serviço'}
                    </h5>
                    <button type="button" className="btn-close" onClick={fecharModal} aria-label="Fechar"></button>
                  </div>
                  <div className="modal-body pt-3">
                    <div className="mb-3">
                      <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Título</label>
                      <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                        placeholder="Ex.: Testes de Penetração (Pentesting)"
                        value={formServico.titulo} onChange={handleFormServicoChange('titulo')}
                        required autoFocus />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Descrição</label>
                      <textarea className="form-control rounded-3" style={{ fontSize: '0.875rem', resize: 'none' }}
                        rows={3} placeholder="Breve descrição do serviço"
                        value={formServico.descricao} onChange={handleFormServicoChange('descricao')} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Ícone</label>
                      <select className="form-select rounded-3" style={{ fontSize: '0.875rem' }}
                        value={formServico.icone} onChange={handleFormServicoChange('icone')}>
                        {ICONES_SERVICO.map((opt) => (
                          <option key={opt.valor} value={opt.valor}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>
                        Etiqueta / Badge
                        <span className="fw-normal text-secondary ms-2" style={{ fontSize: '0.75rem' }}>(opcional, ex.: NIS2)</span>
                      </label>
                      <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                        placeholder="Ex.: NIS2" value={formServico.badge}
                        onChange={handleFormServicoChange('badge')} />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={fecharModal}>Cancelar</button>
                    <button type="submit" className="btn btn-primary rounded-3 d-flex align-items-center gap-2">
                      <SaveIcon size={15} />
                      {servicoEmEdicao ? 'Guardar Alterações' : 'Adicionar Serviço'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

      {/* Modal: Confirmar Eliminação Serviço */}
      {servicoAEliminar && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-semibold" style={{ color: '#111827' }}>Eliminar Serviço</h5>
                  <button type="button" className="btn-close" onClick={cancelarEliminar} aria-label="Fechar"></button>
                </div>
                <div className="modal-body" style={{ fontSize: '0.9rem' }}>
                  Tens a certeza que queres eliminar{' '}
                  <strong>"{servicoAEliminar.titulo}"</strong>? Esta ação não pode ser desfeita.
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-3" onClick={cancelarEliminar}>Cancelar</button>
                  <button type="button" className="btn btn-danger rounded-3 d-flex align-items-center gap-2" onClick={eliminarServico}>
                    <Trash2Icon size={15} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

      {/* Modal: Criar / Editar Artigo */}
      {modalArtigoAberto && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-3 border-0 shadow">
                <form onSubmit={guardarArtigo}>
                  <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-semibold" style={{ color: '#111827' }}>
                      {artigoEmEdicao ? 'Editar Artigo' : 'Novo Artigo'}
                    </h5>
                    <button type="button" className="btn-close" onClick={fecharModalArtigo} aria-label="Fechar"></button>
                  </div>
                  <div className="modal-body pt-3">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Categoria</label>
                        <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                          placeholder="Ex.: NIS2 & Compliance"
                          value={formArtigo.categoria} onChange={handleFormArtigoChange('categoria')} autoFocus />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Título do Artigo</label>
                        <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                          placeholder="Ex.: NIS2: O que muda para as empresas portuguesas"
                          value={formArtigo.titulo} onChange={handleFormArtigoChange('titulo')} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Resumo</label>
                        <textarea className="form-control rounded-3" style={{ fontSize: '0.875rem', resize: 'none' }}
                          rows={3} placeholder="Breve resumo do artigo"
                          value={formArtigo.resumo} onChange={handleFormArtigoChange('resumo')} required />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Data de Publicação</label>
                        <input type="date" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                          value={formArtigo.dataPublicacao} onChange={handleFormArtigoChange('dataPublicacao')} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Tempo de Leitura</label>
                        <input type="text" className="form-control rounded-3" style={{ fontSize: '0.875rem' }}
                          placeholder="Ex.: 5 min"
                          value={formArtigo.tempoLeitura} onChange={handleFormArtigoChange('tempoLeitura')} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium mb-1" style={{ fontSize: '0.875rem', color: '#374151' }}>Imagem de Capa</label>
                        <input type="file" accept="image/*" className="form-control rounded-3"
                          style={{ fontSize: '0.875rem' }} onChange={handleImagemArtigoSelecionada} />
                        {formArtigo.imagem && (
                          <div className="mt-2 rounded-3 overflow-hidden" style={{ height: 80, width: 120 }}>
                            <img src={formArtigo.imagem} alt="preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <div className="rounded-3 p-3 d-flex align-items-start gap-2"
                          style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                          <input type="checkbox" className="form-check-input mt-0" id="artigoPublicado"
                            style={{ accentColor: '#7c3aed' }}
                            checked={formArtigo.publicado} onChange={handleFormArtigoChange('publicado')} />
                          <label className="form-check-label fw-medium" htmlFor="artigoPublicado"
                            style={{ color: '#6b21a8', fontSize: '0.875rem' }}>
                            Artigo Publicado
                            <span className="d-block fw-normal" style={{ color: '#9333ea', fontSize: '0.75rem' }}>
                              Ao ativar, o artigo será visível na página de notícias
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={fecharModalArtigo}>Cancelar</button>
                    <button type="submit" className="btn btn-primary rounded-3 d-flex align-items-center gap-2">
                      <SaveIcon size={15} />
                      {artigoEmEdicao ? 'Guardar Alterações' : 'Adicionar Artigo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

      {/* Modal: Confirmar Eliminação Artigo */}
      {artigoAEliminar && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-semibold" style={{ color: '#111827' }}>Eliminar Artigo</h5>
                  <button type="button" className="btn-close" onClick={cancelarEliminarArtigo} aria-label="Fechar"></button>
                </div>
                <div className="modal-body" style={{ fontSize: '0.9rem' }}>
                  Tens a certeza que queres eliminar{' '}
                  <strong>"{artigoAEliminar.titulo}"</strong>? Esta ação não pode ser desfeita.
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-3" onClick={cancelarEliminarArtigo}>Cancelar</button>
                  <button type="button" className="btn btn-danger rounded-3 d-flex align-items-center gap-2" onClick={eliminarArtigo}>
                    <Trash2Icon size={15} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

    </AdminLayout>
  );
}

export default Conteudo;
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
// SweetAlert2 — biblioteca de alertas/confirmações ensinada nas aulas
import Swal from 'sweetalert2';

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
  // (servicoAEliminar já não é necessário — confirmação feita via SweetAlert2)

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

  // Confirma com SweetAlert2 antes de eliminar o serviço (padrão ensinado nas aulas)
  const confirmarEliminar = (servico) => {
    Swal.fire({
      title: 'Tens a certeza?',
      text: `Vais eliminar o serviço "${servico.titulo}". Esta ação não pode ser desfeita!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setServicos((prev) => prev.filter((s) => s.id !== servico.id));
        Swal.fire('Eliminado!', 'O serviço foi removido.', 'success');
      }
    });
  };

  // --- Notícias ---
  const [noticiasHero, setNoticiasHero] = useState(NOTICIAS_HERO_INICIAL);
  const [artigos, setArtigos] = useState(ARTIGOS_INICIAIS);
  const [modalArtigoAberto, setModalArtigoAberto] = useState(false);
  const [artigoEmEdicao, setArtigoEmEdicao] = useState(null); // null = a criar
  const [formArtigo, setFormArtigo] = useState(ARTIGO_VAZIO);
  // (artigoAEliminar já não é necessário — confirmação feita via SweetAlert2)

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
      Swal.fire('Erro!', 'Não foi possível guardar o artigo. Verifica a ligação ao servidor.', 'error');
    }
  };

  // Confirma com SweetAlert2 antes de eliminar o artigo (padrão ensinado nas aulas)
  const confirmarEliminarArtigo = (artigo) => {
    Swal.fire({
      title: 'Tens a certeza?',
      text: `Vais eliminar o artigo "${artigo.titulo}". Esta ação não pode ser desfeita!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/noticias/delete/${artigo.id}`);
          setArtigos(prev => prev.filter(a => a.id !== artigo.id));
          Swal.fire('Eliminado!', 'O artigo foi removido.', 'success');
        } catch {
          Swal.fire('Erro!', 'Não foi possível eliminar o artigo.', 'error');
        }
      }
    });
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
      Swal.fire('Erro!', 'Não foi possível atualizar a mensagem.', 'error');
    }
  };

  // ── Eliminar mensagem recebida — usa SweetAlert2 para confirmação ──
  const eliminarMensagem = async (id) => {
    const result = await Swal.fire({
      title: 'Tens a certeza?',
      text: 'Vais eliminar esta mensagem de contacto. Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, eliminar!',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/contactos/delete/${id}`);
      setMensagens(prev => prev.filter(m => m.id !== id));
      Swal.fire('Eliminado!', 'A mensagem foi removida.', 'success');
    } catch {
      Swal.fire('Erro!', 'Não foi possível eliminar a mensagem.', 'error');
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
      Swal.fire('Erro!', 'Não foi possível guardar. Verifica a ligação ao servidor.', 'error');
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4 px-md-4">
        {/* Cabeçalho */}
        <div className="mb-4">
          <h4 className="clientes-titulo">Gestão de Conteúdo do Site</h4>
          <p className="text-secondary mb-0">
            Edite os textos e conteúdos exibidos nas páginas públicas
          </p>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          {TABS.map((tab) => (
            <li className="nav-item" key={tab.key}>
              <button
                type="button"
                className={`nav-link d-flex align-items-center gap-2 ${
                  tabAtiva === tab.key ? 'active fw-semibold' : 'text-secondary'
                }`}
                onClick={() => setTabAtiva(tab.key)}
              >
                <i className={`bi ${tab.icon}`}></i>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Conteúdo: Página Principal */}
        {tabAtiva === 'principal' && (
          <div className="d-flex flex-column gap-4">
            {/* Secção Hero */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#f3e8fd',
                        color: '#9333ea',
                      }}
                    >
                      <i className="bi bi-stars fs-5"></i>
                    </span>
                    <div>
                      <h5 className="fw-bold mb-0">Secção Hero (Topo da Página)</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye"></i>
                    Pré-visualizar
                  </button>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  O primeiro conteúdo que os visitantes veem ao entrar no site
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Título Principal{' '}
                    <span className="text-secondary fw-normal">
                      (aparece em destaque no topo)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={hero.titulo}
                    onChange={handleHeroChange('titulo')}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1">
                    Subtítulo{' '}
                    <span className="text-secondary fw-normal">
                      (texto explicativo abaixo do título)
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={hero.subtitulo}
                    onChange={handleHeroChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Secção de Serviços */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-1">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                    }}
                  >
                    <i className="bi bi-globe2 fs-5"></i>
                  </span>
                  <h5 className="fw-bold mb-0">Secção de Serviços</h5>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  Cabeçalho da área onde os serviços são apresentados
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Título da Secção{' '}
                    <span className="text-secondary fw-normal">
                      (aparece antes da lista de serviços)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex.: Os Nossos Serviços"
                    value={servicosHeader.titulo}
                    onChange={handleServicosHeaderChange('titulo')}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1">
                    Subtítulo da Secção{' '}
                    <span className="text-secondary fw-normal">
                      (descrição breve dos serviços)
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Texto explicativo da secção de serviços"
                    value={servicosHeader.subtitulo}
                    onChange={handleServicosHeaderChange('subtitulo')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo: Serviços */}
        {tabAtiva === 'servicos' && (
          <div>
            {/* Banner informativo */}
            <div
              className="d-flex flex-wrap justify-content-between align-items-center gap-3 rounded-3 p-3 mb-4"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <div style={{ color: '#1e3a8a' }}>
                <span className="fw-bold">Gestão de Serviços:</span>{' '}
                Adicione, edite ou remova serviços exibidos na página principal. Cada serviço
                aparece como um cartão com ícone, título e descrição.
              </div>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0"
                onClick={abrirNovoServico}
              >
                <i className="bi bi-plus-lg"></i>
                Novo Serviço
              </button>
            </div>

            {/* Grid de serviços */}
            <div className="row g-3">
              {servicos.map((servico) => (
                <div className="col-12 col-lg-6" key={servico.id}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-start gap-3">
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                            style={{
                              width: 44,
                              height: 44,
                              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                              color: '#fff',
                            }}
                          >
                            <i className={`bi ${servico.icone} fs-5`}></i>
                          </span>
                          <div>
                            <h6 className="fw-bold mb-1">{servico.titulo}</h6>
                            <p className="text-secondary mb-0 small">{servico.descricao}</p>
                          </div>
                        </div>
                        {servico.badge && (
                          <span
                            className="badge rounded-pill flex-shrink-0 ms-2"
                            style={{ backgroundColor: '#f3e8fd', color: '#9333ea' }}
                          >
                            {servico.badge}
                          </span>
                        )}
                      </div>

                      <div className="d-flex gap-4 mt-3 ps-0">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 fw-semibold"
                          onClick={() => abrirEditarServico(servico)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 fw-semibold text-danger d-flex align-items-center gap-1"
                          onClick={() => confirmarEliminar(servico)}
                        >
                          <i className="bi bi-trash"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {servicos.length === 0 && (
              <div className="text-center text-secondary py-5">
                Ainda não existem serviços. Clica em "Novo Serviço" para adicionar o primeiro.
              </div>
            )}
          </div>
        )}

        {/* Conteúdo: Notícias */}
        {tabAtiva === 'noticias' && (
          <div className="d-flex flex-column gap-4">
            {/* Secção Hero (Topo da Página de Notícias) */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#f3e8fd',
                        color: '#9333ea',
                      }}
                    >
                      <i className="bi bi-stars fs-5"></i>
                    </span>
                    <h5 className="fw-bold mb-0">Secção Hero (Topo da Página)</h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye"></i>
                    Pré-visualizar
                  </button>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  O primeiro conteúdo que os visitantes veem na página de notícias
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Título Principal{' '}
                    <span className="text-secondary fw-normal">
                      (aparece em destaque no topo)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={noticiasHero.titulo}
                    onChange={handleNoticiasHeroChange('titulo')}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1">
                    Subtítulo{' '}
                    <span className="text-secondary fw-normal">
                      (texto explicativo abaixo do título)
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={noticiasHero.subtitulo}
                    onChange={handleNoticiasHeroChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Banner informativo + Novo Artigo */}
            <div
              className="d-flex flex-wrap justify-content-between align-items-center gap-3 rounded-3 p-3"
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <div style={{ color: '#1e3a8a' }}>
                <span className="fw-bold">Gestão de Artigos:</span>{' '}
                Adicione, edite ou remova artigos exibidos na página de notícias. Cada artigo
                aparece com título, resumo e imagem.
              </div>
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0"
                onClick={abrirNovoArtigo}
              >
                <i className="bi bi-plus-lg"></i>
                Novo Artigo
              </button>
            </div>

            {/* Grid de artigos */}
            <div className="row g-3">
              {artigos.map((artigo) => (
                <div className="col-12 col-md-6 col-lg-4" key={artigo.id}>
                  <div className="card shadow-sm border-0 h-100 overflow-hidden">
                    <div
                      style={{
                        height: 180,
                        backgroundImage: `url(${artigo.imagem})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#0f172a',
                      }}
                    ></div>
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        {artigo.categoria && (
                          <span
                            className="badge rounded-pill"
                            style={{ backgroundColor: '#f3e8fd', color: '#9333ea' }}
                          >
                            {artigo.categoria}
                          </span>
                        )}
                        <span className="text-secondary small d-flex align-items-center gap-1">
                          <i className="bi bi-calendar3"></i>
                          {formatarDataPt(artigo.dataPublicacao)}
                        </span>
                      </div>

                      <h6 className="fw-bold mb-2">{artigo.titulo}</h6>
                      <p className="text-secondary small mb-3">{artigo.resumo}</p>

                      <div className="d-flex justify-content-between align-items-center mt-auto mb-3">
                        <span className="text-secondary small">{artigo.tempoLeitura}</span>
                        <span
                          className={`small fw-semibold ${
                            artigo.publicado ? 'text-success' : 'text-secondary'
                          }`}
                        >
                          {artigo.publicado ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>

                      <hr className="mt-0 mb-3" />

                      <div className="d-flex gap-4">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 fw-semibold"
                          onClick={() => abrirEditarArtigo(artigo)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 fw-semibold text-danger d-flex align-items-center gap-1"
                          onClick={() => confirmarEliminarArtigo(artigo)}
                        >
                          <i className="bi bi-trash"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {artigos.length === 0 && (
              <div className="text-center text-secondary py-5">
                Ainda não existem artigos. Clica em "Novo Artigo" para adicionar o primeiro.
              </div>
            )}
          </div>
        )}

        {/* Conteúdo: Contactos */}
        {tabAtiva === 'contactos' && (
          <div className="d-flex flex-column gap-4">
            {/* Cabeçalho da Página */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#dbeafe',
                        color: '#2563eb',
                      }}
                    >
                      <i className="bi bi-envelope fs-5"></i>
                    </span>
                    <h5 className="fw-bold mb-0">Cabeçalho da Página</h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-eye"></i>
                    Pré-visualizar
                  </button>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  Textos principais da página de contactos
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">Título Principal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactosCabecalho.titulo}
                    onChange={handleContactosCabecalhoChange('titulo')}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1">Subtítulo</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={contactosCabecalho.subtitulo}
                    onChange={handleContactosCabecalhoChange('subtitulo')}
                  />
                </div>
              </div>
            </div>

            {/* Informações de Contacto */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-1">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                    }}
                  >
                    <i className="bi bi-envelope fs-5"></i>
                  </span>
                  <h5 className="fw-bold mb-0">Informações de Contacto</h5>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  Dados exibidos na barra lateral da página
                </p>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1">E-mail</label>
                    <input
                      type="email"
                      className="form-control"
                      value={contactosInfo.email}
                      onChange={handleContactosInfoChange('email')}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1">Telefone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactosInfo.telefone}
                      onChange={handleContactosInfoChange('telefone')}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">Morada</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={contactosInfo.morada}
                    onChange={handleContactosInfoChange('morada')}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1">Horário</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={contactosInfo.horario}
                      onChange={handleContactosInfoChange('horario')}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold mb-1">
                      Número SOC (Emergências){' '}
                      <span className="text-secondary fw-normal">(Security Operations Center)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactosInfo.numeroSoc}
                      onChange={handleContactosInfoChange('numeroSoc')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Contacto */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-1">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#f3e8fd',
                      color: '#9333ea',
                    }}
                  >
                    <i className="bi bi-file-text fs-5"></i>
                  </span>
                  <h5 className="fw-bold mb-0">Formulário de Contacto</h5>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  Textos do formulário de envio de mensagens
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">Título do Formulário</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactosFormulario.titulo}
                    onChange={handleContactosFormularioChange('titulo')}
                  />
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1">
                    Mensagem de Sucesso{' '}
                    <span className="text-secondary fw-normal">(exibida após envio)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={contactosFormulario.mensagemSucesso}
                    onChange={handleContactosFormularioChange('mensagemSucesso')}
                  />
                </div>
              </div>
            </div>

            {/* ── Mensagens Recebidas (da BD) ── */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-1">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{ width: 40, height: 40, backgroundColor: '#fef9c3', color: '#a16207' }}
                  >
                    <i className="bi bi-inbox fs-5"></i>
                  </span>
                  <div>
                    <h5 className="fw-bold mb-0">
                      Mensagens Recebidas
                      {mensagens.filter(m => !m.lido).length > 0 && (
                        <span
                          className="badge rounded-pill ms-2"
                          style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '12px' }}
                        >
                          {mensagens.filter(m => !m.lido).length} novas
                        </span>
                      )}
                    </h5>
                  </div>
                </div>
                <p className="text-secondary ms-0 ms-md-5 ps-md-1 mb-4">
                  Mensagens enviadas pelo formulário de contacto do site
                </p>

                {carregandoMsgs ? (
                  <p className="text-secondary">A carregar mensagens…</p>
                ) : mensagens.length === 0 ? (
                  <p className="text-center text-secondary py-3">Ainda não há mensagens recebidas.</p>
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
                              <i className={`bi bi-envelope${msg.lido ? '' : '-fill'}`} style={{ color: msg.lido ? '#94a3b8' : '#2563eb' }}></i>
                              <span className="fw-semibold">{msg.nome}</span>
                              <span className="text-secondary small">{msg.email}</span>
                              {!msg.lido && (
                                <span className="badge rounded-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '11px' }}>
                                  Não lida
                                </span>
                              )}
                            </div>
                            {msg.assunto && (
                              <p className="fw-medium mb-1 small" style={{ color: '#374151' }}>{msg.assunto}</p>
                            )}
                            <p className="mb-1 small" style={{ color: '#4a5565', lineHeight: 1.5 }}>{msg.mensagem}</p>
                            <p className="text-secondary" style={{ fontSize: '12px', margin: 0 }}>
                              {new Date(msg.created_at).toLocaleString('pt-PT')}
                              {msg.telefone && ` · ${msg.telefone}`}
                            </p>
                          </div>
                          <div className="d-flex gap-2 flex-shrink-0">
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none"
                              title={msg.lido ? 'Marcar como não lida' : 'Marcar como lida'}
                              onClick={() => toggleLido(msg.id)}
                            >
                              <i className={`bi bi-${msg.lido ? 'eye-slash' : 'check2-circle'}`} style={{ color: '#2563eb' }}></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none"
                              title="Eliminar mensagem"
                              onClick={() => eliminarMensagem(msg.id)}
                            >
                              <i className="bi bi-trash text-danger"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Espaço para o botão flutuante não cobrir conteúdo */}
        <div style={{ height: 72 }}></div>
      </div>

      {/* Botão flutuante: Guardar Todas as Alterações */}
      <div
        className="position-fixed bottom-0 end-0 p-4 d-flex align-items-center gap-3"
        style={{ zIndex: 1030 }}
      >
        {guardado && (
          <span className="text-success fw-semibold d-flex align-items-center gap-1 bg-white px-3 py-2 rounded-3 shadow-sm">
            <i className="bi bi-check-circle-fill"></i>
            Alterações guardadas
          </span>
        )}
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 shadow"
          onClick={handleGuardarTodas}
          disabled={aGuardar}
        >
          {aGuardar ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              A guardar...
            </>
          ) : (
            <>
              <i className="bi bi-floppy"></i>
              Guardar Todas as Alterações
            </>
          )}
        </button>
      </div>
      {/* Modal: Criar / Editar Serviço */}
      {modalAberto && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={guardarServico}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                      {servicoEmEdicao ? 'Editar Serviço' : 'Novo Serviço'}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={fecharModal}
                      aria-label="Fechar"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">Título</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex.: Testes de Penetração (Pentesting)"
                        value={formServico.titulo}
                        onChange={handleFormServicoChange('titulo')}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">Descrição</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Breve descrição do serviço"
                        value={formServico.descricao}
                        onChange={handleFormServicoChange('descricao')}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">Ícone</label>
                      <select
                        className="form-select"
                        value={formServico.icone}
                        onChange={handleFormServicoChange('icone')}
                      >
                        {ICONES_SERVICO.map((opt) => (
                          <option key={opt.valor} value={opt.valor}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-3"
                          style={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                            color: '#fff',
                          }}
                        >
                          <i className={`bi ${formServico.icone}`}></i>
                        </span>
                        <span className="text-secondary small">Pré-visualização do ícone</span>
                      </div>
                    </div>

                    <div>
                      <label className="form-label fw-semibold mb-1">
                        Etiqueta / Badge{' '}
                        <span className="text-secondary fw-normal">(opcional, ex.: NIS2)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex.: NIS2"
                        value={formServico.badge}
                        onChange={handleFormServicoChange('badge')}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={fecharModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
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

      {/* Confirmação de eliminação de serviço feita via SweetAlert2 */}
      {/* Modal: Criar / Editar Artigo */}
      {modalArtigoAberto && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <form onSubmit={guardarArtigo}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                      {artigoEmEdicao ? 'Editar Artigo' : 'Novo Artigo'}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={fecharModalArtigo}
                      aria-label="Fechar"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">
                        Categoria <span className="text-secondary fw-normal">(categoria do artigo)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex.: NIS2 & Compliance"
                        value={formArtigo.categoria}
                        onChange={handleFormArtigoChange('categoria')}
                        autoFocus
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">
                        Título do Artigo{' '}
                        <span className="text-secondary fw-normal">(título do artigo)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex.: NIS2: O que muda para as empresas portuguesas em 2025"
                        value={formArtigo.titulo}
                        onChange={handleFormArtigoChange('titulo')}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">
                        Resumo <span className="text-secondary fw-normal">(resumo do artigo)</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Breve resumo do artigo"
                        value={formArtigo.resumo}
                        onChange={handleFormArtigoChange('resumo')}
                        required
                      />
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold mb-1">
                          Data de Publicação{' '}
                          <span className="text-secondary fw-normal">
                            (data em que o artigo foi publicado)
                          </span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formArtigo.dataPublicacao}
                          onChange={handleFormArtigoChange('dataPublicacao')}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold mb-1">
                          Tempo de Leitura{' '}
                          <span className="text-secondary fw-normal">
                            (tempo estimado para ler o artigo)
                          </span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex.: 5 min"
                          value={formArtigo.tempoLeitura}
                          onChange={handleFormArtigoChange('tempoLeitura')}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-1">
                        Imagem de Capa{' '}
                        <span className="text-secondary fw-normal">
                          (escolher imagem do computador)
                        </span>
                      </label>
                      <div className="d-flex align-items-center gap-3">
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0 overflow-hidden"
                          style={{
                            width: 64,
                            height: 64,
                            backgroundColor: '#f1f5f9',
                            backgroundImage: formArtigo.imagem ? `url(${formArtigo.imagem})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {!formArtigo.imagem && (
                            <i className="bi bi-image text-secondary fs-5"></i>
                          )}
                        </span>
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={handleImagemArtigoSelecionada}
                          />
                          <div className="form-text">
                            {formArtigo.imagem
                              ? 'Imagem selecionada — escolhe outra para substituir.'
                              : 'PNG ou JPG. Aparece como imagem de capa do artigo.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="form-check p-3 rounded-3"
                      style={{ backgroundColor: '#f3e8fd' }}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="artigoPublicado"
                        checked={formArtigo.publicado}
                        onChange={handleFormArtigoChange('publicado')}
                      />
                      <label
                        className="form-check-label fw-semibold"
                        htmlFor="artigoPublicado"
                        style={{ color: '#6b21a8' }}
                      >
                        Artigo Publicado
                        <div className="fw-normal small" style={{ color: '#9333ea' }}>
                          Ao ativar, o artigo será visível na página de notícias
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                      <i className="bi bi-floppy"></i>
                      {artigoEmEdicao ? 'Guardar Alterações' : 'Adicionar Artigo'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={fecharModalArtigo}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}

      {/* Confirmação de eliminação de artigo feita via SweetAlert2 */}
    </AdminLayout>
  );
}

export default Conteudo;
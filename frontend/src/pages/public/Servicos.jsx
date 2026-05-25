import { Link } from 'react-router-dom';
import { FaCrosshairs, FaShieldAlt, FaFileAlt, FaDesktop, FaChalkboardTeacher, FaCloud } from 'react-icons/fa';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../App.css';

const SERVICOS = [
  {
    icon: <FaCrosshairs size={28} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #2b7fff 0%, #155dfc 100%)',
    titulo: 'Testes de Penetração (Pentesting)',
    descricao: 'Simulação de ataques reais para identificar vulnerabilidades na sua infraestrutura antes que os atacantes o façam.',
    detalhes: 'Relatórios detalhados com CVSS scoring, exploração controlada e plano de remediação priorizado.',
    nis2: true,
  },
  {
    icon: <FaShieldAlt size={28} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #f6339a 0%, #e60076 100%)',
    titulo: 'Gestão de Incidentes NIS2',
    descricao: 'Resposta rápida a incidentes de segurança com notificação às autoridades dentro dos prazos NIS2 (24h/72h).',
    detalhes: 'Equipa SOC disponível 24/7 com playbooks de resposta e coordenação com autoridades competentes.',
    nis2: true,
  },
  {
    icon: <FaFileAlt size={28} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #ad46ff 0%, #9810fa 100%)',
    titulo: 'Auditoria de Conformidade NIS2',
    descricao: 'Avaliação completa do estado de conformidade com a Diretiva NIS2 e elaboração de planos de ação.',
    detalhes: 'Gap analysis, roadmap de implementação e suporte durante o processo de certificação.',
    nis2: true,
  },
  {
    icon: <FaDesktop size={28} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #2b7fff 0%, #155dfc 100%)',
    titulo: 'SIEM & Monitorização Contínua',
    descricao: 'Monitorização contínua de eventos de segurança com correlação avançada de ameaças.',
    detalhes: 'Dashboards em tempo real, alertas automatizados e relatórios de conformidade mensais.',
    nis2: true,
  },
  {
    icon: <FaChalkboardTeacher size={28} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #00b8db 0%, #0092b8 100%)',
    titulo: 'Formação e Consciencialização',
    descricao: 'Programas de formação personalizados para aumentar a maturidade de segurança das suas equipas.',
    detalhes: 'Simulações de phishing, workshops presenciais e e-learning adaptado ao perfil dos colaboradores.',
    nis2: false,
  },
  {
    icon: <FaCloud size={28} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #ad46ff 0%, #9810fa 100%)',
    titulo: 'Segurança Cloud & DevSecOps',
    descricao: 'Proteção de ambientes cloud e integração de segurança no ciclo de desenvolvimento de software.',
    detalhes: 'Revisão de arquiteturas cloud, pipelines CI/CD seguros e políticas de acesso baseadas em Zero Trust.',
    nis2: false,
  },
];

const NIS2_ARTIGOS = [
  { art: 'Art. 21',   titulo: 'Gestão de Riscos',          desc: 'Medidas de segurança adequadas e proporcionadas ao risco.' },
  { art: 'Art. 23',   titulo: 'Notificação de Incidentes',  desc: 'Notificação às autoridades em 24h (alerta) e 72h (relatório).' },
  { art: 'Art. 20',   titulo: 'Governação',                 desc: 'Responsabilidade dos órgãos de gestão pela cibersegurança.' },
  { art: 'Art. 21(2)', titulo: 'Continuidade de Negócio',   desc: 'BCP e DRP como medidas mínimas obrigatórias.' },
];

const NIS2_CHECKLIST = [
  'Gestão de riscos de cibersegurança',
  'Notificação de incidentes em 24h/72h',
  'Continuidade de negócio e recuperação',
  'Segurança da cadeia de abastecimento',
  'Formação e consciencialização',
  'Uso de criptografia e autenticação MFA',
];

const GRADIENT_TEXT = {
  background: 'linear-gradient(90deg, #9810fa 0%, #155dfc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

export default function Servicos() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="position-relative overflow-hidden text-center"
        style={{ backgroundColor: '#faf5ff', padding: '120px 0 64px' }}
      >
        <div
          className="position-absolute rounded-circle"
          style={{
            top: 0, left: '25%',
            width: '600px', height: '400px',
            background: 'linear-gradient(135deg, rgba(194,122,255,0.25) 0%, rgba(81,162,255,0.25) 50%, rgba(0,211,243,0.25) 100%)',
            filter: 'blur(80px)', pointerEvents: 'none',
          }}
        />
        <div className="container position-relative">
          <h1 className="fw-semibold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#101828' }}>
            Serviços{' '}
            <span style={GRADIENT_TEXT}>Especializados</span>
          </h1>
          <p className="mx-auto" style={{ maxWidth: '560px', color: '#4a5565', fontSize: '18px', lineHeight: 1.7 }}>
            Proteção abrangente para a sua organização com serviços alinhados à Diretiva NIS2 europeia.
          </p>
        </div>
      </section>

      {/* ── GRELHA DE SERVIÇOS ── */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="row g-4">
            {SERVICOS.map(s => (
              <div className="col-12 col-md-6" key={s.titulo}>
                <div
                  className="h-100 p-4 d-flex gap-4"
                  style={{ border: '1.6px solid rgba(0,0,0,0.1)', borderRadius: '16px', background: '#fff', transition: 'box-shadow 0.2s' }}
                >
                  {/* Ícone */}
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '56px', height: '56px', borderRadius: '16px', background: s.iconBg }}
                  >
                    {s.icon}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h5 className="fw-semibold mb-0" style={{ color: '#101828' }}>{s.titulo}</h5>
                      {s.nis2 && (
                        <span style={{ background: '#f3e8ff', color: '#9810fa', fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                          NIS2 ✓
                        </span>
                      )}
                    </div>
                    <p className="small mb-2" style={{ color: '#4a5565', lineHeight: 1.6 }}>{s.descricao}</p>
                    <p className="small mb-0 p-3" style={{ color: '#4a5565', background: '#faf5ff', borderRadius: '12px', lineHeight: 1.6 }}>
                      {s.detalhes}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONFORMIDADE NIS2 ── */}
      <section className="py-5" style={{ backgroundColor: '#faf5ff' }}>
        <div className="container py-4">

          {/* Título */}
          <div className="text-center mb-5">
            <h2 className="fw-semibold mb-3" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#101828' }}>
              Conformidade com a{' '}
              <span style={GRADIENT_TEXT}>Diretiva NIS2</span>
            </h2>
            <p className="mx-auto" style={{ maxWidth: '600px', color: '#4a5565' }}>
              Os nossos serviços cobrem todos os requisitos da Diretiva NIS2 (UE) 2022/2555, garantindo que a sua organização está em plena conformidade.
            </p>
          </div>

          {/* Artigos NIS2 */}
          <div className="row g-4 mb-4">
            {NIS2_ARTIGOS.map(item => (
              <div className="col-12 col-md-6 col-lg-3" key={item.art}>
                <div
                  className="h-100 p-4"
                  style={{ background: '#fff', border: '1.6px solid rgba(152,16,250,0.15)', borderRadius: '16px' }}
                >
                  <div className="fw-bold small mb-2" style={GRADIENT_TEXT}>{item.art}</div>
                  <h6 className="fw-semibold mb-2" style={{ color: '#101828' }}>{item.titulo}</h6>
                  <p className="small mb-0" style={{ color: '#4a5565' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Caixa de info */}
          <div
            className="p-4 p-md-5"
            style={{ background: '#fff', border: '1.6px solid rgba(0,0,0,0.1)', borderRadius: '16px' }}
          >
            <div className="row g-4 align-items-center">
              <div className="col-12 col-md-6">
                <h3 className="fw-semibold mb-3" style={{ color: '#101828', fontSize: '22px' }}>
                  O que é a Diretiva NIS2?
                </h3>
                <p style={{ color: '#4a5565', lineHeight: 1.75 }}>
                  A Diretiva NIS2 (Network and Information Security 2) é uma legislação europeia que estabelece requisitos mínimos de cibersegurança para entidades essenciais e importantes na UE.
                </p>
                <p className="mb-0" style={{ color: '#4a5565', lineHeight: 1.75 }}>
                  Em vigor desde outubro de 2024 em Portugal, abrange setores como energia, transportes, saúde, infraestruturas digitais, administração pública e outros setores críticos.
                </p>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex flex-column gap-3">
                  {NIS2_CHECKLIST.map(item => (
                    <div key={item} className="d-flex align-items-center gap-3">
                      <FiCheckCircle size={18} style={{ color: '#9810fa', flexShrink: 0 }} />
                      <span className="small" style={{ color: '#4a5565' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="position-relative overflow-hidden text-center"
        style={{ backgroundColor: '#faf5ff', padding: '80px 0' }}
      >
        <div
          className="position-absolute top-0 end-0 rounded-circle"
          style={{
            width: '400px', height: '300px',
            background: 'linear-gradient(135deg, rgba(194,122,255,0.3) 0%, rgba(81,162,255,0.3) 100%)',
            filter: 'blur(80px)', pointerEvents: 'none',
          }}
        />
        <div className="container position-relative">
          <h2 className="fw-semibold mb-3" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#101828' }}>
            Pronto para começar?
          </h2>
          <p className="mx-auto mb-4" style={{ maxWidth: '480px', color: '#4a5565', fontSize: '17px', lineHeight: 1.7 }}>
            Contacte-nos para uma avaliação gratuita da sua postura de segurança.
          </p>
          <Link to="/contacto" className="btn-gradient">
            Contactar Agora <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

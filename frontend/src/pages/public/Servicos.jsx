import { useNavigate } from 'react-router-dom';
import { FaCrosshairs, FaShieldAlt, FaFileAlt, FaDesktop, FaChalkboardTeacher, FaCloud } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SERVICOS = [
  {
    icon: <FaCrosshairs size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    titulo: 'Testes de Penetração (Pentesting)',
    descricao: 'Simulação de ataques reais para identificar vulnerabilidades na sua infraestrutura antes que os atacantes o façam.',
    nis2: true,
  },
  {
    icon: <FaShieldAlt size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    titulo: 'Gestão de Incidentes NIS2',
    descricao: 'Resposta rápida a incidentes de segurança com notificação às autoridades dentro dos prazos NIS2 (24h/72h).',
    nis2: true,
  },
  {
    icon: <FaFileAlt size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    titulo: 'Auditoria de Conformidade NIS2',
    descricao: 'Avaliação completa do estado de conformidade com a Diretiva NIS2 e elaboração de planos de ação.',
    nis2: true,
  },
  {
    icon: <FaDesktop size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    titulo: 'SIEM & Monitorização Contínua',
    descricao: 'Monitorização contínua de eventos de segurança com correlação avançada de ameaças.',
    nis2: true,
  },
  {
    icon: <FaChalkboardTeacher size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    titulo: 'Formação e Consciencialização',
    descricao: 'Programas de formação personalizados para aumentar a maturidade de segurança das suas equipas.',
    nis2: false,
  },
  {
    icon: <FaCloud size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    titulo: 'Segurança Cloud & DevSecOps',
    descricao: 'Proteção de ambientes cloud e integração de segurança no ciclo de desenvolvimento de software.',
    nis2: false,
  },
];

export default function Servicos() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* Header da página */}
      <section className="py-5 text-center" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 30%, #e0f2fe 70%, #cffafe 100%)' }}>
        <div className="container py-3">
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0f172a' }}>
            Serviços{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Especializados
            </span>
          </h1>
          <p className="text-secondary mx-auto" style={{ maxWidth: '520px', fontSize: '16px' }}>
            Soluções completas para elevar a segurança e conformidade da sua empresa
          </p>
        </div>
      </section>

      {/* Cards de serviços */}
      <section className="py-5 bg-white flex-grow-1">
        <div className="container py-3">
          <div className="row g-4">
            {SERVICOS.map((s) => (
              <div className="col-12 col-md-6 col-lg-4" key={s.titulo}>
                <div className="card h-100 border rounded-4 p-4 shadow-sm position-relative">
                  {s.nis2 && (
                    <span
                      className="badge position-absolute"
                      style={{ top: '16px', right: '16px', background: '#ede9fe', color: '#7c3aed', fontWeight: '600', fontSize: '11px', padding: '4px 10px', borderRadius: '999px' }}
                    >
                      NIS2
                    </span>
                  )}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 mb-4"
                    style={{ width: '56px', height: '56px', background: s.iconBg }}
                  >
                    {s.icon}
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{s.titulo}</h5>
                  <p className="text-secondary small mb-3">{s.descricao}</p>
                  <a href="#" style={{ color: '#7c3aed', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                    Saber mais →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Botão detalhes */}
          <div className="text-center mt-5">
            <button
              className="btn rounded-pill px-4 py-2 fw-semibold"
              style={{ border: '1.5px solid #7c3aed', color: '#7c3aed', background: 'transparent' }}
            >
              + Detalhes
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-5 text-center"
        style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 30%, #e0f2fe 70%, #cffafe 100%)' }}
      >
        <div className="container py-4">
          <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#0f172a' }}>
            Pronto para Proteger o Seu Negócio?
          </h2>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '560px' }}>
            Agende uma demonstração gratuita e descubra como a nossa tecnologia pode proteger a sua empresa contra ameaças digitais.
          </p>
          <button
            onClick={() => navigate('/contacto')}
            className="btn text-white fw-semibold rounded-pill px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            Agendar Serviços →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaClipboardCheck, FaSearch, FaBug, FaCloud, FaGraduationCap } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SERVICOS = [
  { icon: <FaShieldAlt />, titulo: 'Avaliação de Vulnerabilidades', descricao: 'Identificamos e analisamos falhas de segurança na sua infraestrutura digital antes que sejam exploradas.' },
  { icon: <FaClipboardCheck />, titulo: 'Conformidade NIS2 & RGPD', descricao: 'Garantimos que a sua empresa cumpre as diretivas europeias de cibersegurança e proteção de dados.' },
  { icon: <FaSearch />, titulo: 'Monitorização Contínua', descricao: 'Vigilância 24/7 dos seus sistemas com resposta imediata a incidentes de segurança.' },
  { icon: <FaBug />, titulo: 'Testes de Penetração', descricao: 'Simulamos ataques reais para avaliar a resistência dos seus sistemas e redes.' },
  { icon: <FaCloud />, titulo: 'Segurança Cloud', descricao: 'Proteção de ambientes cloud com configurações seguras e controlo de acessos.' },
  { icon: <FaGraduationCap />, titulo: 'Formação & Sensibilização', descricao: 'Capacitamos as suas equipas para reconhecer e responder a ameaças digitais.' },
];

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* Hero */}
      <section
        className="py-5 text-center position-relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 30%, #e0f2fe 70%, #cffafe 100%)', minHeight: '520px' }}
      >
        <div className="container py-5">
          <h1 className="display-4 fw-bold text-dark mb-4" style={{ letterSpacing: '-1px' }}>
            Segurança Digital para um<br />Mundo Conectado
          </h1>
          <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: '580px' }}>
            Proteja a sua empresa contra ameaças digitais e garanta
            conformidade com as diretivas europeias de cibersegurança.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button
              onClick={() => navigate('/servicos')}
              className="btn text-white fw-semibold rounded-pill px-4 py-3"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              Explorar Serviços &nbsp;→
            </button>
            <button
              onClick={() => navigate('/contacto')}
              className="btn btn-outline-secondary fw-semibold rounded-pill px-4 py-3"
            >
              Agendar Serviços
            </button>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-5 bg-white">
        <div className="container py-4 text-center">
          <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>
            Serviços{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Especializados
            </span>
          </h2>
          <p className="text-secondary mb-5">
            Soluções completas de cibersegurança adaptadas às necessidades da sua empresa.
          </p>
          <div className="row g-4 text-start">
            {SERVICOS.map((s) => (
              <div className="col-12 col-md-6 col-lg-4" key={s.titulo}>
                <div className="card h-100 border rounded-4 p-4 shadow-sm">
                  <div className="mb-3 fs-3" style={{ color: '#7c3aed' }}>{s.icon}</div>
                  <h5 className="fw-bold text-dark mb-2">{s.titulo}</h5>
                  <p className="text-secondary small mb-0">{s.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-5 text-center text-white mt-auto"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
      >
        <div className="container py-4">
          <h2 className="fw-bold mb-3 text-white">Pronto para proteger a sua empresa?</h2>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Fale com os nossos especialistas e descubra como podemos ajudar.
          </p>
          <button
            onClick={() => navigate('/contacto')}
            className="btn btn-light fw-semibold rounded-pill px-4 py-3"
            style={{ color: '#7c3aed' }}
          >
            Contactar Agora
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

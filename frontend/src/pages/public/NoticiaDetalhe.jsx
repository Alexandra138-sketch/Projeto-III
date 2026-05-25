import { Link, useParams, Navigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { NOTICIAS } from './Noticias';
import '../../App.css';

export default function NoticiaDetalhe() {
  const { articleId } = useParams();
  const article = NOTICIAS.find(a => String(a.id) === articleId);

  if (!article) return <Navigate to="/noticias" replace />;

  const relacionadas = NOTICIAS.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ paddingTop: '48px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>

          {/* Breadcrumb */}
          <Link
            to="/noticias"
            className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4"
            style={{ fontSize: '14px', color: '#4a5565' }}
          >
            <FiArrowLeft size={16} /> Voltar às notícias
          </Link>

          {/* Cabeçalho */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
              <span
                className="d-inline-flex align-items-center gap-1"
                style={{ background: '#f3e8ff', color: '#7c3aed', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '999px' }}
              >
                <FiTag size={12} /> {article.category}
              </span>
              <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: '14px', color: '#9ca3af' }}>
                <span className="d-flex align-items-center gap-1">
                  <FiCalendar size={14} />
                  {new Date(article.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="d-flex align-items-center gap-1">
                  <FiClock size={14} /> {article.readTime}
                </span>
              </div>
            </div>

            <h1 className="fw-bold mb-4" style={{ color: '#101828', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2 }}>
              {article.title}
            </h1>
            <p style={{ fontSize: '18px', color: '#4a5565', lineHeight: 1.7 }}>
              {article.excerpt}
            </p>
          </div>

          {/* Imagem de destaque */}
          <div className="overflow-hidden mb-5" style={{ borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <section style={{ padding: '48px 0' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '16px' }}>
            <p>
              A segurança digital é uma prioridade crescente no panorama empresarial atual.
              Com o aumento das ameaças cibernéticas e a evolução constante das tecnologias,
              as organizações devem manter-se atualizadas sobre as melhores práticas e
              regulamentações em vigor.
            </p>

            <h2 className="fw-bold mt-5 mb-3" style={{ color: '#101828', fontSize: '22px' }}>
              Contexto e Importância
            </h2>
            <p>
              A implementação de medidas robustas de cibersegurança não é apenas uma questão
              técnica, mas também um imperativo de conformidade regulamentar. As organizações
              devem compreender os requisitos específicos do seu sector e implementar controlos
              adequados para proteger os seus ativos digitais.
            </p>

            <div
              className="my-5 p-4"
              style={{ background: '#f5f3ff', borderLeft: '4px solid #7c3aed', borderRadius: '0 8px 8px 0' }}
            >
              <p className="mb-0" style={{ color: '#4c1d95', fontWeight: '500' }}>
                <strong>Nota Importante:</strong> Este artigo fornece informação geral sobre
                cibersegurança e conformidade. Para orientações específicas adaptadas à sua
                organização, contacte os nossos especialistas.
              </p>
            </div>

            <h2 className="fw-bold mt-5 mb-3" style={{ color: '#101828', fontSize: '22px' }}>
              Principais Considerações
            </h2>
            <p>Ao abordar questões de segurança digital, é fundamental considerar vários aspetos:</p>
            <ul style={{ paddingLeft: '24px', lineHeight: 2 }}>
              <li>Avaliação contínua de riscos e vulnerabilidades</li>
              <li>Implementação de controlos técnicos e organizacionais</li>
              <li>Formação e sensibilização dos colaboradores</li>
              <li>Monitorização e resposta a incidentes</li>
              <li>Conformidade com regulamentações aplicáveis (NIS2, RGPD, etc.)</li>
            </ul>

            <h2 className="fw-bold mt-5 mb-3" style={{ color: '#101828', fontSize: '22px' }}>
              Próximos Passos
            </h2>
            <p>
              A CyberBoxSecur está preparada para ajudar a sua organização a navegar no
              complexo panorama da cibersegurança. Os nossos serviços especializados incluem
              auditorias de segurança, testes de penetração, consultoria de conformidade e
              muito mais.
            </p>
            <p>
              Entre em contacto connosco para descobrir como podemos fortalecer a postura de
              segurança da sua organização e garantir a conformidade com as regulamentações
              europeias mais recentes.
            </p>
          </div>
        </div>
      </section>

      {/* ── ÚLTIMAS PUBLICAÇÕES ── */}
      <section style={{ padding: '64px 0', background: '#f9fafb' }}>
        <div className="container">
          <h2 className="fw-bold text-center mb-5" style={{ color: '#101828', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Últimas Publicações
          </h2>
          <div className="row g-4">
            {relacionadas.map(rel => (
              <div className="col-12 col-md-4" key={rel.id}>
                <Link to={`/noticias/${rel.id}`} className="d-block text-decoration-none h-100">
                  <div
                    className="h-100 overflow-hidden"
                    style={{ borderRadius: '16px', border: '1px solid #e5e7eb', background: '#fff', transition: 'box-shadow 0.2s' }}
                  >
                    <div style={{ height: '192px', overflow: 'hidden' }}>
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                      />
                    </div>
                    <div className="p-4">
                      <span style={{
                        display: 'inline-block',
                        background: '#f3e8ff', color: '#7c3aed',
                        fontSize: '12px', fontWeight: '600',
                        padding: '3px 10px', borderRadius: '999px',
                        marginBottom: '10px',
                      }}>
                        {rel.category}
                      </span>
                      <h5 className="fw-semibold mb-2" style={{ color: '#101828', fontSize: '15px', lineHeight: 1.4 }}>
                        {rel.title}
                      </h5>
                      <p className="small mb-0" style={{ color: '#4a5565', lineHeight: 1.6 }}>
                        {rel.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

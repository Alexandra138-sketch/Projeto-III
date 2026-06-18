import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';
import '../../App.css';

export const NOTICIAS = [
  {
    id: 1,
    category: 'NIS2',
    title: 'Nova Diretiva NIS2: O que as Empresas Precisam de Saber',
    excerpt: 'A Diretiva NIS2 representa um marco crucial na cibersegurança europeia, impondo requisitos mais rigorosos para entidades essenciais e importantes.',
    date: '2026-04-01',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1768224656445-33d078c250b7?w=600&q=80',
  },
  {
    id: 2,
    category: 'Ameaças',
    title: 'Ransomware em 2026: Tendências e Proteção',
    excerpt: 'Os ataques de ransomware continuam a evoluir. Descubra as táticas mais recentes e como proteger a sua organização contra estas ameaças.',
    date: '2026-03-28',
    readTime: '7 min',
    imageUrl: 'https://images.unsplash.com/photo-1760199789455-49098afd02f0?w=600&q=80',
  },
  {
    id: 3,
    category: 'Boas Práticas',
    title: 'Autenticação Multi-Factor: Guia Completo',
    excerpt: 'A autenticação multi-factor (MFA) é essencial para proteger contas e sistemas. Aprenda a implementar MFA de forma eficaz na sua organização.',
    date: '2026-03-25',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1760199789463-b523db55dd8b?w=600&q=80',
  },
  {
    id: 4,
    category: 'Conformidade',
    title: 'RGPD e Cibersegurança: A Interseção Crítica',
    excerpt: 'Compreender a relação entre o RGPD e a cibersegurança é fundamental para garantir a proteção de dados pessoais e evitar sanções.',
    date: '2026-03-20',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1599949104055-2d04026aee1e?w=600&q=80',
  },
  {
    id: 5,
    category: 'NIS2',
    title: 'Implementação da NIS2: Checklist Essencial',
    excerpt: 'Um guia prático com os passos essenciais para garantir a conformidade da sua organização com a Diretiva NIS2 até ao prazo limite.',
    date: '2026-03-15',
    readTime: '10 min',
    imageUrl: 'https://images.unsplash.com/photo-1764452008254-eed469a4fad3?w=600&q=80',
  },
  {
    id: 6,
    category: 'Tecnologia',
    title: 'IA na Cibersegurança: Oportunidades e Desafios',
    excerpt: 'A inteligência artificial está a transformar a cibersegurança. Explore como a IA pode fortalecer as suas defesas digitais.',
    date: '2026-03-10',
    readTime: '9 min',
    imageUrl: 'https://images.unsplash.com/photo-1763568258143-904ea924ac53?w=600&q=80',
  },
];

export default function Noticias() {
  const [noticias,    setNoticias]    = useState([]);
  const [carregando,  setCarregando]  = useState(true);

  useEffect(() => {
    api.get('/noticias/publico')
      .then(({ data }) => setNoticias(Array.isArray(data) ? data : []))
      .catch(() => setNoticias([]))
      .finally(() => setCarregando(false));
  }, []);

  // O artigo em destaque é o primeiro (mais recente)
  const destaque  = noticias[0] || null;
  const restantes = noticias.slice(1);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="position-relative overflow-hidden text-center"
        style={{ backgroundColor: '#faf5ff', padding: '54px 0 48px' }}
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
        <div className="container position-relative text-center">
          <h1 className="fw-semibold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#101828' }}>
            Notícias de{' '}
            <span style={{ background: 'linear-gradient(90deg, #9810fa 0%, #155dfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cibersegurança
            </span>
          </h1>
          <p className="mx-auto" style={{ maxWidth: '640px', color: '#4a5565', fontSize: '18px', lineHeight: 1.7 }}>
            Mantenha-se informado sobre as últimas tendências, ameaças e boas práticas em segurança digital e conformidade regulamentar.
          </p>
        </div>
      </section>

      {/* ── ARTIGO EM DESTAQUE ── */}
      {destaque && (
        <section style={{ padding: '64px 0', background: '#f9fafb' }}>
          <div className="container">
            <Link to={`/noticias/${destaque.id}`} className="text-decoration-none">
              <div className="overflow-hidden" style={{ borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', background: '#fff' }}>
                <div className="row g-0">
                  <div className="col-12 col-md-6" style={{ minHeight: '340px', overflow: 'hidden' }}>
                    <img
                      src={destaque.imagem_url || 'https://images.unsplash.com/photo-1768224656445-33d078c250b7?w=800&q=80'}
                      alt={destaque.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div className="col-12 col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center">
                    <span style={{ alignSelf: 'flex-start', background: '#f3e8ff', color: '#7c3aed', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '999px', marginBottom: '16px' }}>
                      Em Destaque
                    </span>
                    <h2 className="fw-bold mb-3" style={{ color: '#101828', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', lineHeight: 1.3 }}>
                      {destaque.titulo}
                    </h2>
                    <p className="mb-4" style={{ color: '#4a5565', lineHeight: 1.7 }}>{destaque.resumo}</p>
                    <div className="d-flex gap-4 mb-4" style={{ color: '#9ca3af', fontSize: '14px' }}>
                      <span className="d-flex align-items-center gap-2">
                        <FiCalendar size={16} /> {new Date(destaque.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {destaque.tempo_leitura && (
                        <span className="d-flex align-items-center gap-2">
                          <FiClock size={16} /> {destaque.tempo_leitura}
                        </span>
                      )}
                    </div>
                    <span className="d-inline-flex align-items-center gap-2 fw-semibold" style={{ color: '#9810fa' }}>
                      Ler artigo <FiArrowRight size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── GRELHA DE ARTIGOS ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          {carregando ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>A carregar artigos…</p>
          ) : restantes.length === 0 && !destaque ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Ainda não há artigos publicados.</p>
          ) : (
            <div className="row g-4">
              {restantes.map(article => (
                <div className="col-12 col-md-6 col-lg-4" key={article.id}>
                  <Link to={`/noticias/${article.id}`} className="d-block text-decoration-none h-100">
                    <div className="h-100 overflow-hidden" style={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', background: '#fff' }}>
                      <div className="position-relative overflow-hidden" style={{ height: '192px' }}>
                        <img
                          src={article.imagem_url || 'https://images.unsplash.com/photo-1599949104055-2d04026aee1e?w=600&q=80'}
                          alt={article.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <span className="position-absolute text-white" style={{ bottom: '12px', left: '12px', background: '#9810fa', fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px' }}>
                          {new Date(article.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="p-4 d-flex flex-column" style={{ flex: 1 }}>
                        <h5 className="fw-semibold mb-2" style={{ color: '#101828', fontSize: '15px', lineHeight: 1.4 }}>{article.titulo}</h5>
                        <p className="small mb-3 flex-grow-1" style={{ color: '#4a5565', lineHeight: 1.65 }}>{article.resumo}</p>
                        <span className="d-inline-flex align-items-center gap-1 fw-medium small" style={{ color: '#9810fa' }}>Ler Mais »</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

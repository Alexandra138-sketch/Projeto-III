import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';
import '../../App.css';

export default function NoticiaDetalhe() {
  const { articleId } = useParams();
  const navigate      = useNavigate();

  const [article,     setArticle]     = useState(null);
  const [relacionadas, setRelacionadas] = useState([]);
  const [carregando,  setCarregando]  = useState(true);

  useEffect(() => {
    // Buscar o artigo completo
    api.get(`/noticias/publico/${articleId}`)
      .then(({ data }) => setArticle(data))
      .catch(() => navigate('/noticias', { replace: true }))
      .finally(() => setCarregando(false));

    // Buscar outros artigos para "Últimas Publicações"
    api.get('/noticias/publico')
      .then(({ data }) => {
        const outros = Array.isArray(data)
          ? data.filter(n => String(n.id) !== articleId).slice(0, 3)
          : [];
        setRelacionadas(outros);
      })
      .catch(() => setRelacionadas([]));
  }, [articleId]); // eslint-disable-line

  if (carregando) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>A carregar artigo…</div>
        <Footer />
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />

      {/* ── CABEÇALHO ── */}
      <section style={{ paddingTop: '48px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>

          <Link
            to="/noticias"
            className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4"
            style={{ fontSize: '14px', color: '#4a5565' }}
          >
            ← Voltar às notícias
          </Link>

          <div className="mb-4">
            <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
              {article.categoria && (
                <span
                  className="d-inline-flex align-items-center gap-1"
                  style={{ background: '#f3e8ff', color: '#7c3aed', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '999px' }}
                >
                  🏷 {article.categoria}
                </span>
              )}
              <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: '14px', color: '#9ca3af' }}>
                <span className="d-flex align-items-center gap-1">
                  📅
                  {new Date(article.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {article.tempo_leitura && (
                  <span className="d-flex align-items-center gap-1">
                    🕐 {article.tempo_leitura}
                  </span>
                )}
              </div>
            </div>

            <h1 className="fw-bold mb-4" style={{ color: '#101828', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2 }}>
              {article.titulo}
            </h1>
            {article.resumo && (
              <p style={{ fontSize: '18px', color: '#4a5565', lineHeight: 1.7 }}>{article.resumo}</p>
            )}
          </div>

          {article.imagem_url && (
            <div className="overflow-hidden mb-5" style={{ borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
              <img
                src={article.imagem_url}
                alt={article.titulo}
                style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <section style={{ padding: '48px 0' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          {article.conteudo ? (
            /* Renderizar o conteúdo — suporta texto com parágrafos separados por \n */
            <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '16px' }}>
              {article.conteudo.split('\n').map((paragrafo, i) =>
                paragrafo.trim() ? <p key={i}>{paragrafo}</p> : null
              )}
            </div>
          ) : (
            <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '16px' }}>
              <p>
                A segurança digital é uma prioridade crescente no panorama empresarial atual.
                Com o aumento das ameaças cibernéticas e a evolução constante das tecnologias,
                as organizações devem manter-se atualizadas sobre as melhores práticas.
              </p>
              <div className="my-5 p-4" style={{ background: '#f5f3ff', borderLeft: '4px solid #7c3aed', borderRadius: '0 8px 8px 0' }}>
                <p className="mb-0" style={{ color: '#4c1d95', fontWeight: '500' }}>
                  <strong>Nota:</strong> Para orientações específicas adaptadas à sua organização, contacte os nossos especialistas.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── ÚLTIMAS PUBLICAÇÕES ── */}
      {relacionadas.length > 0 && (
        <section style={{ padding: '64px 0', background: '#f9fafb' }}>
          <div className="container">
            <h2 className="fw-bold text-center mb-5" style={{ color: '#101828', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              Últimas Publicações
            </h2>
            <div className="row g-4">
              {relacionadas.map(rel => (
                <div className="col-12 col-md-4" key={rel.id}>
                  <Link to={`/noticias/${rel.id}`} className="d-block text-decoration-none h-100">
                    <div className="h-100 overflow-hidden" style={{ borderRadius: '16px', border: '1px solid #e5e7eb', background: '#fff' }}>
                      <div style={{ height: '192px', overflow: 'hidden' }}>
                        <img
                          src={rel.imagem_url || 'https://images.unsplash.com/photo-1599949104055-2d04026aee1e?w=600&q=80'}
                          alt={rel.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      <div className="p-4">
                        {rel.categoria && (
                          <span style={{ display: 'inline-block', background: '#f3e8ff', color: '#7c3aed', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px', marginBottom: '10px' }}>
                            {rel.categoria}
                          </span>
                        )}
                        <h5 className="fw-semibold mb-2" style={{ color: '#101828', fontSize: '15px', lineHeight: 1.4 }}>
                          {rel.titulo}
                        </h5>
                        <p className="small mb-0" style={{ color: '#4a5565', lineHeight: 1.6 }}>{rel.resumo}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

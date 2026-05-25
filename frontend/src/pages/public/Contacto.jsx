import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../App.css';

const INFO = [
  { icon: <FiMail size={18} color="#155dfc" />, label: 'E-mail',   value: 'info@cyberboxsecur.pt' },
  { icon: <FiPhone size={18} color="#155dfc" />, label: 'Telefone', value: '+351 210 000 000' },
  { icon: <FiMapPin size={18} color="#155dfc" />, label: 'Morada',  value: 'Lisboa, Portugal' },
  { icon: <FiClock size={18} color="#155dfc" />, label: 'Horário',  value: 'Segunda a Sexta: 09h – 18h' },
];

const SERVICOS_OPCOES = [
  'Testes de Penetração (Pentesting)',
  'Gestão de Incidentes NIS2',
  'Auditoria de Conformidade NIS2',
  'SIEM & Monitorização Contínua',
  'Formação e Consciencialização',
  'Segurança Cloud & DevSecOps',
  'Outro',
];

const FORM_INICIAL = { nome: '', empresa: '', email: '', telefone: '', servico: '', assunto: '', mensagem: '' };

export default function Contacto() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

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
            top: 0, right: '25%',
            width: '500px', height: '350px',
            background: 'linear-gradient(135deg, rgba(194,122,255,0.25) 0%, rgba(81,162,255,0.25) 100%)',
            filter: 'blur(80px)', pointerEvents: 'none',
          }}
        />
        <div className="container position-relative">
          <h1 className="fw-semibold mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#101828' }}>
            Entre em{' '}
            <span style={{ background: 'linear-gradient(90deg, #9810fa 0%, #155dfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Contacto
            </span>
          </h1>
          <p className="mx-auto" style={{ maxWidth: '560px', color: '#4a5565', fontSize: '18px', lineHeight: 1.7 }}>
            Fale connosco para saber como podemos proteger a sua organização contra ameaças digitais.
          </p>
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <section className="py-5 flex-grow-1">
        <div className="container py-3">
          <div className="row g-5">

            {/* ── INFO ── */}
            <div className="col-12 col-lg-4">
              <h2 className="fw-semibold mb-4" style={{ color: '#101828', fontSize: '18px' }}>
                Informações de Contacto
              </h2>

              <div className="d-flex flex-column gap-3 mb-4">
                {INFO.map(item => (
                  <div
                    key={item.label}
                    className="d-flex align-items-start gap-3 p-3"
                    style={{ background: '#f9fafb', borderRadius: '12px' }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '8px', marginTop: '2px' }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="mb-0 small" style={{ color: '#9ca3af' }}>{item.label}</p>
                      <p className="mb-0 fw-medium small" style={{ color: '#101828', whiteSpace: 'pre-line' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SOC */}
              <div
                className="p-4"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaShieldAlt size={16} color="#155dfc" />
                  <span className="fw-semibold small" style={{ color: '#1e3a8a' }}>Incidentes de Segurança</span>
                </div>
                <p className="small mb-1" style={{ color: '#1d4ed8' }}>
                  Para incidentes urgentes, contacte o nosso SOC:
                </p>
                <p className="fw-bold mb-1" style={{ color: '#1e3a8a', fontSize: '18px' }}>+351 800 000 000</p>
                <p className="small mb-0" style={{ color: '#2563eb' }}>Disponível 24/7/365</p>
              </div>
            </div>

            {/* ── FORMULÁRIO ── */}
            <div className="col-12 col-lg-8">
              {enviado ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center py-5">
                    <div
                      className="d-flex align-items-center justify-content-center mx-auto mb-4"
                      style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%' }}
                    >
                      <FiCheckCircle size={32} color="#16a34a" />
                    </div>
                    <h3 className="fw-semibold mb-2" style={{ color: '#101828' }}>Mensagem Enviada!</h3>
                    <p style={{ color: '#4a5565' }}>
                      Recebemos a sua mensagem e entraremos em contacto em breve.
                    </p>
                    <button
                      onClick={() => { setEnviado(false); setForm(FORM_INICIAL); }}
                      className="btn-gradient mt-4"
                    >
                      Enviar Nova Mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="fw-semibold mb-4" style={{ color: '#101828', fontSize: '18px' }}>
                    Envie-nos uma Mensagem
                  </h2>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-medium" style={{ color: '#374151' }}>Nome *</label>
                      <input
                        name="nome"
                        required
                        value={form.nome}
                        onChange={handleChange}
                        className="form-control"
                        style={{ borderRadius: '10px', fontSize: '14px' }}
                        placeholder="O seu nome"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-medium" style={{ color: '#374151' }}>Empresa</label>
                      <input
                        name="empresa"
                        value={form.empresa}
                        onChange={handleChange}
                        className="form-control"
                        style={{ borderRadius: '10px', fontSize: '14px' }}
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-medium" style={{ color: '#374151' }}>E-mail *</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="form-control"
                        style={{ borderRadius: '10px', fontSize: '14px' }}
                        placeholder="email@empresa.pt"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-medium" style={{ color: '#374151' }}>Telefone</label>
                      <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="form-control"
                        style={{ borderRadius: '10px', fontSize: '14px' }}
                        placeholder="+351 9XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium" style={{ color: '#374151' }}>Serviço de Interesse</label>
                    <select
                      name="servico"
                      value={form.servico}
                      onChange={handleChange}
                      className="form-select"
                      style={{ borderRadius: '10px', fontSize: '14px' }}
                    >
                      <option value="">Selecionar serviço...</option>
                      {SERVICOS_OPCOES.map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium" style={{ color: '#374151' }}>Assunto *</label>
                    <input
                      name="assunto"
                      required
                      value={form.assunto}
                      onChange={handleChange}
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '14px' }}
                      placeholder="Assunto da mensagem"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-medium" style={{ color: '#374151' }}>Mensagem *</label>
                    <textarea
                      name="mensagem"
                      required
                      rows={5}
                      value={form.mensagem}
                      onChange={handleChange}
                      className="form-control"
                      style={{ borderRadius: '10px', fontSize: '14px', resize: 'none' }}
                      placeholder="Descreva as suas necessidades de segurança..."
                    />
                  </div>

                  <button type="submit" className="btn-gradient w-100 justify-content-center">
                    <FiSend size={16} /> Enviar Mensagem
                  </button>

                  <p className="text-center mt-3 small" style={{ color: '#9ca3af' }}>
                    Os seus dados são tratados de acordo com o RGPD. Não partilhamos informações com terceiros.
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

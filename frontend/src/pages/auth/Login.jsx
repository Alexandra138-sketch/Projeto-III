import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const DEMO_ACCOUNTS = [
  { role: 'Administrador', email: 'admin@cyberboxsecur.pt',      perfil: 'admin',   nome: 'Admin Demo' },
  { role: 'Gestor',        email: 'joao.silva@cyberboxsecur.pt', perfil: 'gestor',  nome: 'João Silva' },
  { role: 'Empresa Cliente', email: 'seguranca@techcorp.pt',     perfil: 'empresa', nome: 'TechCorp' },
];

const DEMO_PASSWORD = 'demo1234';

function ShieldIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 4L6 10v10c0 8.284 5.94 16.027 14 18 8.06-1.973 14-9.716 14-18V10L20 4z"
        stroke="white"
        strokeWidth="2"
        fill="rgba(255,255,255,0.15)"
      />
      <path
        d="M15 20l3.5 3.5L26 16"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CircleUserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9" r="3" />
      <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Verificar se é uma conta demo
    const demoUser = DEMO_ACCOUNTS.find(acc => acc.email === email);
    if (demoUser && password === DEMO_PASSWORD) {
      login({ nome: demoUser.nome, perfil: demoUser.perfil, email: demoUser.email }, 'demo-token');
      if (demoUser.perfil === 'admin') navigate('/admin');
      else if (demoUser.perfil === 'gestor') navigate('/gestor');
      else navigate('/empresa');
      return;
    }

    // Login real via API
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.utilizador, res.data.token);
      const perfil = res.data.utilizador.perfil;
      if (perfil === 'admin') navigate('/admin');
      else if (perfil === 'gestor') navigate('/gestor');
      else navigate('/empresa');
    } catch (err) {
      setErro('Email ou password incorretos');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <ShieldIcon />
          <span style={styles.brandName}>CyberBoxSecur</span>
          <p style={styles.tagline}>Área Reservada — Acesso Seguro</p>
        </div>

        <div style={styles.body}>
          <h2 style={styles.title}>Iniciar Sessão</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>E-mail</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}><MailIcon /></span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@empresa.pt"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Palavra-passe</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}><LockIcon /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={styles.eyeBtn}
                  aria-label="Mostrar/ocultar palavra-passe"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {erro && <p style={styles.erro}>{erro}</p>}

            <button type="submit" style={styles.submitBtn}>Entrar</button>
          </form>

          <div style={styles.demoSection}>
            <p style={styles.demoLabel}>Contas de demonstração:</p>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword('demo1234'); }}
                style={styles.demoRow}
              >
                <CircleUserIcon />
                <span style={styles.demoRole}>{acc.role}</span>
                <span style={styles.demoEmail}>{acc.email}</span>
              </button>
            ))}
          </div>

          <a href="/" style={styles.backLink}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  );
}

export default Login;

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f5e8ff 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    background: '#fff',
  },
  header: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    padding: '36px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  brandName: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginTop: '4px',
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    margin: '4px 0 0',
    fontWeight: '400',
  },
  body: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 24px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 12px 11px 38px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
  },
  submitBtn: {
    marginTop: '4px',
    padding: '13px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  erro: {
    color: '#ef4444',
    fontSize: '13px',
    margin: '0',
  },
  demoSection: {
    marginTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  demoLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    margin: '0 0 4px',
  },
  demoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    background: '#fafafa',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  demoRole: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    flex: '1',
  },
  demoEmail: {
    fontSize: '12px',
    color: '#6b7280',
  },
  backLink: {
    marginTop: '20px',
    textAlign: 'center',
    display: 'block',
    fontSize: '13px',
    color: '#7c3aed',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

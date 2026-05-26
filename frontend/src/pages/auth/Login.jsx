import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import styles from './Login.styles';

const DEMO_ACCOUNTS = [
  { role: 'Administrador', email: 'admin@cyberboxsecur.pt',      perfil: 'admin',   nome: 'Admin Demo' },
  { role: 'Gestor',        email: 'joao.silva@cyberboxsecur.pt', perfil: 'gestor',  nome: 'João Silva' },
  { role: 'Empresa Cliente', email: 'seguranca@techcorp.pt',     perfil: 'empresa', nome: 'TechCorp' },
];

const DEMO_PASSWORD = 'demo1234';


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
          <img src="../public/img/logo2.png" alt="CyberBoxSecur" style={{ width: '150px', height: 'auto' }} />
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


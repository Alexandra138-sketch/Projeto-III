import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import styles from './Login.styles';


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

    // Login sempre via API real (BD)
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.utilizador, res.data.token);
      const perfil = res.data.utilizador.perfil;
      if (perfil === 'admin') navigate('/admin');
      else if (perfil === 'gestor') navigate('/gestor');
      else navigate('/empresa');
    } catch (err) {
      const msg = err.response?.data?.erro;
      if (msg === 'Utilizador não encontrado') {
        setErro('Email não encontrado. Verifique o endereço.');
      } else if (msg === 'Password incorreta') {
        setErro('Password incorreta. Tente novamente.');
      } else {
        setErro('Não foi possível ligar ao servidor. Verifique se o backend está a correr.');
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src="../public/img/logo.png" alt="CyberBoxSecur" style={{ width: '150px', height: 'auto' }} />
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

          <a href="/" style={styles.backLink}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  );
}

export default Login;


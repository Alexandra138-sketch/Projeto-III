import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import {
  Search, AlertTriangle, MessageSquare, Loader,
  CheckCircle, XCircle, ChevronRight, Users,
} from 'lucide-react';

const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) { return CORES[(parseInt(id, 10) - 1) % CORES.length]; }

function GestorClientes() {
  const navigate      = useNavigate();
  const [clientes,   setClientes]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState('');
  const [pesquisa,   setPesquisa]   = useState('');

  useEffect(() => {
    api.get('/clientes')
      .then(({ data }) => setClientes(data))
      .catch(() => setErro('Não foi possível carregar os clientes.'))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados   = clientes.filter((c) =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.email?.toLowerCase().includes(pesquisa.toLowerCase())
  );
  const totalAtivos = clientes.filter((c) => c.estado === 'Ativo').length;

  return (
    <AdminLayout>

      {/* Banner */}
      <div className="dash-banner">
        <h4>Os Meus Clientes</h4>
        <p>Visualize e comunique com os clientes sob a sua gestão.</p>
        <div className="row g-3">
          {[
            { numero: carregando ? '…' : clientes.length,  label: 'Total'      },
            { numero: carregando ? '…' : totalAtivos,       label: 'Ativos'     },
            { numero: carregando ? '…' : clientes.reduce((s, c) => s + (c.total_incidentes ?? 0), 0), label: 'Incidentes' },
            { numero: carregando ? '…' : clientes.reduce((s, c) => s + (c.total_documentos ?? 0), 0), label: 'Documentos' },
          ].map((s) => (
            <div className="col-6 col-md-3" key={s.label}>
              <div className="stat-card">
                <div className="stat-number">{s.numero}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pesquisa */}
      <div className="dash-card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou e-mail…"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.1rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ margin: 0 }}>A carregar clientes…</p>
        </div>
      ) : erro ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
          <AlertTriangle size={28} style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>{erro}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Users size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>
            {pesquisa ? 'Nenhum cliente encontrado.' : 'Não tem clientes atribuídos.'}
          </p>
          {!pesquisa && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
              Contacte o administrador para lhe atribuir clientes.
            </p>
          )}
        </div>
      ) : (
        filtrados.map((c) => {
          const ativo = c.estado === 'Ativo';
          const cor   = getCor(c.id);
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/gestor/clientes/${c.id}`)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, marginBottom: '0.75rem', cursor: 'pointer' }}
            >
              <div
                className="dash-card incidente-card"
                style={{ marginBottom: 0, transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
              >
                <div className="d-flex align-items-center gap-3">

                  {/* Avatar */}
                  <div
                    className="cliente-avatar"
                    style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: ativo ? cor : '#94a3b8', flexShrink: 0 }}
                  >
                    {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <p className="incidente-nome">{c.nome}</p>
                      <span className="badge-pill" style={{ background: ativo ? '#dcfce7' : '#f1f5f9', color: ativo ? '#16a34a' : '#94a3b8' }}>
                        {ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {' '}{ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      {c.incidentes_abertos > 0 && (
                        <span className="badge-pill" style={{ background: '#fee2e2', color: '#dc2626' }}>
                          <AlertTriangle size={10} /> {c.incidentes_abertos} incidente{c.incidentes_abertos > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="incidente-descricao" style={{ margin: 0 }}>{c.email}</p>
                  </div>

                  {/* Métricas */}
                  <div className="d-none d-md-flex gap-4 flex-shrink-0" style={{ marginRight: '0.5rem' }}>
                    {[
                      { val: c.total_incidentes ?? 0, label: 'Incidentes', cor: '#f97316' },
                      { val: c.total_documentos ?? 0, label: 'Documentos', cor: '#3b82f6' },
                      { val: c.total_mensagens  ?? 0, label: 'Mensagens',  cor: '#22c55e' },
                    ].map(({ val, label, cor: c2 }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: c2, margin: 0 }}>{val}</p>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat badge + seta */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#2563eb', borderRadius: 8, padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      <MessageSquare size={13} /> Chat
                    </div>
                    <ChevronRight size={18} color="#d1d5db" />
                  </div>

                </div>
              </div>
            </button>
          );
        })
      )}

    </AdminLayout>
  );
}

export default GestorClientes;

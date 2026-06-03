import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api/axios';
import {
  Search, X, Mail, Phone, Users, FileText,
  AlertTriangle, MessageSquare, CheckCircle, XCircle, Loader,
} from 'lucide-react';

/* ── Cor gerada pelo ID ── */
const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];
function getCor(id) { return CORES[(parseInt(id, 10) - 1) % CORES.length]; }

/* ── Modal de detalhe ── */
function ModalCliente({ cliente, onClose }) {
  if (!cliente) return null;
  const ativo = cliente.estado === 'Ativo';
  const cor   = getCor(cliente.id);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="dash-card"
        style={{ width: '100%', maxWidth: 520, margin: 0, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="cliente-avatar"
              style={{ width: 48, height: 48, fontSize: '1.1rem', backgroundColor: ativo ? cor : '#94a3b8', borderRadius: 12 }}
            >
              {cliente.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h5 className="mb-0" style={{ fontSize: '1rem', fontWeight: 700 }}>{cliente.nome}</h5>
              <span className={ativo ? 'badge-ativo' : 'badge-inativo'}>
                {ativo ? '● Ativo' : '○ Inativo'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Contactos */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
            Contactos da Empresa
          </p>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Mail size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{cliente.email}</span>
          </div>
          {cliente.telefone && (
            <div className="d-flex align-items-center gap-2">
              <Phone size={14} color="#94a3b8" />
              <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{cliente.telefone}</span>
            </div>
          )}
        </div>

        {/* Gestor */}
        {(cliente.gestor || cliente.gestor_nome) && (
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.85rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
              Gestor Responsável
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              {cliente.gestor?.nome || cliente.gestor_nome}
            </p>
            {cliente.gestor?.email && (
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{cliente.gestor.email}</p>
            )}
          </div>
        )}

        {/* Estatísticas */}
        <div className="row g-2 mb-3">
          {[
            { label: 'Incidentes', valor: cliente.total_incidentes ?? 0, cor: '#ef4444', bg: '#fef2f2' },
            { label: 'Documentos', valor: cliente.total_documentos ?? 0, cor: '#2563eb', bg: '#eff6ff' },
            { label: 'Mensagens',  valor: cliente.total_mensagens  ?? 0, cor: '#16a34a', bg: '#f0fdf4' },
          ].map(({ label, valor, cor: c, bg }) => (
            <div className="col-4" key={label}>
              <div style={{ background: bg, borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: c, margin: 0 }}>{valor}</p>
                <p style={{ fontSize: '0.72rem', color: c, margin: 0, fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        {cliente.created_at && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-PT')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Componente principal ── */
function GestorClientes() {
  const [clientes,    setClientes]    = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [erro,        setErro]        = useState('');
  const [pesquisa,    setPesquisa]    = useState('');
  const [selecionado, setSelecionado] = useState(null);

  /* ── Buscar clientes da API (Axios) ── */
  useEffect(() => {
    api.get('/clientes')
      .then(({ data }) => setClientes(data))
      .catch(() => setErro('Não foi possível carregar os clientes.'))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados   = clientes.filter((c) =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.email.toLowerCase().includes(pesquisa.toLowerCase())
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
            style={{
              width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.1rem',
              borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Conteúdo */}
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
      ) : (
        <div className="row g-3">
          {filtrados.length === 0 ? (
            <div className="col-12">
              <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                {pesquisa ? 'Nenhum cliente encontrado.' : 'Sem clientes atribuídos.'}
              </div>
            </div>
          ) : filtrados.map((c) => {
            const ativo = c.estado === 'Ativo';
            const cor   = getCor(c.id);
            return (
              <div className="col-12 col-md-6" key={c.id}>
                <div
                  className="dash-card"
                  style={{ marginBottom: 0, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => setSelecionado(c)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="cliente-avatar"
                        style={{ width: 44, height: 44, fontSize: '1rem', backgroundColor: ativo ? cor : '#94a3b8', borderRadius: 12 }}
                      >
                        {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="cliente-nome" style={{ fontSize: '0.95rem' }}>{c.nome}</p>
                        <p className="cliente-email">{c.email}</p>
                      </div>
                    </div>
                    <span className={ativo ? 'badge-ativo' : 'badge-inativo'}>
                      {ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {' '}{ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {c.gestor_nome && (
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.55rem 0.85rem', marginBottom: '0.85rem' }}>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
                        Gestor Responsável
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500, margin: 0 }}>{c.gestor_nome}</p>
                    </div>
                  )}

                  <div className="d-flex gap-4">
                    {[
                      { val: c.total_incidentes ?? 0, label: 'Incidentes' },
                      { val: c.total_documentos ?? 0, label: 'Documentos' },
                      { val: c.total_mensagens  ?? 0, label: 'Mensagens'  },
                    ].map(({ val, label }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{val}</p>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalCliente cliente={selecionado} onClose={() => setSelecionado(null)} />

    </AdminLayout>
  );
}

export default GestorClientes;

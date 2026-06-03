import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  FiSearch, FiX, FiMail, FiPhone, FiUser,
  FiShield, FiFileText, FiAlertTriangle,
} from 'react-icons/fi';

/* ── Dados de demonstração ── */

const CLIENTES_INICIAIS = [
  {
    id: 1,
    nome: 'Tech Corp Portugal',
    email: 'seguranca@techcorp.pt',
    telefone: '+351 215 000 100',
    cor: '#3b82f6',
    ativo: true,
    criadoEm: '2024-01-15',
    responsavelSeguranca: { nome: 'Carlos Mendes',   email: 'c.mendes@techcorp.pt',   telefone: '+351 916 000 004' },
    contatoPermanente:    { nome: 'Sofia Lopes',     email: 's.lopes@techcorp.pt',    telefone: '+351 917 000 005' },
    incidentes: 3,
    documentos: 6,
  },
  {
    id: 2,
    nome: 'Retail Group SA',
    email: 'it@retailgroup.pt',
    telefone: '+351 218 000 200',
    cor: '#8b5cf6',
    ativo: true,
    criadoEm: '2024-03-08',
    responsavelSeguranca: { nome: 'Miguel Ferreira', email: 'm.ferreira@retailgroup.pt', telefone: '+351 918 000 006' },
    contatoPermanente:    { nome: 'Inês Pereira',    email: 'i.pereira@retailgroup.pt',  telefone: '+351 919 000 007' },
    incidentes: 2,
    documentos: 4,
  },
  {
    id: 3,
    nome: 'FinBank Portugal',
    email: 'ciso@finbank.pt',
    telefone: '+351 213 000 300',
    cor: '#10b981',
    ativo: true,
    criadoEm: '2024-05-20',
    responsavelSeguranca: { nome: 'Ricardo Nunes',   email: 'r.nunes@finbank.pt',  telefone: '+351 920 000 008' },
    contatoPermanente:    { nome: 'Beatriz Santos',  email: 'b.santos@finbank.pt', telefone: '+351 921 000 009' },
    incidentes: 1,
    documentos: 8,
  },
];

/* ── Modal de detalhe ── */

function ModalCliente({ cliente, onClose }) {
  if (!cliente) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        background: 'rgba(15, 23, 42, 0.45)',
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
              style={{ width: 48, height: 48, fontSize: '1.1rem', backgroundColor: cliente.cor }}
            >
              {cliente.nome[0]}
            </div>
            <div>
              <h5 className="mb-0">{cliente.nome}</h5>
              <span className={cliente.ativo ? 'badge-ativo' : 'badge-inativo'}>
                {cliente.ativo ? '● Ativo' : '○ Inativo'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Contactos */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
            Contactos da Empresa
          </p>
          <div className="d-flex align-items-center gap-2 mb-2">
            <FiMail size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{cliente.email}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FiPhone size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{cliente.telefone}</span>
          </div>
        </div>

        {/* Responsável + Contacto */}
        <div className="row g-2 mb-3">
          {[
            { titulo: 'Responsável de Segurança', dados: cliente.responsavelSeguranca, icon: FiShield },
            { titulo: 'Contacto Permanente',      dados: cliente.contatoPermanente,    icon: FiUser  },
          ].map(({ titulo, dados, icon: Icone }) => (
            <div className="col-12 col-sm-6" key={titulo}>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.85rem' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Icone size={13} color="#64748b" />
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
                    {titulo}
                  </p>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{dados.nome}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 2 }}>{dados.email}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{dados.telefone}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas */}
        <div className="row g-2 mb-3">
          {[
            { label: 'Incidentes', valor: cliente.incidentes, icon: FiAlertTriangle, cor: '#ef4444', bg: '#fef2f2' },
            { label: 'Documentos', valor: cliente.documentos, icon: FiFileText,      cor: '#2563eb', bg: '#eff6ff' },
          ].map(({ label, valor, icon: Icone, cor, bg }) => (
            <div className="col-6" key={label}>
              <div style={{ background: bg, borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                <Icone size={16} color={cor} style={{ marginBottom: 4 }} />
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: cor, margin: 0 }}>{valor}</p>
                <p style={{ fontSize: '0.72rem', color: cor, margin: 0, fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div
          className="d-flex justify-content-between align-items-center pt-2"
          style={{ borderTop: '1px solid #f1f5f9' }}
        >
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Cliente desde {cliente.criadoEm}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */

function GestorClientes() {
  const [clientes]      = useState(CLIENTES_INICIAIS);
  const [pesquisa, setPesquisa]       = useState('');
  const [selecionado, setSelecionado] = useState(null);

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.email.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <AdminLayout>

      {/* Banner */}
      <div className="dash-banner">
        <h4>Os Meus Clientes</h4>
        <p>Visualize e comunique com os clientes sob a sua gestão.</p>
        <div className="row g-3">
          {[
            { numero: clientes.filter((c) => c.ativo).length,  label: 'Clientes Ativos'  },
            { numero: clientes.reduce((s, c) => s + c.incidentes, 0), label: 'Total Incidentes' },
            { numero: clientes.reduce((s, c) => s + c.documentos, 0), label: 'Total Documentos' },
          ].map((s) => (
            <div className="col-6 col-md-4" key={s.label}>
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
          <FiSearch
            size={15}
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
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

      {/* Cards */}
      <div className="row g-3">
        {filtrados.map((c) => (
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
                    style={{ width: 44, height: 44, fontSize: '1rem', backgroundColor: c.cor }}
                  >
                    {c.nome[0]}
                  </div>
                  <div>
                    <p className="cliente-nome" style={{ fontSize: '0.95rem' }}>{c.nome}</p>
                    <p className="cliente-email">{c.email}</p>
                  </div>
                </div>
                <span className={c.ativo ? 'badge-ativo' : 'badge-inativo'}>
                  {c.ativo ? '● Ativo' : '○ Inativo'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.6rem 0.85rem', marginBottom: '0.85rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
                  Responsável de Segurança
                </p>
                <p style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500, margin: 0 }}>
                  {c.responsavelSeguranca.nome}
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-3">
                  {[
                    { label: 'Incidentes', valor: c.incidentes },
                    { label: 'Documentos', valor: c.documentos },
                  ].map(({ label, valor }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{valor}</p>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="col-12">
            <div className="dash-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              Nenhum cliente encontrado.
            </div>
          </div>
        )}
      </div>

      <ModalCliente
        cliente={selecionado}
        onClose={() => setSelecionado(null)}
      />

    </AdminLayout>
  );
}

export default GestorClientes;

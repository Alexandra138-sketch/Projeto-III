import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Mail, Phone, FileText, Shield, AlertTriangle, MessageSquare, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const CLIENTES = [
  { id: 'c1', nome: 'Tech Corp Portugal',  email: 'seguranca@techcorp.pt',  telefone: '+351 215 000 100', cor: '#3b82f6', ativo: true,  criadoEm: '2024-05-20', gestorResponsavel: 'João Silva', responsavelSeguranca: { nome: 'Carlos Mendes',   email: 'c.mendes@techcorp.pt',     telefone: '+351 916 000 004' }, contatoPermanente: { nome: 'Sofia Lopes',    email: 's.lopes@techcorp.pt',     telefone: '+351 917 000 005' }, documentos: 3, pentests: 2, incidentes: 3, mensagens: 4, incidentesAbertos: 1 },
  { id: 'c2', nome: 'Retail Group SA',     email: 'it@retailgroup.pt',      telefone: '+351 218 000 200', cor: '#8b5cf6', ativo: true,  criadoEm: '2024-03-08', gestorResponsavel: 'Ana Costa',  responsavelSeguranca: { nome: 'Miguel Ferreira', email: 'm.ferreira@retailgroup.pt', telefone: '+351 918 000 006' }, contatoPermanente: { nome: 'Inês Pereira',  email: 'i.pereira@retailgroup.pt', telefone: '+351 919 000 007' }, documentos: 4, pentests: 1, incidentes: 2, mensagens: 2, incidentesAbertos: 1 },
  { id: 'c3', nome: 'FinBank Portugal',    email: 'ciso@finbank.pt',        telefone: '+351 213 000 300', cor: '#10b981', ativo: true,  criadoEm: '2024-05-20', gestorResponsavel: 'João Silva', responsavelSeguranca: { nome: 'Ricardo Nunes',   email: 'r.nunes@finbank.pt',       telefone: '+351 920 000 008' }, contatoPermanente: { nome: 'Beatriz Santos', email: 'b.santos@finbank.pt',      telefone: '+351 921 000 009' }, documentos: 8, pentests: 1, incidentes: 1, mensagens: 0, incidentesAbertos: 0 },
  { id: 'c4', nome: 'MediSafe Clinic',     email: 'admin@medisafe.pt',      telefone: '+351 222 000 400', cor: '#f59e0b', ativo: false, criadoEm: '2024-07-01', gestorResponsavel: 'Ana Costa',  responsavelSeguranca: { nome: 'Ana Rodrigues',   email: 'a.rodrigues@medisafe.pt',  telefone: '+351 922 000 010' }, contatoPermanente: { nome: 'Luís Faria',    email: 'l.faria@medisafe.pt',      telefone: '+351 923 000 011' }, documentos: 3, pentests: 1, incidentes: 1, mensagens: 5, incidentesAbertos: 0 },
];

function AdminClientes() {
  const navigate = useNavigate();
  const [pesquisa, setPesquisa]     = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('all');

  const filtrados = CLIENTES.filter((c) => {
    const matchP = c.nome.toLowerCase().includes(pesquisa.toLowerCase()) || c.email.toLowerCase().includes(pesquisa.toLowerCase());
    const matchA = filtroAtivo === 'all' || (filtroAtivo === 'active' && c.ativo) || (filtroAtivo === 'inactive' && !c.ativo);
    return matchP && matchA;
  });

  return (
    <AdminLayout>
      {/* Cabeçalho */}
      <div className="clientes-header">
        <div>
          <h4 className="clientes-titulo">Gestão de Clientes</h4>
          <p className="clientes-subtitulo">{CLIENTES.filter((c) => c.ativo).length} clientes ativos · {CLIENTES.filter((c) => !c.ativo).length} inativos</p>
        </div>
        <div className="clientes-total-badge">
          <Users size={16} />
          {CLIENTES.length} no total
        </div>
      </div>

      {/* Filtros */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <div className="pesquisa-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} />
          <input placeholder="Pesquisar por nome ou e-mail..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        </div>
        <div className="filtro-tabs">
          {[{ k: 'all', l: 'Todos' }, { k: 'active', l: 'Ativos' }, { k: 'inactive', l: 'Inativos' }].map((opt) => (
            <button key={opt.k} className={`filtro-tab ${filtroAtivo === opt.k ? 'ativo' : 'inativo-tab'}`} onClick={() => setFiltroAtivo(opt.k)}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Nenhum cliente corresponde aos critérios de pesquisa.
        </div>
      ) : filtrados.map((c) => (
        <button key={c.id} className="cliente-card" onClick={() => navigate(`/admin/clientes/${c.id}`)}>
          <div className="d-flex align-items-start gap-3">
            {/* Avatar */}
            <div className="cliente-avatar" style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: c.ativo ? c.cor : '#94a3b8' }}>
              {c.nome.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <p className="cliente-nome">{c.nome}</p>
                <span className="badge-pill" style={{ background: c.ativo ? '#dcfce7' : '#f1f5f9', color: c.ativo ? '#16a34a' : '#94a3b8' }}>
                  {c.ativo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </span>
                {c.incidentesAbertos > 0 && (
                  <span className="badge-pill" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    <AlertTriangle size={10} /> {c.incidentesAbertos} incidente{c.incidentesAbertos > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="d-flex flex-wrap gap-3 mb-2">
                <span className="perfil-meta"><Mail size={12} /> {c.email}</span>
                <span className="perfil-meta"><Phone size={12} /> {c.telefone}</span>
              </div>
              <div className="d-flex flex-wrap gap-4">
                {[
                  { Icone: FileText,      cor: '#3b82f6', val: c.documentos, label: 'documentos' },
                  { Icone: Shield,        cor: '#8b5cf6', val: c.pentests,   label: 'pentests'   },
                  { Icone: AlertTriangle, cor: '#f97316', val: c.incidentes, label: 'incidentes' },
                  { Icone: MessageSquare, cor: '#22c55e', val: c.mensagens,  label: 'mensagens'  },
                ].map(({ Icone, cor, val, label }) => (
                  <span key={label} className="cliente-metrica">
                    <Icone size={13} color={cor} />
                    <strong>{val}</strong> {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Contacto + seta */}
            <div className="d-none d-lg-flex flex-column align-items-end gap-1" style={{ flexShrink: 0, minWidth: 180 }}>
              {c.gestorResponsavel && (
                <div className="text-end">
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Gestor responsável</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', margin: 0 }}>{c.gestorResponsavel}</p>
                </div>
              )}
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Desde {c.criadoEm}</p>
            </div>
            <ChevronRight size={18} color="#d1d5db" style={{ flexShrink: 0, marginTop: 2 }} />
          </div>
        </button>
      ))}
    </AdminLayout>
  );
}

export default AdminClientes;
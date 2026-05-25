import Sidebar from './Sidebar';
import AdminTopbar from './AdminTopbar';
import './layout.css';

function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper">
      <Sidebar />
      <div className="admin-main">
        <AdminTopbar />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

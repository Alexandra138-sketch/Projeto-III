import Sidebar from './Sidebar';
import AdminTopbar from './AdminTopbar';
import './layout.css';

function AdminLayout({ children, contentClass }) {
  return (
    <div className="admin-wrapper">
      <Sidebar />
      <div className="admin-main">
        <AdminTopbar />
        <main className={contentClass || 'admin-content'}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

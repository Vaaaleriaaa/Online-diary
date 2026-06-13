import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminHeader.module.css';  // ← ДОБАВИТЬ!

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>

      <Link to="/admin/schedule">
        <span className={styles.logoText}>Лампа</span>
      </Link>
      
      
      <nav className={styles.nav}>
        <Link to="/admin/schedule" className={styles.navLink}>Расписание</Link>
        <Link to="/admin/students" className={styles.navLink}>Ученики</Link>
        <Link to="/admin/teachers" className={styles.navLink}>Учителя</Link>
      </nav>
      
      <div className={styles.userMenu}>
        <Link to="/admin/profile" className={styles.profileLink}>
          <span className={styles.profileName}>
            {user?.lastName} {user?.firstName}
          </span>
        </Link>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Выход
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
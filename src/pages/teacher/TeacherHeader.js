import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TeacherHeader.module.css';

const TeacherHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>

      <Link to="/teacher/schedule">
        <span className={styles.logoText}>Лампа</span>
      </Link>
      
      
      <nav className={styles.nav}>
        <Link to="/teacher/schedule" className={styles.navLink}>Расписание</Link>
        <Link to="/teacher/journal" className={styles.navLink}>Журнал</Link>
        <Link to="/teacher/homework" className={styles.navLink}>Домашние задания</Link>
      </nav>
      
      <div className={styles.userMenu}>
        <Link to="/teacher/profile" className={styles.profileLink}>
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

export default TeacherHeader;
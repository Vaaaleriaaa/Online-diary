import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './StudentHeader.module.css';  // ← ДОБАВИТЬ!

const StudentHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>

      <Link to="/student/schedule">
        <span className={styles.logoText}>Лампа</span>
      </Link>
      
      
      <nav className={styles.nav}>
        <Link to="/student/schedule" className={styles.navLink}>Расписание</Link>
        <Link to="/student/journal" className={styles.navLink}>Оценки и посещаемость</Link>
        <Link to="/student/homework" className={styles.navLink}>Домашние задания</Link>
      </nav>
      
      <div className={styles.userMenu}>
        <Link to="/student/profile" className={styles.profileLink}>
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

export default StudentHeader;
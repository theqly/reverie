import React from 'react';
import styles from './Header.module.css';
import logo from '../assets/Reverie.svg';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleProfile = () => navigate('/profile');
  const handleLogoClick = () => navigate('/feed');

  return (
    <header className={styles.collectionHeader}>
      <div className={styles.header_container}>
        <button onClick={handleLogoClick} className={styles.logoButton} aria-label="На главную">
          <img src={logo} alt="Reverie" className={styles.rev_logo} />
        </button>

        <input
          className={styles.search_input}
          placeholder="Поиск..."
        />
        <button onClick={handleProfile} className={styles.profileBtn}></button>
      </div>
    </header>
  );
};

export default Header;

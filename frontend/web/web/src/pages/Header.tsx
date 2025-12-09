import styles from './Header.module.css';
import logo from '../assets/Reverie.svg';
import { useNavigate } from 'react-router-dom';




const Header = () => {
  const navigate = useNavigate();

   const handleProfile = () => {
    // Пока заглушка - всегда авторизован
    navigate('/profile');
    
    // Позже добавишь проверку:
    // if (isAuthenticated) {
    //   navigate('/collection/create');
    // } else {
    //   showAuthModal();
    // }
  };

  return (
    <header className={styles.collectionHeader}>
      <div className={styles.header_container}>
        <img src={logo} alt="Logo" className={styles.rev_logo} />
        <input className={styles.search_input} placeholder="Поиск..." />
        <button onClick={handleProfile} className={styles.profileBtn}></button>
      </div>
    </header>
  );
};

export default Header;

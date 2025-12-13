import styles from './Header.module.css';
import logo from '../assets/Reverie.svg';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/feed');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Обработка поиска при нажатии Enter
      console.log('Поиск:', e.target.value);
      // Можно добавить навигацию на страницу поиска
      // navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
    }
  };

  return (
    <header className={styles.collectionHeader}>
      <div className={styles.header_container}>
        {/* Кликабельный логотип */}
        <button 
          onClick={handleLogoClick} 
          className={styles.logoButton}
          aria-label="На главную"
        >
          <img src={logo} alt="Reverie" className={styles.rev_logo} />
        </button>
        
        <input 
          className={styles.search_input} 
          placeholder="Поиск..."
          onKeyDown={handleSearchKeyDown}
        />
        <button onClick={handleProfile} className={styles.profileBtn}></button>
      </div>
    </header>
  );
};

export default Header;
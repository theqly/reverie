import styles from './Header.module.css';
import logo from '../assets/Reverie.svg';

const Header = () => {
  return (
    <header className={styles.collectionHeader}>
      <div className={styles.header_container}>
        <img src={logo} alt="Logo" className={styles.rev_logo} />
        <input className={styles.search_input} placeholder="Поиск..." />
      </div>
    </header>
  );
};

export default Header;

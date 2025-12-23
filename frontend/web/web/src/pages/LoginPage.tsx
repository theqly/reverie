import { useEffect } from "react";
import styles from "./LoginPage.module.css";
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, register } = useAuth();

  // Если пользователь уже авторизован — редирект на feed
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/feed');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    login();
  };

  const handleRegister = () => {
    register();
  };

  const handleBack = () => {
    navigate('/feed');
  };

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div>
        <Header />
        <div className={styles.container}>
          <div className={styles.loginBox}>
            <h2>Загрузка...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className={styles.h_container}>
        <button onClick={handleBack} className={styles.back_btn}></button>
        <h2>Войдите в аккаунт</h2>
      </div>

      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h2>Авторизация</h2>

          <p className={styles.description}>
            Войдите в систему или зарегистрируйтесь, чтобы получить доступ ко всем функциям.
          </p>

          <button className={styles.mainButton} onClick={handleLogin}>
            Войти
          </button>

          <button className={styles.googleButton} onClick={handleRegister}>
            Зарегистрироваться
          </button>

          <p className={styles.info}>
            Авторизация происходит через безопасную систему Keycloak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

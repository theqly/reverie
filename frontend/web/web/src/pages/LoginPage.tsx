import { useState } from "react";
import styles from "./LoginPage.module.css";
// import { login, loginWithGoogle, sendResetLink } from "../services/authService";
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 



const LoginPage = () => {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // ============================
  //      ЗАГЛУШКИ "БЭКА"
  // ============================

  const mockDatabase = [
    { login: "yana", password: "12345", email: "yana@example.com" },
    { login: "oleg", password: "password", email: "oleg@example.com" },
  ];

  const mockLogin = async (login: string, pass: string) => {

    const user = mockDatabase.find(
      (u) => u.login === login && u.password === pass
    );

    await new Promise((res) => setTimeout(res, 400));

    if (user) {
      return { success: true, role: "User", permissions: "Permission_user" };
    }

    return { success: false };
  };

  const mockSendResetLink = async (email: string) => {
    await new Promise((res) => setTimeout(res, 400));

    const user = mockDatabase.find((u) => u.email === email);

    if (!user) {
      return { success: false };
    }

    return { success: true };
  };

  const mockGoogleLogin = async () => {
    
    await new Promise((res) => setTimeout(res, 400));

    const success = Math.random() > 0.3; // 70% успеха (заглушка)

    if (success) {
      return { success: true, role: "User", permissions: "Permission_user" };
    }

    return { success: false };
  };

  // ============================
  //          HANDLERS
  // ============================

  const handleLogin = async () => {
    setError("");

    const response = await mockLogin(loginValue, password);

    if (response.success) {
      console.log("Авторизация успешна → роль User, переход на главную");
      // navigate("/") — позже добавишь редирект
    } else {
      setError("Неверно введены логин или пароль");
    }
  };

  const handleGoogle = async () => {
    const response = await mockGoogleLogin();

    if (response.success) {
      console.log("Google Login OK → роль User, переход на главную");
    } else {
      setError("Авторизация через Google не выполнена");
    }
  };

  const handleSendReset = async () => {
    setResetMessage("");

    const response = await mockSendResetLink(resetEmail);

    if (response.success) {
      setResetMessage("Письмо отправлено! Проверьте почту.");
    } else {
      setResetMessage(
        "Аккаунт с введенным Email не найден. Проверьте введенный адрес или зарегистрируйтесь."
      );
    }
  };
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/pin/create');
    };

  // ============================
  //          RENDER
  // ============================

  return (
    <div>
        <Header />
        <div className={styles.h_container}>

            <button onClick={handleBack} className={styles.back_btn}></button>
            <h2>Войдите в аккаунт</h2>
        </div >
            
        <div className={styles.container}>
            

        <div className={styles.loginBox}>
            {!isResetMode ? (
            <>
                <h2>Авторизация</h2>

                <input
                type="text"
                placeholder="Логин"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                className={styles.input}
                />

                <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                />

                {error && <div className={styles.error}>{error}</div>}

                <button className={styles.mainButton} onClick={handleLogin}>
                Войти
                </button>

                <button className={styles.googleButton} onClick={handleGoogle}>
                Войти через Google
                </button>

                <button
                className={styles.resetLink}
                onClick={() => setIsResetMode(true)}
                >
                Забыли пароль?
                </button>
            </>
            ) : (
            <>
                <h2>Восстановление пароля</h2>

                <input
                type="email"
                placeholder="Введите Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={styles.input}
                />

                <button className={styles.mainButton} onClick={handleSendReset}>
                Отправить ссылку
                </button>

                {resetMessage && (
                <div className={styles.info}>
                    {resetMessage}{" "}
                    {resetMessage.includes("зарегистрируйтесь") && (
                    <a href="/register" className={styles.link}>
                        зарегистрируйтесь
                    </a>
                    )}
                </div>
                )}

                <button
                className={styles.resetBack}
                onClick={() => setIsResetMode(false)}
                >
                ← Назад
                </button>
            </>
            )}
        </div>
        </div>
    </div>
  );
  
};

export default LoginPage;

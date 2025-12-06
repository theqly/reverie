import styles from "./SettingsModal.module.css";

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Настройки</h2>

        <div className={styles.list}>
          <button className={styles.item}>Сменить пароль</button>
          <button className={styles.item}>Уведомления</button>
          <button className={styles.item}>Конфиденциальность</button>
          <button className={styles.item}>Язык</button>
          <button className={styles.item}>Поддержка</button>
        </div>

        <button className={styles.logout}>Выйти</button>

        <button className={styles.close} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;

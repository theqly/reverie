import { useState } from "react";
import styles from "./ShareModal.module.css";

const ShareModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const profileUrl = window.location.href;

  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Поделиться профилем</h2>

        <div className={styles.field}>
          <input readOnly value={profileUrl} className={styles.input} />
          <button onClick={copyLink} className={styles.copyBtn}>
            {copied ? "Скопировано!" : "Копировать"}
          </button>
        </div>

        <button className={styles.close} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ShareModal;

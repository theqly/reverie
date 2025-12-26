import { useState } from "react";
import styles from "./ShareModal.module.css";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) return null;

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

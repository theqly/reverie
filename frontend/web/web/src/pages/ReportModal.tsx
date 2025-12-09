import { useState } from "react";
import styles from "./ReportModal.module.css";

const REASONS = [
  "Spam or fraud",
  "Fake account",
  "Hate speech or discrimination",
  "Privacy violation",
  "Other",
];

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  // ШАГИ: 1 — выбор причины, 2 — ввод текста
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState(null);
  const [text, setText] = useState("");

  const textLimit = 250;
  const textLength = text.length;

  const isTextValid = textLength > 0 && textLength <= textLimit;

  const handleSend = () => {
    if (!isTextValid) return;

    onSubmit({
      reason,
      text,
    });

    // Закрываем после отправки
    onClose();

    // Сбрасываем после закрытия
    setTimeout(() => {
      setStep(1);
      setReason(null);
      setText("");
    }, 300);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Report user</h2>

        {/* ---------------------- STEP 1 ---------------------- */}
        {step === 1 && (
          <>
            <div className={styles.reasonList}>
              {REASONS.map((r) => (
                <button
                  key={r}
                  className={`${styles.reasonItem} ${
                    reason === r ? styles.selected : ""
                  }`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              className={`${styles.continueBtn} ${
                !reason ? styles.disabled : ""
              }`}
              disabled={!reason}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </>
        )}

        {/* ---------------------- STEP 2 ---------------------- */}
        {step === 2 && (
          <>
            <textarea
              className={`${styles.textarea} ${
                textLength === 0 || textLength > textLimit
                  ? styles.invalid
                  : ""
              }`}
              placeholder="Describe the issue…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300} /* чуть больше, чтобы подсветка работала */
            />

            <div
              className={`${styles.counter} ${
                textLength === 0 || textLength > textLimit
                  ? styles.invalidText
                  : ""
              }`}
            >
              {textLength}/{textLimit}
            </div>

            <button
              className={`${styles.sendBtn} ${
                !isTextValid ? styles.disabled : ""
              }`}
              disabled={!isTextValid}
              onClick={handleSend}
            >
              Send
            </button>
          </>
        )}

        <button className={styles.closeBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ReportModal;

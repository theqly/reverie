// AddPinModal.tsx (или можно вставить прямо внутри CreateCollectionPage)
import React from "react";
import styles from "./AddPinModal.module.css";

interface AddPinModalProps {
  onClose: () => void;
}

const AddPinModal: React.FC<AddPinModalProps> = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header_container}>
            <h2 className={styles.title}>Add pin to collection</h2>
            <button className={styles.closeBtn} onClick={onClose}></button>
        </div>
        

        <button className={styles.option}>Create a new pin</button>
        <button className={styles.option}>Add from My pins</button>
        <button className={styles.option}>Add from Likes</button>
        <button className={styles.option}>Add from Bookmarks</button>
        <button className={styles.option}>Add by link</button>

        
      </div>
    </div>
  );
};

export default AddPinModal;

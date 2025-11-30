import React from "react";
import styles from "./InviteCollaboratorModal.module.css";

interface InviteCollaboratorModalProps {
  onClose: () => void;
  onAddCollaborator: (name: string) => void; // ← добавили
}

const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  onClose,
  onAddCollaborator
}) => {

  const handleAdd = () => {
    const name = `Collaborator ${Math.floor(Math.random() * 1000)}`;
    onAddCollaborator(name);   // ← уведомляем родителя
    onClose();                 // закрываем модалку
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header_container}>
          <h2 className={styles.title}>Invite to collaborate</h2>
          <button className={styles.closeBtn} onClick={onClose}></button>
        </div>

        <button className={`${styles.option} ${styles.first}`}>
          Pick from Followers
        </button>

        <button className={styles.option} onClick={handleAdd}>
          Find by Nickname
        </button>

        <button className={styles.option}>Invite to Reverie</button>
      </div>
    </div>
  );
};

export default InviteCollaboratorModal;

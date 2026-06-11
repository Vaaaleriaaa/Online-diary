import React, { useState } from 'react';
import styles from './LessonSlotRow.module.css';

import SaveButton from '../../UI/SaveButton';
import CancelButton from '../../UI/CancelButton';
import EditButton from '../../UI/EditButton';
import DeleteButton from '../../UI/DeleteButton';

const LessonSlotRow = ({ slot, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    lesson_number: slot.lesson_number,
    start_time: slot.start_time.slice(0, 5),
    end_time: slot.end_time.slice(0, 5),
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      lesson_number: slot.lesson_number,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'lesson_number') {
      const num = parseInt(value);
      if (num < 1 || num > 8) {
        alert('Номер урока должен быть от 1 до 8');
        return;
      }
    }

    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const lessonNum = parseInt(editForm.lesson_number);
  
    if (lessonNum < 1 || lessonNum > 8) {
      alert('Номер урока должен быть от 1 до 8');
      return;
    }
    
    // Проверка времени: начало не может быть позже конца
    if (editForm.start_time >= editForm.end_time) {
      alert('Время начала не может быть позже времени окончания');
      return;
    }
    
    onUpdate(slot.slot_id, editForm);
    setIsEditing(false);
  };

  const handleDelete = () => {
      onDelete(slot.slot_id);    
  };

  

  return (
    <tr className={styles.row}>
      {/* Номер урока */}
      <td className={styles.numberCell}>
        {isEditing ? (
          <input
            type="number"
            name="lesson_number"
            value={editForm.lesson_number}
            onChange={handleChange}
            className={styles.input}
            min="1"
            max="99"
          />
        ) : (
          <span className={styles.lessonNumber}>{slot.lesson_number}</span>
        )}
      </td>

      {/* Время начала */}
      <td className={styles.timeCell}>
        {isEditing ? (
          <input
            type="time"
            name="start_time"
            value={editForm.start_time}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <span className={styles.time}>{slot.start_time.slice(0, 5)}</span>
        )}
      </td>

      {/* Время окончания */}
      <td className={styles.timeCell}>
        {isEditing ? (
          <input
            type="time"
            name="end_time"
            value={editForm.end_time}
            onChange={handleChange}
            className={styles.input}
          />
        ) : (
          <span className={styles.time}>{slot.end_time.slice(0, 5)}</span>
        )}
      </td>

      {/* Действия */}
      <td className={styles.actionsCell}>
        {isEditing ? (
          <div className={styles.actionButtons}>
            <SaveButton onClick={handleSave} />
            <CancelButton onClick={handleCancel} />
          </div>
        ) : (
          <div className={styles.actionButtons}>
            <EditButton onClick={handleEditClick}/>
            <DeleteButton onClick={handleDelete} confirmMessage={`Удалить слот №${slot.lesson_number}?`}/>
          </div>
        )}
      </td>
    </tr>
  );
};

export default LessonSlotRow;
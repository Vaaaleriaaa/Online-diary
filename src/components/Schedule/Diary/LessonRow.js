import React, { useEffect, useState } from 'react';
import styles from './LessonRow.module.css';
import Select from '../../UI/Select';
import EditButton from '../../UI/EditButton';
import DeleteButton from '../../UI/DeleteButton';
import SaveButton from '../../UI/SaveButton';
import CancelButton from '../../UI/CancelButton';

const LessonRow = ({ 
  lesson, 
  lessonNumber, 
  assignments,
  roomOptions,
  onUpdate, 
  onDelete, 
  onAdd,
  isEditing: externalEditing, 
  onStartEdit,
  onCancelEdit  
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    assignmentId: '',
    roomId: '',
  });

  useEffect(() => {
    if (lesson) {
      setEditForm({
        assignmentId: lesson.assignment_id?.toString() || '',
        roomId: lesson.room_id?.toString() || '',
      });
    }
  }, [lesson]);

  useEffect(() => {
    setIsEditing(externalEditing || false);
  }, [externalEditing]);

  const handleEditClick = () => {
    if (lesson) {
      setEditForm({
        assignmentId: lesson.assignment_id?.toString() || '',
        roomId: lesson.room_id?.toString() || '',
      });
    }
    setIsEditing(true);
    if (onStartEdit) onStartEdit();
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (lesson) {
      setEditForm({
        assignmentId: lesson.assignment_id?.toString() || '',
        roomId: lesson.room_id?.toString() || '',
      });
    }
    if (onCancelEdit) onCancelEdit();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const updateData = {};
    
    if (editForm.assignmentId && editForm.assignmentId !== lesson?.assignment_id?.toString()) {
      updateData.assignmentId = editForm.assignmentId;
      console.log('Предмет изменен:', lesson?.assignment_id, '->', editForm.assignmentId);
    }
    
    if (editForm.roomId && editForm.roomId !== lesson?.room_id?.toString()) {
      updateData.roomId = editForm.roomId;
      console.log('Кабинет изменен:', lesson?.room_id, '->', editForm.roomId);
    }
    
    if (Object.keys(updateData).length === 0) {
      console.log('Нет изменений');
      setIsEditing(false);
      setIsSaving(false);
      if (onCancelEdit) onCancelEdit();
      return;
    }
    
    await onUpdate(lesson?.lesson_id, updateData);
    
    setIsEditing(false);
    setIsSaving(false);
    if (onCancelEdit) onCancelEdit();
  };

  const handleDelete = () => {
    onDelete(lesson?.lesson_id);
  };

  if (!lesson) {
    return (
      <tr className={styles.emptyRow}>
        <td className={styles.lessonNumber}>{lessonNumber}</td>
        <td colSpan="4" className={styles.emptyCell}>
          <button className={styles.addButton} onClick={onAdd}>
            + Добавить урок
          </button>
        </td>
      </tr>
    );
  }

  const subjectOptions = assignments.map(a => ({
    value: a.assignment_id,
    label: `${a.subject.name}`
  }));

  const selectedAssignment = assignments.find(a => a.assignment_id === parseInt(editForm.assignmentId));

  return (
    <tr className={styles.row}>
      <td className={styles.lessonNumber}>{lessonNumber}</td>
      
      <td className={styles.cell}>
        {isEditing ? (
          <Select
            value={editForm.assignmentId}
            onChange={handleChange}
            options={subjectOptions}
            placeholder="Выберите предмет"
            name="assignmentId"
            disabled={isSaving}
          />
        ) : (
          <span>{lesson.subject_name || '—'}</span>
        )}
      </td>
      
      <td className={styles.cell}>
        {isEditing && selectedAssignment ? (
          <span>{selectedAssignment.teacher.last_name} {selectedAssignment.teacher.first_name}</span>
        ) : (
          <span>{lesson.teacher_last_name || '—'} {lesson.teacher_first_name || ''}</span>
        )}
      </td>
      
      <td className={styles.cell}>
        {isEditing ? (
          <Select
            value={editForm.roomId}
            onChange={handleChange}
            options={roomOptions}
            placeholder="Выберите кабинет"
            name="roomId"
            disabled={isSaving}
          />
        ) : (
          <span>{lesson.room_number || '—'}</span>
        )}
      </td>
      
      <td className={styles.actionsCell}>
        {isEditing ? (
          <div className={styles.actionButtons}>
            <SaveButton onClick={handleSave} disabled={isSaving} />
            <CancelButton onClick={handleCancel} disabled={isSaving} />
          </div>
        ) : (
          <div className={styles.actionButtons}>
            <EditButton onClick={handleEditClick} />
            <DeleteButton 
              onClick={handleDelete} 
              confirmMessage={`Удалить урок ${lesson.subject_name}?`}
            />
          </div>
        )}
      </td>
    </tr>
  );
};

export default LessonRow;
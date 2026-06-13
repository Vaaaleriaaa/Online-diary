import React, { useState } from 'react';
import clipIcon from '../../../images/clip.svg';
import styles from './StudentsListTab.module.css';
import SaveButton from '../../UI/SaveButton';
import CancelButton from '../../UI/CancelButton';
import EditButton from '../../UI/EditButton';
import DeleteButton from '../../UI/DeleteButton';
import Select from '../../UI/Select';
import ConfirmModal from '../../UI/ConfirmModal';

const StudentsListTab = ({
  activeTab,
  students,
  loading,
  editingStudentId,
  editForm,
  setEditForm,
  startEdit,
  cancelEdit,
  handleSaveStudent,
  handleDeleteStudent,
  handleAssignToClass,
  classOptions,
  getClassName
}) => {
  const [showClassSelect, setShowClassSelect] = useState(false);
  const [selectedStudentForClass, setSelectedStudentForClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const handleAssignClick = (studentId) => {
    setSelectedStudentForClass(studentId);
    setSelectedClassId('');
    setShowClassSelect(true);
  };

  const handleConfirmAssign = () => {
    if (selectedClassId && selectedStudentForClass) {
      handleAssignToClass(selectedStudentForClass, parseInt(selectedClassId));
      setShowClassSelect(false);
      setSelectedStudentForClass(null);
      setSelectedClassId('');
    }
  };

  const handleCancelAssign = () => {
    setShowClassSelect(false);
    setSelectedStudentForClass(null);
    setSelectedClassId('');
  };

  const handleDeleteClick = (studentId) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      handleDeleteStudent(studentToDelete);
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
  };

  // Находим данные ученика для удаления
  const studentForDelete = studentToDelete 
    ? students.find(s => s.user_id === studentToDelete) 
    : null;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.studentsTable}>
        <thead>
          <tr>
            <th className={styles.rowNumber}>№</th>
            <th className={styles.fullName}>Ученик</th>
            <th className={styles.class}>Класс</th>
            <th className={styles.actions}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const isEditing = editingStudentId === student.user_id;
            const studentClassId = student.class?.class_id || '';
            
            return (
              <tr key={student.user_id}>
                <td className={styles.rowNumber}>{index + 1}</td>
                <td className={styles.fullName}>
                  {isEditing ? (
                    <div className={styles.editFields}>
                      <input
                        type="text"
                        className={styles.input}
                        value={editForm.last_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        placeholder="Фамилия"
                      />
                      <input
                        type="text"
                        className={styles.input}
                        value={editForm.first_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        placeholder="Имя"
                      />
                      <input
                        type="text"
                        className={styles.input}
                        value={editForm.patronymic || ''}
                        onChange={(e) => setEditForm({ ...editForm, patronymic: e.target.value })}
                        placeholder="Отчество"
                      />
                    </div>
                  ) : (
                    <span>{student.last_name} {student.first_name} {student.patronymic || ''}</span>
                  )}
                </td>
                <td className={styles.class}>
                  <span>
                    {student.class?.class_name || (studentClassId ? getClassName(studentClassId) : '—')}
                  </span>
                </td>
                <td className={styles.actions}>
                  {isEditing ? (
                    <div className={styles.actionButtons}>
                      <SaveButton onClick={() => handleSaveStudent(student)} title="Сохранить" />
                      <CancelButton onClick={cancelEdit} title="Отмена" />
                    </div>
                  ) : (
                    <div className={styles.actionButtons}>
                      <EditButton onClick={() => startEdit(student)} title="Редактировать" />
                      <DeleteButton 
                        onClick={() => handleDeleteClick(student.user_id)} 
                        title="Удалить ученика"
                      />
                      {activeTab === 'students-no-class' && !studentClassId && (
                        <button 
                          className={styles.assignBtn}
                          onClick={() => handleAssignClick(student.user_id)}
                          title="Прикрепить к классу"
                        >
                          <img src={clipIcon} alt="Редактировать" className={styles.icon} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {students.length === 0 && !loading && (
        <div className={styles.empty}>
          {activeTab === 'students-no-class' && 'Нет учеников без класса'}
          {activeTab === 'all-students' && 'Нет учеников'}
        </div>
      )}

      {/* Модальное окно выбора класса */}
      {showClassSelect && (
        <div className={styles.modalOverlay} onClick={handleCancelAssign}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Выберите класс</h3>
            <Select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={classOptions}
              placeholder="Выберите класс"
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleCancelAssign}>
                Отмена
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={handleConfirmAssign}
                disabled={!selectedClassId}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Удаление ученика"
        message={`Вы уверены, что хотите удалить ученика ${studentForDelete?.last_name} ${studentForDelete?.first_name} ${studentForDelete?.patronymic || ''} из системы? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default StudentsListTab;
import React, { useState } from 'react';
import styles from './ClassesTab.module.css';
import AddButton from '../../UI/AddButton';
import EditButton from '../../UI/EditButton';
import DeleteButton from '../../UI/DeleteButton';
import SaveButton from '../../UI/SaveButton';
import CancelButton from '../../UI/CancelButton';

const ClassesTab = ({
  classes,
  selectedClass,
  setSelectedClass,
  loading,
  editingStudentId,
  editForm,
  setEditForm,
  startEdit,
  cancelEdit,
  handleSaveStudent,
  handleRemoveFromClassClick,
  handleEditClass,
  handleDeleteClassClick,
  setShowCreateClassModal,
  setShowCreateStudentModal,
  sortedStudents,
  classOptions,
}) => {
  const [selectedGrade, setSelectedGrade] = useState(null);

  const getUniqueGrades = () => {
    const grades = [...new Set(classes.map(c => c.grade_year))];
    return grades.sort((a, b) => b - a);
  };

  const getLettersByGrade = (grade) => {
    return classes
      .filter(c => c.grade_year === grade)
      .map(c => ({ letter: c.grade_letter, classData: c }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  };

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setSelectedClass(null);
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
  };

  const uniqueGrades = getUniqueGrades();

  return (
    <div className={styles.threeColumns}>
      <div className={`${styles['grade-column']} ${styles.column}`}>
        <div className={styles.columnHeader}>
          <h3>Год</h3>
        </div>
        <div className={styles.columnContent}>
          {uniqueGrades.map(grade => (
            <div
              key={grade}
              className={`${styles.gradeItem} ${selectedGrade === grade ? styles.active : ''}`}
              onClick={() => handleGradeSelect(grade)}
            >
              {grade}
            </div>
          ))}
          {uniqueGrades.length === 0 && (
            <div className={styles.emptyMessage}>Нет классов</div>
          )}
        </div>
      </div>

      <div className={`${styles['class-column']} ${styles.column}`}>
        <div className={styles.columnHeader}>
          <h3>Класс</h3>
          <AddButton
            onClick={() => setShowCreateClassModal(true)}
            text=""
            title="Добавить класс"
          />
        </div>
        <div className={styles.columnContent}>
          {selectedGrade ? (
            getLettersByGrade(selectedGrade).map(({ letter, classData }) => (
              <div
                key={classData.class_id}
                className={`${styles.classItem} ${selectedClass?.class_id === classData.class_id ? styles.active : ''}`}
              >
                <span 
                  className={styles.className}
                  onClick={() => handleClassSelect(classData)}
                >
                  {letter}
                </span>
                <div className={styles.classActions}>
                  <EditButton 
                    onClick={() => handleEditClass(classData)} 
                    title="Редактировать класс"
                    small
                  />
                  <DeleteButton 
                    onClick={() => handleDeleteClassClick(classData)} 
                    title="Удалить класс"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyMessage}>Выберите год обучения</div>
          )}
        </div>
      </div>

      <div className={`${styles['student-column']} ${styles.column}`}>
        <div className={styles.columnHeader}>
          <h3>
            {selectedClass 
              ? `Ученики ${selectedClass.grade_year}${selectedClass.grade_letter} класса`
              : 'Список учеников'}
          </h3>
        </div>
        <div className={styles.columnContent}>
          {selectedClass ? (
            loading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : (
              <table className={styles.studentsTable}>
                <thead>
                  <tr>
                    <th className={styles.rowNumber}>№</th>
                    <th className={styles.fullName}>Ученик</th>
                    <th className={styles.actions}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student, index) => {
                    const isEditing = editingStudentId === student.user_id;
                    
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
                                onClick={() => handleRemoveFromClassClick(student.user_id)} 
                                title="Отвязать от класса"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : (
            <div className={styles.emptyMessage}>Выберите класс для просмотра учеников</div>
          )}
          {selectedClass && sortedStudents.length === 0 && !loading && (
            <div className={styles.emptyMessage}>В классе нет учеников</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassesTab;
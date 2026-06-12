// src/pages/admin/ClassManagement.js
import React, { useCallback, useEffect, useState } from 'react';
import Tabs from '../../components/UI/Tabs';
import Select from '../../components/UI/Select';
import EditButton from '../../components/UI/EditButton';
import SaveButton from '../../components/UI/SaveButton';
import CancelButton from '../../components/UI/CancelButton';
import DeleteButton from '../../components/UI/DeleteButton';
import AddButton from '../../components/UI/AddButton';
import CreateStudentModal from '../../components/admin/CreateStudentModal';
import CreateClassModal from '../../components/admin/CreateClassModal';
import Notification from '../../components/UI/Notification';
import ConfirmModal from '../../components/UI/ConfirmModal';
import styles from './ClassManagement.module.css';
import AddExistingStudentModal from '../../components/admin/AddExistingStudentModal';

const ClassManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showAddExistingStudentModal, setShowAddExistingStudentModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [studentToUnassign, setStudentToUnassign] = useState(null);
  const token = localStorage.getItem('token');

  const tabs = [
    { id: 'classes', label: 'Классы' },
    { id: 'students-no-class', label: 'Ученики без класса' },
    { id: 'all-students', label: 'Все ученики' },
  ];

  // Показать уведомление
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Скрыть уведомление
  const hideNotification = () => {
    setNotification({ message: '', type: 'success' });
  };

  // Загрузка всех классов
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/classes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки классов:', err);
      showNotification('Ошибка загрузки классов', 'error');
    }
  }, [token]);

  // Загрузка учеников в зависимости от активной вкладки
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'classes') {
        // Ученики конкретного класса
        if (!selectedClass) {
          setStudents([]);
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:3000/class/${selectedClass.class_id}/students`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setStudents(data.data?.students || []);
        }
      } 
      else if (activeTab === 'all-students') {
        // Все ученики
        const response = await fetch('http://localhost:3000/users/students', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setStudents(data.data || []);
        }
      } 
      else if (activeTab === 'students-no-class') {
        // Ученики без класса = все ученики - ученики с классом
        const [allStudentsRes, studentsWithClassRes] = await Promise.all([
          fetch('http://localhost:3000/users/students', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/students', {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);
        
        const allStudentsData = await allStudentsRes.json();
        const studentsWithClassData = await studentsWithClassRes.json();
        
        if (allStudentsData.success && studentsWithClassData.success) {
          const allStudents = allStudentsData.data || [];
          const studentsWithClass = studentsWithClassData.data || [];
          
          // Получаем ID учеников, у которых есть класс
          const studentsWithClassIds = new Set(studentsWithClass.map(s => s.user_id));
          
          // Фильтруем учеников без класса
          const studentsWithoutClass = allStudents.filter(s => !studentsWithClassIds.has(s.user_id));
          setStudents(studentsWithoutClass);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки учеников:', err);
      showNotification('Ошибка загрузки учеников', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, selectedClass]);

  // Обновление выбранного класса после загрузки классов
  useEffect(() => {
    if (selectedClass && classes.length > 0) {
      const updatedClass = classes.find(c => c.class_id === selectedClass.class_id);
      if (updatedClass) {
        if (updatedClass.grade_year !== selectedClass.grade_year || 
            updatedClass.grade_letter !== selectedClass.grade_letter) {
          setSelectedClass(updatedClass);
        }
      } else {
        setSelectedClass(null);
        setSelectedGrade(null);
      }
    }
  }, [classes, selectedClass]);

  // Загрузка классов при монтировании
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Загрузка учеников при изменении вкладки или выбранного класса
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Получение уникальных годов обучения (от большего к меньшему)
  const getUniqueGrades = () => {
    const grades = [...new Set(classes.map(c => c.grade_year))];
    return grades.sort((a, b) => b - a);
  };

  // Получение букв для выбранного года
  const getLettersByGrade = (grade) => {
    return classes
      .filter(c => c.grade_year === grade)
      .map(c => ({ letter: c.grade_letter, classData: c }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  };

  // Выбор года
  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setSelectedClass(null);
  };

  // Выбор класса
  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
  };

  // Начало редактирования ученика
  const startEdit = (student) => {
    setEditingStudentId(student.user_id);
    setEditForm({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      patronymic: student.patronymic || '',
      class_id: student.class?.class_id || '',
    });
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
    setEditForm({});
  };

  // Сохранение изменений ФИО ученика
  const handleSaveStudent = async (student) => {
    try {
      // Обновление ФИО через PUT /users/:userId
      if (editForm.first_name !== student.first_name || 
          editForm.last_name !== student.last_name || 
          editForm.patronymic !== student.patronymic) {
        
        const response = await fetch(`http://localhost:3000/users/${student.user_id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: editForm.first_name,
            lastName: editForm.last_name,
            patronymic: editForm.patronymic,
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Ошибка обновления');
        }
      }
      
      // Обновление класса (если есть в режиме редактирования и класс изменился)
      if (activeTab !== 'classes' && editForm.class_id !== (student.class?.class_id || '')) {
        const response = await fetch(`http://localhost:3000/student/${student.user_id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ classId: editForm.class_id || null }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Ошибка обновления класса');
        }
      }
      
      await fetchStudents();
      cancelEdit();
      showNotification('Данные ученика успешно сохранены', 'success');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      showNotification(err.message, 'error');
    }
  };

  // Прикрепить ученика к классу (для учеников без класса)
  const handleAssignToClass = async (studentId, classId) => {
    try {
      const response = await fetch(`http://localhost:3000/student/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId: classId }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchStudents();
        showNotification('Ученик прикреплен к классу', 'success');
      } else {
        showNotification(data.error || 'Ошибка прикрепления к классу', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    }
  };

  // Отвязать ученика от класса (показать подтверждение)
  const handleRemoveFromClassClick = (studentId) => {
    setStudentToUnassign(studentId);
    setShowConfirmModal(true);
  };

  const confirmRemoveFromClass = async () => {
    if (!studentToUnassign) return;
    
    try {
      const response = await fetch(`http://localhost:3000/student/${studentToUnassign}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchStudents();
        showNotification('Ученик отвязан от класса', 'success');
      } else {
        showNotification(data.error || 'Ошибка отвязки от класса', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setShowConfirmModal(false);
      setStudentToUnassign(null);
    }
  };

  // Редактирование класса
  const handleEditClass = async (classData) => {
    const newLetter = prompt('Введите новую букву класса:', classData.grade_letter);
    if (!newLetter || newLetter === classData.grade_letter) return;
    
    try {
      const response = await fetch(`http://localhost:3000/classes/${classData.class_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade_letter: newLetter.toUpperCase(),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        showNotification('Класс успешно обновлен', 'success');
      } else {
        showNotification(data.error || 'Ошибка обновления класса', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    }
  };

  // Удаление класса (показать подтверждение)
  const handleDeleteClassClick = (classData) => {
    setClassToDelete(classData);
    setShowConfirmModal(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/class/${classToDelete.class_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        if (selectedClass?.class_id === classToDelete.class_id) {
          setSelectedClass(null);
          setSelectedGrade(null);
        }
        showNotification(`Класс ${classToDelete.grade_year}${classToDelete.grade_letter} успешно удален`, 'success');
      } else {
        showNotification(data.error || 'Ошибка удаления класса', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setShowConfirmModal(false);
      setClassToDelete(null);
    }
  };

  // Обработчик прикрепления к классу (через prompt)
  const handleAssignClassPrompt = (studentId) => {
    const classId = prompt('Введите ID класса (найдите в списке классов):');
    if (classId) {
      handleAssignToClass(studentId, parseInt(classId));
    }
  };

  // Обработчик успешного создания ученика
  const handleStudentCreated = () => {
    fetchStudents();
    showNotification('Ученик успешно создан', 'success');
  };

  // Обработчик успешного создания класса
  const handleClassCreated = () => {
    fetchClasses();
    showNotification('Класс успешно создан', 'success');
  };

  // Получение названия класса по class_id
  const getClassName = (classId) => {
    const classInfo = classes.find(c => c.class_id === classId);
    return classInfo ? `${classInfo.grade_year}${classInfo.grade_letter}` : '—';
  };

  // Сортировка учеников по ФИО
  const sortedStudents = [...students].sort((a, b) => {
    const lastNameCompare = (a.last_name || '').localeCompare(b.last_name || '');
    if (lastNameCompare !== 0) return lastNameCompare;
    const firstNameCompare = (a.first_name || '').localeCompare(b.first_name || '');
    if (firstNameCompare !== 0) return firstNameCompare;
    return (a.patronymic || '').localeCompare(b.patronymic || '');
  });

  const uniqueGrades = getUniqueGrades();
  const classOptions = classes.map(c => ({
    value: c.class_id,
    label: `${c.grade_year}${c.grade_letter}`,
  }));

  return (
    <div className={styles.container}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={hideNotification}
      />
      
      <div className={styles.header}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <AddButton 
          onClick={() => setShowCreateStudentModal(true)} 
          text="Создать ученика"
          title="Создать нового ученика"
        />
      </div>

      {activeTab === 'classes' && (
        <div className={styles.threeColumns}>
          {/* Левая колонка - года обучения */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3>Годы обучения</h3>
            </div>
            <div className={styles.columnContent}>
              {uniqueGrades.map(grade => (
                <div
                  key={grade}
                  className={`${styles.gradeItem} ${selectedGrade === grade ? styles.active : ''}`}
                  onClick={() => handleGradeSelect(grade)}
                >
                  {grade} класс
                </div>
              ))}
              {uniqueGrades.length === 0 && (
                <div className={styles.emptyMessage}>Нет классов</div>
              )}
            </div>
          </div>

          {/* Средняя колонка - буквы классов */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3>Классы</h3>
              <AddButton
                onClick={() => setShowCreateClassModal(true)}
                text=""
                title="Добавить класс"
                className={styles.smallAddButton}
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

          {/* Правая колонка - список учеников */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3>
                {selectedClass 
                  ? `Ученики ${selectedClass.grade_year}${selectedClass.grade_letter} класса`
                  : 'Список учеников'}
              </h3>
              {selectedClass && (
                <div className={styles.headerButtons}>
                  <AddButton
                    onClick={() => setShowCreateStudentModal(true)}
                    text="Создать"
                    title="Создать ученика"
                  />
                  <AddButton
                    onClick={() => setShowAddExistingStudentModal(true)}
                    text="Добавить"
                    title="Добавить существующего ученика"
                    variant="secondary"
                  />
                </div>
              )}
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
      )}

      {(activeTab === 'students-no-class' || activeTab === 'all-students') && (
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
              {sortedStudents.map((student, index) => {
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
                      {isEditing ? (
                        <Select
                          value={editForm.class_id || ''}
                          onChange={(e) => setEditForm({ ...editForm, class_id: e.target.value })}
                          options={[{ value: '', label: 'Без класса' }, ...classOptions]}
                          placeholder="Выберите класс"
                        />
                      ) : (
                        <span>
                          {student.class?.class_name || (studentClassId ? getClassName(studentClassId) : '—')}
                        </span>
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
                          {activeTab === 'students-no-class' && !studentClassId && (
                            <button 
                              className={styles.assignBtn}
                              onClick={() => handleAssignClassPrompt(student.user_id)}
                              title="Прикрепить к классу"
                            >
                              📎
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
        </div>
      )}
      
      {((activeTab === 'students-no-class' || activeTab === 'all-students') && sortedStudents.length === 0 && !loading) && (
        <div className={styles.empty}>
          {activeTab === 'students-no-class' && 'Нет учеников без класса'}
          {activeTab === 'all-students' && 'Нет учеников'}
        </div>
      )}

      <CreateStudentModal
        isOpen={showCreateStudentModal}
        onClose={() => setShowCreateStudentModal(false)}
        onSuccess={handleStudentCreated}
        classOptions={classOptions}
        preselectedClass={selectedClass?.class_id}
      />

      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        onSuccess={handleClassCreated}
      />

      {/* Модальное окно для добавления существующего ученика */}
      {showAddExistingStudentModal && (
        <AddExistingStudentModal
          isOpen={showAddExistingStudentModal}
          onClose={() => setShowAddExistingStudentModal(false)}
          onSuccess={handleStudentCreated}
          classId={selectedClass?.class_id}
          classOptions={classOptions}
        />
      )}

      {/* Модальное окно подтверждения */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setClassToDelete(null);
          setStudentToUnassign(null);
        }}
        onConfirm={classToDelete ? confirmDeleteClass : confirmRemoveFromClass}
        title={classToDelete ? "Удаление класса" : "Отвязка ученика"}
        message={classToDelete 
          ? `Вы уверены, что хотите удалить класс ${classToDelete.grade_year}${classToDelete.grade_letter}? Ученики будут отвязаны от класса.`
          : "Вы уверены, что хотите отвязать ученика от класса?"}
        confirmText={classToDelete ? "Удалить" : "Отвязать"}
      />
    </div>
  );
};

export default ClassManagement;
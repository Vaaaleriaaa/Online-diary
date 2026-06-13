import React, { useCallback, useEffect, useState } from 'react';
import styles from './TeachersManagement.module.css';
import Notification from '../../components/UI/Notification';
import TeachersList from '../../components/admin/teacherManagment/TeachersList';
import SubjectsList from '../../components/admin/teacherManagment/SubjectsList';
import AssignmentsList from '../../components/admin/teacherManagment/AssignmentsList';
import CreateTeacherModal from '../../components/admin/modals/CreateTeacherModal';
import CreateSubjectModal from '../../components/admin/modals/CreateSubjectModal';
import CreateAssignmentModal from '../../components/admin/modals/CreateAssignmentModal';
import EditTeacherModal from '../../components/admin/modals/EditTeacherModal';
import EditSubjectModal from '../../components/admin/modals/EditSubjectModal';
import EditAssignmentModal from '../../components/admin/modals/EditAssignmentModal';
import ConfirmModal from '../../components/UI/ConfirmModal';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  // Состояния для модальных окон
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Данные для редактирования/удаления
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'teacher', 'subject', 'assignment'
  
  const token = localStorage.getItem('token');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification({ message: '', type: 'success' });
  };

  // Загрузка всех учителей
  const fetchTeachers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/users/teachers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки учителей:', err);
      showNotification('Ошибка загрузки учителей', 'error');
    }
  }, [token]);

  // Загрузка всех предметов
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/subjects', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки предметов:', err);
      showNotification('Ошибка загрузки предметов', 'error');
    }
  }, [token]);

  // Загрузка назначений для выбранного учителя и предмета
  const fetchAssignments = useCallback(async () => {
    if (!selectedTeacher || !selectedSubject) {
      setAssignments([]);
      return;
    }
    
    setLoading(true);
    try {
      // Получаем все назначения учителя
      const response = await fetch(`http://localhost:3000/assignment/teacher/${selectedTeacher.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        // Фильтруем по выбранному предмету
        const assignmentsArray = data.data.assignments || [];
        const filteredAssignments = assignmentsArray.filter(
          assignment => assignment.subject.subject_id === selectedSubject.subject_id
        );
        setAssignments(filteredAssignments);
      }
    } catch (err) {
      console.error('Ошибка загрузки назначений:', err);
      showNotification('Ошибка загрузки назначений', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, selectedTeacher, selectedSubject]);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, [fetchTeachers, fetchSubjects]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Выбор учителя
  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedSubject(null);
    setAssignments([]);
  };

  // Выбор предмета
  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
  };

  // Создание учителя
  const handleTeacherCreated = () => {
    fetchTeachers();
    showNotification('Учитель успешно создан', 'success');
  };

  // Создание предмета
  const handleSubjectCreated = () => {
    fetchSubjects();
    showNotification('Предмет успешно создан', 'success');
  };

  // Создание назначения
  const handleAssignmentCreated = () => {
    fetchAssignments();
    showNotification('Назначение успешно создано', 'success');
  };

  // Обновление учителя
  const handleTeacherUpdated = () => {
    fetchTeachers();
    if (selectedTeacher) {
      fetchAssignments();
    }
    showNotification('Учитель успешно обновлен', 'success');
  };

  // Обновление предмета
  const handleSubjectUpdated = () => {
    fetchSubjects();
    if (selectedSubject) {
      fetchAssignments();
    }
    showNotification('Предмет успешно обновлен', 'success');
  };

  // Обновление назначения
  const handleAssignmentUpdated = () => {
    fetchAssignments();
    showNotification('Назначение успешно обновлено', 'success');
  };

  // Удаление учителя
  const handleDeleteTeacher = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/users/${itemToDelete.user_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        if (selectedTeacher?.user_id === itemToDelete.user_id) {
          setSelectedTeacher(null);
          setSelectedSubject(null);
        }
        fetchTeachers();
        showNotification('Учитель успешно удален', 'success');
      } else {
        // ✅ Показываем понятное сообщение об ошибке
        if (data.error && data.error.includes('foreign key constraint')) {
          showNotification('Невозможно удалить учителя: сначала удалите все его назначения', 'error');
        } else {
          showNotification(data.error || 'Ошибка удаления учителя', 'error');
        }
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  // Удаление предмета
  const handleDeleteSubject = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/subject/${itemToDelete.subject_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        if (selectedSubject?.subject_id === itemToDelete.subject_id) {
          setSelectedSubject(null);
        }
        fetchSubjects();
        showNotification('Предмет успешно удален', 'success');
      } else {
        showNotification(data.error || 'Ошибка удаления предмета', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  // Удаление назначения (конкретной связки)
  const handleDeleteAssignment = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/assignment/${itemToDelete.assignment_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAssignments(); // Обновляем список
        showNotification('Назначение успешно удалено', 'success');
      } else {
        if (data.error && data.error.includes('foreign key constraint')) {
          showNotification('Невозможно удалить назначение: сначала удалите все уроки по этому предмету в расписании', 'error');
        } else {
          showNotification(data.error || 'Ошибка удаления назначения', 'error');
        }
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const confirmDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === 'teacher') handleDeleteTeacher();
    else if (deleteType === 'subject') handleDeleteSubject();
    else if (deleteType === 'assignment') handleDeleteAssignment();
  };

  const getDeleteMessage = () => {
    if (deleteType === 'teacher') {
      return `Вы уверены, что хотите удалить учителя ${itemToDelete?.last_name} ${itemToDelete?.first_name}? Перед удалением учителя необходимо удалить все его назначения.`;
    }
    if (deleteType === 'subject') {
      return `Вы уверены, что хотите удалить предмет "${itemToDelete?.name}"? Перед удалением предмета необходимо удалить все назначения с этим предметом.`;
    }
    if (deleteType === 'assignment') {
      const assignment = itemToDelete;
      if (!assignment) return 'Вы уверены, что хотите удалить это назначение?';
      
      // Получаем ФИО учителя
      const teacherLastName = assignment.teacher?.last_name || '';
      const teacherFirstName = assignment.teacher?.first_name || '';
      const teacherName = `${teacherLastName} ${teacherFirstName}`.trim();
      
      // Получаем название предмета
      const subjectName = assignment.subject?.name || 'неизвестный предмет';
      
      // Получаем название класса
      const className = assignment.class?.class_name || 
                        `${assignment.class?.grade_year || ''}${assignment.class?.grade_letter || ''}` || 
                        'неизвестный класс';
      
      return `Вы уверены, что хотите удалить назначение ${teacherName} на "${subjectName}" для класса ${className}?`;
    }
    return 'Вы уверены, что хотите удалить этот элемент?';
  };

  return (
    <div className={styles.container}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={hideNotification}
      />
      
      <h1 className={styles.title}>Управление учителями</h1>
      
      <div className={styles.threeColumns}>
        {/* Левая колонка - учителя */}
        <TeachersList
          teachers={teachers}
          selectedTeacher={selectedTeacher}
          onSelectTeacher={handleSelectTeacher}
          onEditTeacher={(teacher) => {
            setEditingTeacher(teacher);
            setShowEditTeacherModal(true);
          }}
          onDeleteTeacher={(teacher) => confirmDelete(teacher, 'teacher')}
          onCreateTeacher={() => setShowCreateTeacherModal(true)}
        />

        {/* Средняя колонка - предметы учителя */}
        <SubjectsList
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSelectSubject}
          onEditSubject={(subject) => {
            setEditingSubject(subject);
            setShowEditSubjectModal(true);
          }}
          onDeleteSubject={(subject) => confirmDelete(subject, 'subject')}
          onCreateSubject={() => setShowCreateSubjectModal(true)}
        />

        {/* Правая колонка - назначения */}
        <AssignmentsList
          assignments={assignments}
          loading={loading}
          selectedTeacher={selectedTeacher}
          selectedSubject={selectedSubject}
          onEditAssignment={(assignment) => {
            setEditingAssignment(assignment);
            setShowEditAssignmentModal(true);
          }}
          onDeleteAssignment={(assignment) => confirmDelete(assignment, 'assignment')}
          onCreateAssignment={() => setShowCreateAssignmentModal(true)}
          disabled={!selectedTeacher || !selectedSubject}
        />
      </div>

      {/* Модальные окна */}
      <CreateTeacherModal
        isOpen={showCreateTeacherModal}
        onClose={() => setShowCreateTeacherModal(false)}
        onSuccess={handleTeacherCreated}
      />

      <CreateSubjectModal
        isOpen={showCreateSubjectModal}
        onClose={() => setShowCreateSubjectModal(false)}
        onSuccess={handleSubjectCreated}
      />

      <CreateAssignmentModal
        isOpen={showCreateAssignmentModal}
        onClose={() => setShowCreateAssignmentModal(false)}
        onSuccess={handleAssignmentCreated}
        teachers={teachers}
        subjects={subjects}
        classes={[]} // Нужно будет добавить загрузку классов
        preselectedTeacher={selectedTeacher}
        preselectedSubject={selectedSubject}
      />

      <EditTeacherModal
        isOpen={showEditTeacherModal}
        onClose={() => {
          setShowEditTeacherModal(false);
          setEditingTeacher(null);
        }}
        onSuccess={handleTeacherUpdated}
        teacher={editingTeacher}
      />

      <EditSubjectModal
        isOpen={showEditSubjectModal}
        onClose={() => {
          setShowEditSubjectModal(false);
          setEditingSubject(null);
        }}
        onSuccess={handleSubjectUpdated}
        subject={editingSubject}
      />

      <EditAssignmentModal
        isOpen={showEditAssignmentModal}
        onClose={() => {
          setShowEditAssignmentModal(false);
          setEditingAssignment(null);
        }}
        onSuccess={handleAssignmentUpdated}
        assignment={editingAssignment}
        teachers={teachers}
        subjects={subjects}
        classes={[]}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setItemToDelete(null);
          setDeleteType(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        message={getDeleteMessage()}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default TeachersManagement;
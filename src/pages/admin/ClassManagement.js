import React, { useCallback, useEffect, useState } from 'react';
import AddButton from '../../components/UI/AddButton';
import Notification from '../../components/UI/Notification';
import styles from './ClassManagement.module.css';
import ClassesTab from '../../components/admin/classManagment/ClassesTab';
import StudentsListTab from '../../components/admin/classManagment/StudentsListTab';
import CreateStudentModal from '../../components/admin/classManagment/CreateStudentModal';
import CreateClassModal from '../../components/admin/classManagment/CreateClassModal';
import EditClassModal from '../../components/admin/classManagment/EditClassModal';
import ConfirmModal from '../../components/UI/ConfirmModal';
import Tabs from '../../components/UI/Tabs';

const ClassManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [studentToUnassign, setStudentToUnassign] = useState(null);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState(null);
  const token = localStorage.getItem('token');

  const tabs = [
    { id: 'classes', label: 'Классы' },
    { id: 'students-no-class', label: 'Ученики без класса' },
    { id: 'all-students', label: 'Все ученики' },
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification({ message: '', type: 'success' });
  };

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

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'classes') {
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
        const response = await fetch('http://localhost:3000/users/students', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (data.success) {
          const allStudents = data.data || [];
          
          const studentsWithClassRes = await fetch('http://localhost:3000/students', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const studentsWithClassData = await studentsWithClassRes.json();
          
          const classMap = new Map();
          if (studentsWithClassData.success) {
            studentsWithClassData.data.forEach(student => {
              classMap.set(student.user_id, student.class);
            });
          }
          
          const enrichedStudents = allStudents.map(student => ({
            ...student,
            class: classMap.get(student.user_id) || null
          }));
          
          setStudents(enrichedStudents);
        }
      } 
      else if (activeTab === 'students-no-class') {
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
          
          const studentsWithClassIds = new Set(studentsWithClass.map(s => s.user_id));
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

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Редактирование класса
  const handleEditClass = (classData) => {
    setSelectedClassForEdit(classData);
    setShowEditClassModal(true);
  };

  // Обработчик успешного обновления класса
  const handleClassUpdated = () => {
    fetchClasses();
    showNotification('Класс успешно обновлен', 'success');
  };

  // Удаление класса
  const handleDeleteClassClick = (classData) => {
    setClassToDelete(classData);
    setShowConfirmModal(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    
    try {
      showNotification('Удаление класса...', 'info');
      
      const studentsResponse = await fetch(`http://localhost:3000/class/${classToDelete.class_id}/students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const studentsData = await studentsResponse.json();
      
      if (studentsData.success && studentsData.data?.students) {
        const students = studentsData.data.students;
        
        for (const student of students) {
          await fetch(`http://localhost:3000/student/${student.user_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }
      }
      
      const response = await fetch(`http://localhost:3000/class/${classToDelete.class_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchClasses();
        if (selectedClass?.class_id === classToDelete.class_id) {
          setSelectedClass(null);
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

  // Функции для работы с учениками
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

  const handleSaveStudent = async (student) => {
    try {
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

  const handleDeleteStudent = async (studentId) => {
    try {
      const student = students.find(s => s.user_id === studentId);
      const hasClass = student?.class?.class_id || student?.class_id;
      
      if (hasClass) {
        const unassignResponse = await fetch(`http://localhost:3000/student/${studentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        const unassignData = await unassignResponse.json();
        if (!unassignData.success) {
          showNotification('Ошибка при отвязке ученика от класса', 'error');
          return;
        }
      }
      
      const response = await fetch(`http://localhost:3000/users/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchStudents();
        showNotification('Ученик успешно удален из системы', 'success');
      } else {
        showNotification(data.error || 'Ошибка удаления ученика', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    }
  };

  const handleAssignToClass = async (studentId, classId) => {
    try {
      const student = students.find(s => s.user_id === studentId);
      const hasClass = student?.class?.class_id || student?.class_id;
      
      let response;
      let url = '';
      let method = '';
      
      if (hasClass) {
        url = `http://localhost:3000/student/${studentId}`;
        method = 'PUT';
      } else {
        url = 'http://localhost:3000/student';
        method = 'POST';
      }
      
      const requestBody = method === 'PUT' 
        ? JSON.stringify({ classId: classId })
        : JSON.stringify({ studentId: studentId, classId: classId });
      
      response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchStudents();
        showNotification(
          hasClass ? 'Ученик перемещен в другой класс' : 'Ученик добавлен в класс', 
          'success'
        );
      } else {
        showNotification(data.error || 'Ошибка прикрепления к классу', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showNotification('Ошибка соединения', 'error');
    }
  };

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

  const handleStudentCreated = () => {
    fetchStudents();
    showNotification('Ученик успешно создан', 'success');
  };

  const handleClassCreated = () => {
    fetchClasses();
    showNotification('Класс успешно создан', 'success');
  };

  const getClassName = (classId) => {
    const classInfo = classes.find(c => c.class_id === classId);
    return classInfo ? `${classInfo.grade_year}${classInfo.grade_letter}` : '—';
  };

  const sortedStudents = [...students].sort((a, b) => {
    const lastNameCompare = (a.last_name || '').localeCompare(b.last_name || '');
    if (lastNameCompare !== 0) return lastNameCompare;
    const firstNameCompare = (a.first_name || '').localeCompare(b.first_name || '');
    if (firstNameCompare !== 0) return firstNameCompare;
    return (a.patronymic || '').localeCompare(b.patronymic || '');
  });

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
        <ClassesTab
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          loading={loading}
          editingStudentId={editingStudentId}
          editForm={editForm}
          setEditForm={setEditForm}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          handleSaveStudent={handleSaveStudent}
          handleRemoveFromClassClick={handleRemoveFromClassClick}
          handleEditClass={handleEditClass}
          handleDeleteClassClick={handleDeleteClassClick}
          setShowCreateClassModal={setShowCreateClassModal}
          setShowCreateStudentModal={setShowCreateStudentModal}
          sortedStudents={sortedStudents}
          classOptions={classOptions}
        />
      )}

      {(activeTab === 'students-no-class' || activeTab === 'all-students') && (
        <StudentsListTab
          activeTab={activeTab}
          students={sortedStudents}
          loading={loading}
          editingStudentId={editingStudentId}
          editForm={editForm}
          setEditForm={setEditForm}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          handleSaveStudent={handleSaveStudent}
          handleDeleteStudent={handleDeleteStudent} 
          handleAssignToClass={handleAssignToClass}
          classOptions={classOptions}
          getClassName={getClassName}
        />
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

      <EditClassModal
        isOpen={showEditClassModal}
        onClose={() => {
          setShowEditClassModal(false);
          setSelectedClassForEdit(null);
        }}
        onSuccess={handleClassUpdated}
        classData={selectedClassForEdit}
        classOptions={classOptions}
      />

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
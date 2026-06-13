// src/components/admin/modals/CreateAssignmentModal.js
import React, { useState, useEffect, useCallback } from 'react';
import modalStyles from './TeacherModals.module.css';
import Select from '../../UI/Select';
import Notification from '../../UI/Notification';

const CreateAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  teachers, 
  subjects, 
  classes,
  preselectedTeacher,
  preselectedSubject 
}) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    classId: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const token = localStorage.getItem('token');

  // Загрузка классов
  const [availableClasses, setAvailableClasses] = useState([]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/classes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableClasses(data.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки классов:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen, fetchClasses]);

  // ✅ Предзаполнение без блокировки - устанавливаем значения, но не блокируем
  useEffect(() => {
    if (preselectedTeacher && preselectedTeacher.user_id) {
      setFormData(prev => ({ ...prev, teacherId: preselectedTeacher.user_id }));
    }
  }, [preselectedTeacher]);

  useEffect(() => {
    if (preselectedSubject && preselectedSubject.subject_id) {
      setFormData(prev => ({ ...prev, subjectId: preselectedSubject.subject_id }));
    }
  }, [preselectedSubject]);

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        teacherId: '',
        subjectId: '',
        classId: ''
      });
    } else {
      // При открытии устанавливаем предвыбранные значения
      if (preselectedTeacher?.user_id) {
        setFormData(prev => ({ ...prev, teacherId: preselectedTeacher.user_id }));
      }
      if (preselectedSubject?.subject_id) {
        setFormData(prev => ({ ...prev, subjectId: preselectedSubject.subject_id }));
      }
    }
  }, [isOpen, preselectedTeacher, preselectedSubject]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 3000);
  };

  const teacherOptions = teachers.map(t => ({
    value: t.user_id,
    label: `${t.last_name} ${t.first_name} ${t.patronymic || ''}`.trim()
  }));

  const subjectOptions = subjects.map(s => ({
    value: s.subject_id,
    label: s.name
  }));

  const classOptions = availableClasses.map(c => ({
    value: c.class_id,
    label: `${c.grade_year}${c.grade_letter}`
  }));

  const handleCreate = async () => {
    if (!formData.teacherId) {
      showNotification('Выберите учителя', 'error');
      return;
    }
    if (!formData.subjectId) {
      showNotification('Выберите предмет', 'error');
      return;
    }
    if (!formData.classId) {
      showNotification('Выберите класс', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/assignment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: formData.teacherId,
          subjectId: parseInt(formData.subjectId),
          classId: parseInt(formData.classId)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Назначение успешно создано', 'success');
        onSuccess();
        setTimeout(() => {
          onClose();
          setFormData({ teacherId: '', subjectId: '', classId: '' });
        }, 1000);
      } else {
        showNotification(data.error || 'Ошибка создания назначения', 'error');
      }
    } catch (err) {
      console.error('Ошибка создания:', err);
      showNotification('Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ teacherId: '', subjectId: '', classId: '' });
    setNotification({ message: '', type: 'success' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay} onClick={handleClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Создание назначения</h2>
        
        <div className={modalStyles.modalForm}>
          <div className={modalStyles.formGroup}>
            <label>Учитель</label>
            <Select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={teacherOptions}
              placeholder="Выберите учителя"
              // ✅ Нет disabled - поле доступно для изменения
            />
          </div>
          
          <div className={modalStyles.formGroup}>
            <label>Предмет</label>
            <Select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={subjectOptions}
              placeholder="Выберите предмет"
              // ✅ Нет disabled - поле доступно для изменения
            />
          </div>
          
          <div className={modalStyles.formGroup}>
            <label>Класс</label>
            <Select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={classOptions}
              placeholder="Выберите класс"
            />
          </div>
          
          <div className={modalStyles.modalActions}>
            <button 
              className={modalStyles.cancelModalBtn} 
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              className={modalStyles.saveModalBtn} 
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
      
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default CreateAssignmentModal;
import React, { useState, useEffect } from 'react';
import styles from './TeacherModals.module.css';
import Select from '../../UI/Select';
import Notification from '../../UI/Notification';

const EditAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  assignment,
  teachers,
  subjects
}) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    classId: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [availableClasses, setAvailableClasses] = useState([]);
  const token = localStorage.getItem('token');

  // Загрузка классов
  const fetchClasses = async () => {
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
  };

  // Инициализация данных при открытии
  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  // Устанавливаем данные назначения в форму
  useEffect(() => {
    if (assignment && isOpen && teachers.length > 0 && subjects.length > 0) {
      const teacherId = assignment.teacher?.teacher_id || assignment.teacher_id || '';
      const subjectId = assignment.subject?.subject_id || assignment.subject_id;
      const classId = assignment.class?.class_id || assignment.class_id;
            
      setFormData({
        teacherId: teacherId?.toString() || '',
        subjectId: subjectId?.toString() || '',
        classId: classId?.toString() || ''
      });
    }
  }, [assignment, isOpen, teachers, subjects]);

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

  const handleUpdate = async () => {
    if (!formData.teacherId || !formData.subjectId || !formData.classId) {
      showNotification('Заполните все поля', 'error');
      return;
    }
    
    setLoading(true);
    
    const updateData = {
      teacherId: formData.teacherId,
      subjectId: parseInt(formData.subjectId),
      classId: parseInt(formData.classId)
    };
        
    try {
      const response = await fetch(`http://localhost:3000/assignment/${assignment.assignment_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Назначение обновлено', 'success');
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        showNotification(data.error || 'Ошибка обновления', 'error');
      }
    } catch (err) {
      console.error('Ошибка обновления:', err);
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

  if (!isOpen || !assignment) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Редактирование назначения</h2>
        
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Учитель</label>
            <Select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={teacherOptions}
              placeholder="Выберите учителя"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Предмет</label>
            <Select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={subjectOptions}
              placeholder="Выберите предмет"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Класс</label>
            <Select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={classOptions}
              placeholder="Выберите класс"
            />
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.cancelModalBtn} 
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              className={styles.saveModalBtn} 
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
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

export default EditAssignmentModal;
import React, { useState } from 'react';
import LessonRow from './LessonRow';
import Select from '../../UI/Select';
import styles from './DaySchedule.module.css';
import SaveButton from '../../UI/SaveButton';
import CancelButton from '../../UI/CancelButton';

const DaySchedule = ({ 
  dayName,
  date, 
  lessons,
  lessonSlots, 
  assignments,
  roomOptions,
  onAddLesson, 
  onUpdateLesson, 
  onDeleteLesson  
}) => {
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [addingLessonNumber, setAddingLessonNumber] = useState(null);
  const [newLessonForm, setNewLessonForm] = useState({
    assignmentId: '',
    roomId: '',
  });

  const lessonsByNumber = {};
  lessons.forEach(lesson => {
    lessonsByNumber[lesson.lesson_number] = lesson;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const subjectOptions = assignments.map(a => ({
    value: a.assignment_id,
    label: `${a.subject.name}`
  }));

  const handleAddClick = (lessonNumber) => {
    setAddingLessonNumber(lessonNumber);
    setNewLessonForm({ assignmentId: '', roomId: '' });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewLessonForm({ ...newLessonForm, [name]: value });
  };

  const handleAddSave = async (lessonNumber) => {
    if (!newLessonForm.assignmentId) {
      alert('Выберите предмет');
      return;
    }
    await onAddLesson(lessonNumber, date, {
      assignmentId: newLessonForm.assignmentId,
      roomId: newLessonForm.roomId,
    });
    setAddingLessonNumber(null);
    setNewLessonForm({ assignmentId: '', roomId: '' });
  };

  const handleAddCancel = () => {
    setAddingLessonNumber(null);
    setNewLessonForm({ assignmentId: '', roomId: '' });
  };

  const selectedAssignment = assignments.find(a => a.assignment_id === parseInt(newLessonForm.assignmentId));

  return (
    <div className={styles.daySchedule}>
      <div className={styles.dayHeader}>
        <h3 className={styles.dayTitle}>{dayName}</h3>
        {date && <span className={styles.date}>{formatDate(date)}</span>}
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>№</th>
            <th>Предмет</th>
            <th>Учитель</th>
            <th>Кабинет</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {lessonSlots.map((slot) => {
            const lesson = lessonsByNumber[slot.lesson_number];
            const isAdding = addingLessonNumber === slot.lesson_number;

            if (isAdding) {
              return (
                <tr key={slot.lesson_number}>
                  <td className={styles.lessonNumber}>{slot.lesson_number}</td>
                  <td className={styles.cell}>
                    <Select
                      value={newLessonForm.assignmentId}
                      onChange={handleAddChange}
                      options={subjectOptions}
                      placeholder="Выберите предмет"
                      name="assignmentId"
                    />
                  </td>
                  <td className={styles.cell}>
                    {selectedAssignment ? `${selectedAssignment.teacher.last_name} ${selectedAssignment.teacher.first_name}` : '—'}
                  </td>
                  <td className={styles.cell}>
                    <Select
                      value={newLessonForm.roomId}
                      onChange={handleAddChange}
                      options={roomOptions}
                      placeholder="Выберите кабинет"
                      name="roomId"
                    />
                  </td>
                  <td className={styles.actionsCell}>
                    <SaveButton onClick={() => handleAddSave(slot.lesson_number)} />
                    <CancelButton onClick={handleAddCancel} />
                  </td>
                </tr>
              );
            }
  
            return (
              <LessonRow
                key={slot.lesson_number}
                lesson={lesson}
                lessonNumber={slot.lesson_number}
                assignments={assignments}
                roomOptions={roomOptions}
                onUpdate={onUpdateLesson}
                onDelete={onDeleteLesson}
                onAdd={() => handleAddClick(slot.lesson_number)}
                isEditing={editingLessonId === lesson?.lesson_id}
                onStartEdit={() => setEditingLessonId(lesson?.lesson_id)}
                onCancelEdit={() => setEditingLessonId(null)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DaySchedule;
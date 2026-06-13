import React from 'react';
import EditButton from '../../../components/UI/EditButton';
import DeleteButton from '../../../components/UI/DeleteButton';
import AddButton from '../../../components/UI/AddButton';
import styles from '../../../pages/admin/TeachersManagement.module.css';

const SubjectsList = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  onEditSubject,
  onDeleteSubject,
  onCreateSubject,
}) => {
  // Сортировка предметов по названию
  const sortedSubjects = [...subjects].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );

 return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3>Предметы</h3>
        <AddButton
          onClick={onCreateSubject}
          text=""
          title="Добавить предмет"
          className={styles.smallAddButton}
        />
      </div>
      <div className={styles.columnContent}>
        {sortedSubjects.length === 0 ? (
          <div className={styles.emptyMessage}>Нет предметов</div>
        ) : (
          sortedSubjects.map(subject => (
            <div
              key={subject.subject_id}
              className={`${styles.subjectItem} ${selectedSubject?.subject_id === subject.subject_id ? styles.active : ''}`}
              onClick={() => onSelectSubject(subject)}
            >
              <span className={styles.subjectName}>
                {subject.name}
              </span>
              <div className={styles.itemActions}>
                <EditButton 
                  onClick={() => onEditSubject(subject)} 
                  title="Редактировать предмет"
                  small
                />
                <DeleteButton 
                  onClick={() => onDeleteSubject(subject)} 
                  title="Удалить предмет"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectsList;
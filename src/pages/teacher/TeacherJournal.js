import React, { useCallback, useEffect, useState } from "react";
import styles from "./TeacherJournal.module.css"
import Tabs from "../../components/UI/Tabs";
import { useAuth } from "../../contexts/AuthContext";
import useMonthNavigation from '../../hooks/useMonthNavigation';
import MonthNavigation from '../../components/UI/MonthNavigation';
import TeacherJournalTable from "../../components/teacher/Journal/TeacherJournalTable";
import useJournalData from '../../hooks/useJournalData';
import Select from "../../components/UI/Select";

const TeacherJournal = () => {
  const { user } = useAuth();
  const [activeTabJournal, setactiveTabJournal] = useState('gradeJournal');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isSubjectDisabled, setIsSubjectDisabled] = useState(true);
  const token = localStorage.getItem('token');

  const { 
    selectedMonth, 
    months, 
    setMonth 
  } = useMonthNavigation();

   const { 
    students, 
    lessons, 
    gradesData, 
    attendanceData, 
    tableLoading, 
    loading, 
    handleSaveCell, 
    handleDeleteCell 
  } = useJournalData(selectedClass, selectedSubject, activeTabJournal, selectedMonth);

  const tabsJournal = [
    { id: 'gradeJournal', label: 'Оценки' },
    { id: 'attendanceJournal', label: 'Посещаемость' },
  ];
  
  // Преобразуем классы для Select
  const classOptions = classes.map(cls => ({
    value: cls.class_id,
    label: cls.class_name
  }));

  // Преобразуем предметы для Select
  const subjectOptions = subjects.map(subj => ({
    value: subj.subject_id,
    label: subj.subject_name
  }));

  // Получаем все назначения учителя
  const fetchTeacherAssignments = useCallback(async () => {
    console.log("пытаемся получить назначений")
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:3000/assignment/teacher/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Назначения:', data);
      
      if (data.success) {
        const uniqueClasses = [];
        const seenClassIds = new Set();
        const assignmentsData = data.data.assignments;
        
        assignmentsData.forEach(assignment => {
          if (assignment.class && !seenClassIds.has(assignment.class.class_id)) {
            seenClassIds.add(assignment.class.class_id);
            uniqueClasses.push({
              class_id: assignment.class.class_id,
              class_name: assignment.class.class_name
            });
          }
        });
        
        setClasses(uniqueClasses);
        window.teacherAssignments = assignmentsData;
        
        if (uniqueClasses.length > 0 && !selectedClass) {
          setSelectedClass(uniqueClasses[0]);
          setIsSubjectDisabled(false);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки назначений:', err);
    }
  }, [user?.id, token, selectedClass]);

  // Получаем предметы для выбранного класса
  const fetchSubjectsForClass = useCallback((classId) => {
    if (!classId) return;
    
    const assignments = window.teacherAssignments || [];
    const filteredSubjects = [];
    const seenSubjectIds = new Set();
    
    assignments.forEach(assignment => {
      if (assignment.class && assignment.class.class_id === classId && 
          assignment.subject && !seenSubjectIds.has(assignment.subject.subject_id)) {
        seenSubjectIds.add(assignment.subject.subject_id);
        filteredSubjects.push({
          subject_id: assignment.subject.subject_id,
          subject_name: assignment.subject.name
        });
      }
    });
    
    setSubjects(filteredSubjects);
    
    if (filteredSubjects.length > 0) {
      setSelectedSubject(filteredSubjects[0]);
    } else {
      setSelectedSubject(null);
    }
  }, []);

   // useEffect hooks
  useEffect(() => {
    if (user?.id) {
      fetchTeacherAssignments();
    }
  }, [user?.id, fetchTeacherAssignments]);
  
  useEffect(() => {
    if (selectedClass) {
      fetchSubjectsForClass(selectedClass.class_id);
      setIsSubjectDisabled(false);
    } else {
      setIsSubjectDisabled(true);
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedClass, fetchSubjectsForClass]);

  const handleClassChange = (e) => {
    const classId = parseInt(e.target.value);
    const selected = classes.find(c => c.class_id === classId);
    setSelectedClass(selected);
    setSelectedSubject(null);
  };

  const handleSubjectChange = (e) => {
    const subjectId = parseInt(e.target.value);
    const selected = subjects.find(s => s.subject_id === subjectId);
    setSelectedSubject(selected);
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const currentData = activeTabJournal === 'gradeJournal' ? gradesData : attendanceData;
  const currentType = activeTabJournal === 'gradeJournal' ? 'grade' : 'attendance';

  return (
    <div className={styles.teacherJournal}>
      <Tabs tabs={tabsJournal} activeTab={activeTabJournal} onTabChange={setactiveTabJournal} />

      <div className={styles.filters}>
        <Select
          name="class"
          value={selectedClass?.class_id || ''}
          onChange={handleClassChange}
          options={classOptions}
          placeholder="Выберите класс"
        />
        
        <Select
          name="subject"
          value={selectedSubject?.subject_id || ''}
          onChange={handleSubjectChange}
          options={subjectOptions}
          placeholder={
            isSubjectDisabled || classes.length === 0 
              ? 'Сначала выберите класс' 
              : subjects.length === 0 
                ? 'Нет предметов для этого класса' 
                : 'Выберите предмет'
          }
          disabled={isSubjectDisabled || subjects.length === 0}
        />
      </div>
      <div>
        <MonthNavigation 
          months={months}
          selectedMonth={selectedMonth}
          onMonthChange={setMonth}
        />
      </div>

      <TeacherJournalTable
      students={students}
      lessons={lessons}
      type={currentType}
      data={currentData}
      onSaveCell={handleSaveCell}
      onDeleteCell={handleDeleteCell}
      loading={tableLoading}
    />
  </div>
  );
};

export default TeacherJournal;
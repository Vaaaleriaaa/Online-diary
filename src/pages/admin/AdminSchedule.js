import React, { useState } from 'react';
import styles from './AdminSchedule.module.css';
import Tabs from '../../components/UI/Tabs';
import LessonSlotsTable from '../../components/Schedule/LessonSlot/LessonSlotsTable';
import DiaryAdmin from '../../components/Schedule/DiaryAdmin';

const AdminSchedule = () => {
  const [activeTabSchedule, setActiveTabSchedule] = useState('schedule');

  const tabsSchedule = [
    { id: 'schedule', label: 'Расписание' },
    { id: 'lessonslots', label: 'Ячейки расписания' },
  ];

  return (
    <div className={styles.adminSchedulePage}>
      <main className={styles.main}>
        <Tabs tabs={tabsSchedule} activeTab={activeTabSchedule} onTabChange={setActiveTabSchedule} />
        
        {activeTabSchedule === 'schedule' ? (
          <DiaryAdmin />
        ) : (
          <LessonSlotsTable />
        )}
      </main>
    </div>
  );
};

export default AdminSchedule;
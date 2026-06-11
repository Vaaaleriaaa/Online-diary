// UI/ClassSelector.js
import React from 'react';
import styles from './ClassSelector.module.css';

const ClassSelector = ({ items, selectedId, onSelectedIdChange, placeholder }) => {
  return (
    <div className={styles.selector}>
      <select 
        className={styles.select}
        value={selectedId}
        onChange={(e) => onSelectedIdChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClassSelector;
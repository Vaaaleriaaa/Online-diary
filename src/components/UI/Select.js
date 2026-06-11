// src/components/UI/Select.js
import React from 'react';
import styles from './Select.module.css';

const Select = ({ value, onChange, options, placeholder, name, disabled = false }) => {
  return (
    <select 
      className={styles.select}
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
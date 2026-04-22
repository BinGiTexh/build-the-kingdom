import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box
} from '@mui/material';

export const SkillsInput = ({
  value = [],
  onChange,
  label = 'Skills',
  placeholder = 'Add skills',
  required = false,
  error = false,
  helperText = '',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');

  // Common tech skills for suggestions
  const skillSuggestions = [
    'JavaScript',
    'Python',
    'Java',
    'React',
    'Node.js',
    'SQL',
    'HTML',
    'CSS',
    'TypeScript',
    'Angular',
    'Vue.js',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'DevOps',
    'Agile',
    'Scrum',
    'Project Management',
    'UI/UX Design'
  ];

  const handleDelete = (skillToDelete) => {
    onChange(value.filter(skill => skill !== skillToDelete));
  };

  return (
    <Box>
      <Autocomplete
        multiple
        options={skillSuggestions}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              onDelete={() => handleDelete(option)}
              key={option}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={error}
            helperText={helperText}
          />
        )}
        disabled={disabled}
        freeSolo
        autoSelect
        filterSelectedOptions
        disableCloseOnSelect
      />
    </Box>
  );
};


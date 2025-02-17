import React from 'react'
import { useState } from 'react';
import './viewprod.css'

import TextField from '@mui/material/TextField';

const Viewprod = () => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  return (
    <><TextField className="search"
          label="Search"
          value={query}
          onChange={handleChange}
          variant="outlined" /></>
  );
};

export default Viewprod
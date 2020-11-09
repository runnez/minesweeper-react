import React, { useState } from 'react'
import styled from 'styled-components'

const Form = styled.form`
  label {
    display: block;
    margin: 0 0 4px;
    font-size: 14px;
    line-height: 14px;
  }
`

const FormBody = styled.div`
  display: flex;
  margin: 0 0 4px;
`

const Settings = ({ onProceed }) => {
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(10);
  const [mines, setMines] = useState(16);

  const handleProceed = () => {
    onProceed({
      rows,
      cols,
      mines
    })
  }

  return (
    <Form>
      <FormBody>
        <FormField value={rows} placeholder={16} onChange={setRows} />
        <FormField value={cols} placeholder={30} onChange={setCols} />
        <FormField value={mines} placeholder={99} onChange={setMines} />
      </FormBody>
      <button onClick={handleProceed}>Proceed</button>
    </Form>
  );
};

const FormField = ({ value, placeholder, onChange }) => {
  return (
    <div>
      <label>Rows count</label>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export default Settings;

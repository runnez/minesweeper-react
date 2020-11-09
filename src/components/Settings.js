import React, { useState } from 'react'
import styled from 'styled-components'

const Form = styled.form`
  padding: 7px;
  background: silver;

  label {
    display: block;
    margin: 0 0 4px;
    font-size: 12px;
    line-height: 14px;
  }
`

const FormBody = styled.div`
  display: flex;
  margin: 0 0 4px;
`

const Settings = ({ initial, onProceed }) => {
  const [rows, setRows] = useState(initial.rows);
  const [cols, setCols] = useState(initial.cols);
  const [mines, setMines] = useState(initial.mines);
  const [debug, setDebug] = useState(initial.debug);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    setError('')

    e.preventDefault()

    if (mines - 10 > rows * cols) {
      return setError('too many mines')
    }

    onProceed({
      rows,
      cols,
      mines,
      debug
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormBody>
        <FormField
          label="Rows"
          value={rows}
          min={9}
          max={35}
          onChange={setRows}
        />
        <FormField
          label="Cols"
          value={cols}
          placeholder={30}
          min={9}
          max={35}
          onChange={setCols}
        />
        <FormField
          label="Mines"
          value={mines}
          min={0}
          max={500}
          placeholder={99}
          onChange={setMines}
        />
        <label>
          debug
          <br/>

          <input
            type="checkbox"
            checked={debug}
            onChange={() => setDebug(!debug)}
          />
        </label>
      </FormBody>
      {error && <><br /><br />{error}</>}
      <button>Play</button>
    </Form>
  );
};

const FormField = ({ label, value, max, min, placeholder, onChange }) => {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        max={max}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export default Settings;

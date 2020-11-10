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

const Title = styled.div`
  margin: 0 0 5px;
  font-weight: 700;
  font-size: 18px;
`

const Error = styled.div`
  margin: 0 0 5px;
  color: red;
  font-size: 12px;
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
    e.preventDefault()

    setError('')

    const cells = rows * cols

    if (mines / cells > 0.9 || cells - mines < 11) {
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
      <Title>React Minesweeper</Title>

      <FormBody>
        <FormField
          label="Rows"
          value={rows}
          min={5}
          max={35}
          onChange={setRows}
        />
        <FormField
          label="Cols"
          value={cols}
          placeholder={30}
          min={8}
          max={35}
          onChange={setCols}
        />
        <FormField
          label="Mines"
          value={mines}
          min={1}
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
      {error && <Error>{error}</Error>}
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
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default Settings;

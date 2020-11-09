import React, { useState } from 'react'
import styled from 'styled-components'
import Game from './components/Game'
import Settings from './components/Settings'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`

function App() {
  const [settings, setSettings] = useState({ rows: 9, cols: 16, mines: 16, debug: false });
  const [isEditing, setIsEditing] = useState(true);

  const handleStart = settings => {
    setSettings(settings)
    setIsEditing(false)
  }
  const handleEdit = () => setIsEditing(true)

  return (
    <Wrapper>
      {isEditing ? <Settings initial={settings} onProceed={handleStart} /> :
        <Game settings={settings} onEdit={handleEdit} />}
    </Wrapper>
  );
}

export default App;

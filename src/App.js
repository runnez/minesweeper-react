import React, { useState } from 'react'
import styled from 'styled-components'
import Game from './components/Game'
import Settings from './components/Settings'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`

function App() {
  const [settings, setSettings] = useState({ rows: 80, cols: 80, mines: 100, debug: false });
  const [isEditing, setIsEditing] = useState(true);

  const handleStart = settings => {
    setSettings(settings)
    setIsEditing(false)
  }
  const handleEdit = () => setIsEditing(true)

  return (
    <Wrapper>
      {isEditing ?
        <Settings
          initial={settings}
          onProceed={handleStart}
        /> :
        <Game
          settings={settings}
          onEdit={handleEdit}
        />}
    </Wrapper>
  );
}

export default App;

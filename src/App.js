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
  const [settings, setSetting] = useState(null);

  return (
    <Wrapper>
      {settings ? <Game {...settings} /> : <Settings />}
    </Wrapper>
  );
}

export default App;

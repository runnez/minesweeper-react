import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Timer from './Timer'
import Game from './Game'
import Digits from './Digits'

const Wrapper = styled.div`
  padding: 7px;
  background: silver;
  box-shadow: 1px 1px 2px 0px rgba(0,0,0,0.5);
`

const Header = styled.div`
  display: flex;
  margin: 0 0 6px;
  justify-content: space-between;
  border: 2px solid #8B8B8B;
  border-right-color: #fff;
  border-bottom-color: #fff;
  padding: 10px;
`

const HeaderSide = styled.div`
  display: flex;
  ${props => props.right && 'justify-content: flex-end;'}
`

const RestartButton = styled.div`
  cursor: pointer;
  width: 20px;
`

const EditButton = styled.div`
  margin: -3px 0 4px;
  cursor: pointer;
  font-size: 12px;
`

const GameController = ({ settings, onEdit }) => {
  console.log('render GameController')

  const [attempt, setAttempt] = useState(0)
  const [gameState, setGameState] = useState('idle')
  const [remainFlags, setRemainFlags] = useState(settings.mines)

  const handleRestart = useCallback(() => {
    setAttempt(attempt + 1)
    setGameState('idle')
  }, [attempt])

  const handleStart = useCallback(() => {
    setGameState('started')
  }, [])

  const handleWin = useCallback(() => {
    setGameState('win')
  }, [])

  const handleOver = useCallback(() => {
    setGameState('loss')
  }, [])

  return (
    <Wrapper>
      <EditButton onClick={onEdit}>Settings</EditButton>
      <Header>
        <HeaderSide>
          <Digits value={remainFlags} />
        </HeaderSide>

        <RestartButton
          onClick={handleRestart}
        >
          {{ loss: '😵', win: '🏆' }[gameState] || '🙂' }
        </RestartButton>

        <HeaderSide right>
          <Timer
            key={attempt}
            paused={gameState !== 'started'}
          />
        </HeaderSide>
      </Header>

      <Game
        key={attempt}
        settings={settings}
        onStart={handleStart}
        onWin={handleWin}
        onOver={handleOver}
        onFlag={setRemainFlags}
      />
    </Wrapper>
  );
};

export default GameController;

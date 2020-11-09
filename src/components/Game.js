import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Timer from './Timer'
import Board from './Board'
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

const Game = ({ settings, onEdit }) => {
  const [attempt, setAttempt] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)

  const handleRestart = useCallback(() => {
    setAttempt(attempt + 1)
    setIsGameOver(false)
    setIsGameStarted(false)
  }, [attempt])

  const handleGameStart = useCallback(() => {
    setIsGameStarted(true)
  }, [])

  const handleGameOver = useCallback(() => {
    setIsGameOver(true)
  }, [])

  console.log('render game')

  return (
    <Wrapper>
      <EditButton onClick={onEdit}>Settings</EditButton>
      <Header>
        <HeaderSide>
          <Digits value={settings.mines} />
        </HeaderSide>

        <RestartButton
          onClick={handleRestart}
        >
          {isGameOver ? '😵' : '🙂'}
        </RestartButton>

        <HeaderSide right>
          <Timer
            key={attempt}
            paused={isGameOver || !isGameStarted}
          />
        </HeaderSide>
      </Header>

      <Board
        key={attempt}
        settings={settings}
        isGameOver={isGameOver}
        onGameStart={handleGameStart}
        isGameStarted={isGameStarted}
        onGameOver={handleGameOver}
      />
    </Wrapper>
  );
};

export default Game;

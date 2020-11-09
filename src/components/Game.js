import React, { useState } from 'react'
import styled from 'styled-components'
import Timer from './Timer'
import Board from './Board'
import Digits from './Digits'
import Settings from './Settings'

const Wrapper = styled.div`
  padding: 7px;
  width: 494px;
  height: 324px;
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
  width: 100px;
  ${props => props.right && 'justify-content: flex-end;'}
`

const RestartButton = styled.div`
  cursor: pointer;
  width: 20px;
`

const Game = ({ mines, rows, cols }) => {
  const [attempt, setAttempt] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStart = () => {
    setAttempt(attempt + 1)
    setIsGameOver(false)
    setIsGameStarted(false)
  }

  return (
    <Wrapper>
      <Header>
        <HeaderSide>
          <Digits value={mines} />
        </HeaderSide>

        <RestartButton
          onClick={handleStart}
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
        mines={mines}
        cols={cols}
        rows={rows}
        isGameOver={isGameOver}
        onGameStart={() => setIsGameStarted(true)}
        onGameOver={() => setIsGameOver(true)}
      />
    </Wrapper>
  );
};

export default Game;

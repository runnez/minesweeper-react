import React, { useCallback, useReducer } from 'react'
import styled from 'styled-components'
import { reducer, init, actionTypes, gameStateTypes } from './Game.reducer'
import Cell from './Cell'
import Timer from './Timer'
import Digits from './Digits'

const Wrapper = styled.div`
  padding: 7px;
  background: silver;
  box-shadow: 1px 1px 2px 0px rgba(0,0,0,0.5);
`

const EditButton = styled.div`
  margin: -3px 0 4px;
  cursor: pointer;
  font-size: 12px;
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

const Board = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${props => props.disabled && `pointer-events: none;`}
  width: ${props => props.cols * 16}px
`

const Game = ({
  settings,
  onEdit
}) => {
  console.log('render Game')
  const [state, dispatch] = useReducer(reducer, { settings }, init)

  const handleReveal = useCallback(payload =>
    dispatch({ type: actionTypes.reveal, payload })
  , [])

  const handleFlag = useCallback(payload =>
    dispatch({ type: actionTypes.flag, payload })
  , [])

  const handleRestart = useCallback(payload =>
    dispatch({ type: actionTypes.restart, payload })
  , [])

  return (
    <Wrapper>
      <EditButton onClick={onEdit}>Settings</EditButton>

      <Header>
        <HeaderSide>
          <Digits value={state.remainFlags} />
        </HeaderSide>

        <RestartButton
          onClick={handleRestart}
        >
          {{
            [gameStateTypes.lost]: '😵',
            [gameStateTypes.won]: '🏆',
            [gameStateTypes.idle]: '🙂',
            [gameStateTypes.started]: '🙂'
          }[state.gameState]}
        </RestartButton>

        <HeaderSide right>
          <Timer
            key={state.attempt}
            paused={state.gameState !== gameStateTypes.started}
          />
        </HeaderSide>
      </Header>

      <Board
        cols={state.settings.cols}
        disabled={[gameStateTypes.lost, gameStateTypes.won].includes(state.gameState)}
      >
        {state.grid.map(cell => {
          return (
            <Cell
              key={cell}
              id={cell}
              opened={Boolean(state.opened[cell])}
              flagged={Boolean(state.flagged[cell])}
              mined={Boolean((state.gameState === gameStateTypes.lost || settings.debug) && state.mined[cell])}
              exploded={state.explodedCell === cell}
              revealed={Boolean((state.gameState === gameStateTypes.lost || settings.debug) && state.mined[cell])}
              count={(state.opened[cell] && state.adjacentMinesCount[cell]) || 0}
              onReveal={handleReveal}
              onFlag={handleFlag}
            />
          )
        })}
      </Board>
    </Wrapper>
  );
};

export default Game;


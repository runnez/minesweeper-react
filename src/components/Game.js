import React, { useCallback, useEffect, useReducer } from 'react'
import styled from 'styled-components'
import Cell from './Cell'
import { init, reducer, calcAdjacentMinesCounter } from './Game.reducer';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${props => props.disabled && `pointer-events: none;`}
  width: ${props => props.cols * 16}px
`

const Game = React.memo(({
  settings,
  onStart,
  onOver,
  onWin,
  onFlag
}) => {
  console.log('render Game')

  const [state, dispatch] = useReducer(
    reducer,
    { settings },
    init
  )

  useEffect(() => {
    if (state.isStarted) {
      onStart()
    }
  }, [state.isStarted, onStart])

  useEffect(() => {
    if (state.explodedKey) {
      onOver()
    }
  }, [state.explodedKey, onOver])

  useEffect(() => {
    onFlag(state.remainFlags)
  }, [state.remainFlags, onFlag])

  useEffect(() => {
    if (state.isWon) {
      onWin()
    }
  }, [state.isWon, onWin])

  const handleReveal = useCallback(payload =>
    dispatch({ type: 'REVEAL', payload })
  , [dispatch])

  const handleFlag = useCallback(payload =>
    dispatch({ type: 'FLAG', payload })
  , [dispatch])

  return (
    <Wrapper
      cols={state.settings.cols}
      disabled={state.isWon || state.isLost}
    >
      {state.grid.map(cell => {
        return (
          <Cell
            key={cell}
            id={cell}
            opened={Boolean(state.opened[cell])}
            flagged={Boolean(state.flagged[cell])}
            mined={Boolean((state.isLost || settings.debug) && state.mined[cell])}
            exploded={state.explodedKey === cell}
            revealed={Boolean((state.isLost || settings.debug) && state.mined[cell])}
            onReveal={handleReveal}
            onFlag={handleFlag}
            count={(state.opened[cell] && calcAdjacentMinesCounter(state.mined, cell)) || 0}
          />
        )
      })}
    </Wrapper>
  );
});

export default Game;


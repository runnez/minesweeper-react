import React, { useCallback, useEffect, useReducer } from 'react'
import styled from 'styled-components'
import Cell from './Cell'

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
  console.log('render game')

  const [state, dispatch] = useReducer(
    reducer,
    { settings },
    init
  )

  useEffect(() => {
    if (state.isStarted) {
      console.log('game start', state.isStarted)
      onStart()
    }
  }, [state.isStarted, onStart])

  useEffect(() => {
    if (state.explodedKey) {
      console.log('game over')
      onOver()
    }
  }, [state.explodedKey, onOver])

  useEffect(() => {
    onFlag(state.remainFlags)
  }, [state.remainFlags, onFlag])

  useEffect(() => {
    if (state.isWon) {
      console.log('bam')
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
      {state.grid.map(([rowIdx, colIdx]) => {
        const cellKey = getCellKey(rowIdx, colIdx)

        return (
          <Cell
            key={cellKey}
            id={cellKey}
            opened={Boolean(state.opened[cellKey])}
            flagged={Boolean(state.flagged[cellKey])}
            mined={Boolean((state.isLost || settings.debug) && state.mined[cellKey])}
            exploded={state.explodedKey === cellKey}
            revealed={Boolean((state.isLost || settings.debug) && state.mined[cellKey])}
            onReveal={handleReveal}
            onFlag={handleFlag}
            count={(state.opened[cellKey] && calcMinesAroundCounter(state.mined, rowIdx, colIdx)) || 0}
          />
        )
      })}
    </Wrapper>
  );
});

export default Game;

function init({ settings }) {
  const grid = []

  for (let rowIdx = 0; rowIdx < settings.rows; rowIdx++) {
    for (let colIdx = 0; colIdx < settings.cols; colIdx++) {
      grid.push([rowIdx, colIdx])
    }
  }

  return {
    settings,
    grid,
    mined: {},
    opened: {},
    flagged: {},
    remainFlags: settings.mines,
    isStarted: false,
    isWon: false,
    isLost: false
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'FLAG': {
      if (state.remainFlags <= 0 && !state.flagged[action.payload]) return state

      const flagged = { ...state.flagged }

      if (state.flagged[action.payload]) {
        delete flagged[action.payload]
      } else {
        flagged[action.payload] = true
      }

      return {
        ...state,
        flagged,
        remainFlags: state.settings.mines - Object.keys(flagged).length,
        isWon: Object.keys(state.mined).every(key => flagged[key])
      }
    }
    case 'REVEAL': {
      const cellKey = action.payload

      const [rowIdx, colIdx] = cellKey.split('-').map(Number)

      let mines = state.mined

      if (!state.isStarted) {
        let possibleMines = generateMines(state.settings.mines, state.settings.rows, state.settings.cols)

        while (possibleMines[getCellKey(rowIdx, colIdx)] || calcMinesAroundCounter(possibleMines, rowIdx, colIdx) > 0) {
          possibleMines = generateMines(state.settings.mines, state.settings.rows, state.settings.cols)
        }

        mines = possibleMines
      }

      const isExploded = Boolean(mines[cellKey])

      return {
        ...state,
        mined: mines,
        isStarted: true,
        explodedKey: isExploded ? cellKey : '',
        isLost: isExploded,
        opened: isExploded ? state.opened : {
          ...state.opened,
          ...getOpenedArea(mines, rowIdx, colIdx, state.settings.rows, state.settings.cols, state.isStarted)
        }
      }
    }
    default:
      return state
  }
}

function generateMines(minesCount, rowsCount, colsCount) {
  const mines = {}

  while (minesCount > 0) {
    const rowIdx = Math.floor(Math.random() * rowsCount)
    const colIdx = Math.floor(Math.random() * colsCount)

    const cellKey = getCellKey(rowIdx, colIdx)

    if (mines[cellKey]) {
      continue
    }

    mines[cellKey] = true
    minesCount--
  }

  return mines
}

function getAdjastendPoints(row, col) {
  return [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1], [1,0], [1,1]
  ].map(([offset1, offset2]) => [offset1 + row, offset2 + col])
}

function calcMinesAroundCounter(mined, rowIdx, colIdx) {
  return getAdjastendPoints(rowIdx, colIdx).reduce((acc, pair) => acc + (mined[getCellKey(...pair)] || 0), 0)
}

function getOpenedArea(mined, rowIdx, colIdx, rowMax, colMax, shallow) {
  const stack = [[rowIdx, colIdx]]
  const result = {}

  if (shallow) {
    if (calcMinesAroundCounter(mined, rowIdx, colIdx) > 0) {
      return { [getCellKey(rowIdx, colIdx)]: true }
    }
  }

  while (stack.length) {
    const [rIdx, cIdx] = stack.pop()
    result[getCellKey(rIdx, cIdx)] = true

    getAdjastendPoints(rIdx, cIdx).forEach(([r, c]) => {
      if (
        r > -1 && c > -1 && r < rowMax && c < colMax &&
        !mined[getCellKey(r, c)] && !result[getCellKey(r, c)]
      ) {
        if (calcMinesAroundCounter(mined, r, c) === 0) {
          stack.push([r, c])
        } else {
          result[getCellKey(r, c)] = true
        }
      }
    })
  }

  return result
}

function getCellKey(rowIdx, colIdx) {
  return [rowIdx, colIdx].join('-')
}

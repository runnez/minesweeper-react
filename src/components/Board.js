import React, { useCallback, useEffect, useReducer } from 'react'
import styled from 'styled-components'
import Cell from './Cell'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  ${props => props.disabled && `pointer-events: none;`}
  width: ${props => props.cols * 16}px
`

const Board = ({
  settings,
  isGameOver,
  onGameOver,
  isGameStarted,
  onGameStart
}) => {
  const [state, dispatch] = useReducer(
    reducer,
    { settings },
    init
  )

  console.log('render board')

  useEffect(() => {
    if (!isGameStarted) {
      console.log('game start', isGameStarted)
      onGameStart()
    }
  }, [isGameStarted, onGameStart])

  useEffect(() => {
    if (state.explodedKey) {
      console.log('game over')
      onGameOver()
    }
  }, [state.explodedKey, onGameOver])

  const handleReveal = useCallback(payload =>
    dispatch({ type: 'REVEAL', payload })
  , [dispatch])

  const handleFlag = useCallback(payload =>
    dispatch({ type: 'FLAG', payload })
  , [dispatch])

  return (
    <Wrapper
      cols={state.settings.cols}
      disabled={isGameOver}
    >
      {state.grid.map(([rowIdx, colIdx]) => {
        const cellKey = getCellKey(rowIdx, colIdx)

        return (
          <Cell
            key={cellKey}
            id={cellKey}
            opened={Boolean(state.opened[cellKey])}
            flagged={Boolean(state.flagged[cellKey])}
            mined={Boolean((isGameOver || settings.debug) && state.mined[cellKey])}
            exploded={state.explodedKey === cellKey}
            revealed={Boolean((isGameOver || settings.debug) && state.mined[cellKey])}
            onReveal={handleReveal}
            onFlag={state.remainFlags ? handleFlag : undefined}
            count={(state.opened[cellKey] && calcMinesAroundCounter(state.mined, rowIdx, colIdx)) || 0}
          />
        )
      })}
    </Wrapper>
  );
};

function init({ settings }) {
  return {
    settings,
    grid: generateGrid(settings.rows, settings.cols),
    mined: {},
    opened: {},
    flagged: {},
    remainFlags: settings.mines,
    isFirstStep: true
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'FLAG': {
      return {
        ...state,
        flagged: {
          ...state.flagged,
          remainFlags: state.settings.mines - Object.keys(state.flagged).length,
          [action.payload]: true
        }
      }
    }
    case 'REVEAL': {
      const cellKey = action.payload

      const [rowIdx, colIdx] = cellKey.split('-').map(Number)

      let mines = state.mined

      if (state.isFirstStep) {
        let possibleMines = generateMines(state.settings.mines, state.settings.rows, state.settings.cols)

        while (possibleMines[getCellKey(rowIdx, colIdx)] || calcMinesAroundCounter(possibleMines, rowIdx, colIdx) > 0) {
          possibleMines = generateMines(state.settings.mines, state.settings.rows, state.settings.cols)
        }

        mines = possibleMines
      }

      const isExploded = Boolean(mines[cellKey])

      return {
        ...state,
        mined: state.isFirstStep ? mines : state.mined,
        explodedKey: isExploded ? cellKey : '',
        isFirstStep: false,
        opened: isExploded ? state.opened : {
          ...state.opened,
          ...getOpenedArea(mines, rowIdx, colIdx, state.settings.rows, state.settings.cols, !state.isFirstStep)
        }
      }
    }
    default:
      return state
  }
}

function generateGrid(rowsCount, colsCount) {
  const grid = []

  for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
    for (let colIdx = 0; colIdx < colsCount; colIdx++) {
      grid.push([rowIdx, colIdx])
    }
  }

  return grid
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

const getAdjastendPoints = (row, col) =>
  [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1], [1,0], [1,1]
  ].map(([offset1, offset2]) => [offset1 + row, offset2 + col])

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

export default Board;

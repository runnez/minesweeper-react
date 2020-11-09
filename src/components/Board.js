import React, { useState } from 'react'
import styled from 'styled-components'
import Cell from './Cell'

const Wrapper = styled.div`
  ${props => props.disabled && `pointer-events: none;`}
`

const Row = styled.div`
  display: flex;
`

const Board = ({
  rows: rowsCount = 16,
  cols: colsCount = 30,
  mines: minesCount = 99,
  isGameOver,
  onGameOver,
  onGameStart
}) => {
  const [grid] = useState(generateGrid(rowsCount, colsCount))
  const [opened, setOpened] = useState({})
  const [flagged, setFlagged] = useState({})
  const [failed, setFailed] = useState('')
  const [mined, setMined] = useState({})
  const [isFirstStep, setIsFirstStep] = useState(true)

  return (
    <Wrapper disabled={isGameOver}>
      {grid.map((row, rowIdx) => {
        return (
          <Row key={rowIdx}>
            {row.map(colIdx => {
              const cellKey = getCellKey(rowIdx, colIdx)
              return (
                <Cell
                  key={cellKey}
                  opened={opened[cellKey]}
                  flagged={flagged[cellKey]}
                  mined={mined[cellKey]}
                  failed={failed === cellKey}
                  revealed={isGameOver}
                  onReveal={() => {
                    if (flagged[cellKey]) return

                    let mines = mined

                    if (isFirstStep) {
                      let possibleMines = generateMines(minesCount, rowsCount, colsCount)

                      while (possibleMines[getCellKey(rowIdx, colIdx)] || calcMinesAroundCounter(possibleMines, rowIdx, colIdx) > 0) {
                        possibleMines = generateMines(minesCount, rowsCount, colsCount)
                      }

                      setIsFirstStep(false)
                      setMined(possibleMines)
                      mines = possibleMines
                      onGameStart()
                    }

                    if (mines[cellKey]) {
                      onGameOver()
                      setFailed(cellKey)
                    } else {
                      setOpened({
                        ...opened,
                        ...getOpenedArea(mines, rowIdx, colIdx, rowsCount, colsCount, !isFirstStep) }
                      )
                    }
                  }}
                  onFlag={() => {
                    setFlagged({ ...flagged, [cellKey]: true })
                  }}
                  count={calcMinesAroundCounter(mined, rowIdx, colIdx)}
                />
              )
            })}
          </Row>
        )
      })}
    </Wrapper>
  );
};

const generateGrid = (rowsCount, colsCount) => {
  const grid = []

  for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
    grid[rowIdx] = []

    for (let colIdx = 0; colIdx < colsCount; colIdx++) {
      grid[rowIdx].push(colIdx)
    }
  }

  return grid
}

const generateMines = (minesCount, rowsCount, colsCount) => {
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

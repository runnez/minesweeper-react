export const actionTypes = {
  flag: 'FLAG',
  reveal: 'REVEAL',
  restart: 'RESTART'
}

export const gameStateTypes = {
  idle: 'idle',
  started: 'started',
  lost: 'lost',
  won: 'won'
}

export function init({ settings }) {
  const grid = []

  for (let rowIdx = 0; rowIdx < settings.rows; rowIdx++) {
    for (let colIdx = 0; colIdx < settings.cols; colIdx++) {
      grid.push(getCell(rowIdx, colIdx))
    }
  }

  return {
    settings,
    grid,
    attempt: 1,
    gameState: gameStateTypes.idle,
    opened: {},
    flagged: {},
    mined: {},
    adjacentMinesCount: {},
    remainFlags: settings.mines,
    explodedCell: ''
  }
}

export function reducer(state, action) {
  switch (action.type) {
    case actionTypes.restart: {
      return {
        ...init(state),
        attempt: state.attempt + 1
      }
    }
    case actionTypes.flag: {
      const cell = action.payload

      if (state.remainFlags <= 0 && !state.flagged[cell]) return state

      const flagged = { ...state.flagged }
      const minesKeys = Object.keys(state.mined)

      if (state.flagged[cell]) {
        delete flagged[cell]
      } else {
        flagged[cell] = true
      }

      return {
        ...state,
        flagged,
        remainFlags: state.settings.mines - Object.keys(flagged).length,
        gameState: minesKeys.length > 0 && minesKeys.every(key => flagged[key]) ?
          gameStateTypes.won : state.gameState
      }
    }
    case actionTypes.reveal: {
      const cell = action.payload

      if (state.opened[cell]) return state

      let mined = state.mined

      if (mined[cell]) {
        return {
          ...state,
          gameState: gameStateTypes.lost,
          explodedCell: cell
        }
      }

      console.time('reveal')

      if (state.gameState === gameStateTypes.idle) {
        console.time('generateMines')
        mined = generateMines(
          state.settings,
          getAdjacentCells(cell).reduce((acc, key) => ({ ...acc, [key]: true}), { [cell]: true })
        )
        console.timeEnd('generateMines')
      }

      const [opened, adjacentMinesCount] = revealArea({
        mined,
        cell,
        settings: state.settings,
        shallow: state.gameState === gameStateTypes.started,
        adjacentMinesCount: state.adjacentMinesCount
      })

      const result = {
        ...state,
        mined,
        opened: { ...state.opened, ...opened },
        adjacentMinesCount,
        gameState: gameStateTypes.started
      }
      console.timeEnd('reveal')

      return result
    }
    default:
      return state
  }
}

function generateMines(settings, exclude) {
  let minesCount = settings.mines
  const mines = {}

  while (minesCount > 0) {
    const cell = getCell(
      Math.floor(Math.random() * settings.rows),
      Math.floor(Math.random() * settings.cols)
    )

    if (mines[cell] || exclude[cell]) {
      continue
    }

    mines[cell] = true
    minesCount--
  }

  return mines
}

const adjacentOffsets = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1], [1,0], [1,1]
]

function getAdjacentCells(cell, rowCount = Infinity, colCount = Infinity, excludeCells = {}) {
  const [origRow, origCol] = extractCellPos(cell)

  const adjacent = []

  for (let offets of adjacentOffsets) {
    const row = offets[0] + origRow
    const col = offets[1] + origCol

    if (row > -1 && col > -1 &&
        row < rowCount && col < colCount &&
        !excludeCells[getCell(row, col)]) {
          adjacent.push(getCell(row, col))
    }
  }

  return adjacent
}

function revealArea({
  mined,
  cell,
  settings: { rows, cols },
  shallow, // skip revealing if first element has ajacent mines
  adjacentMinesCount // for incremental caching adjacentMinesCount
}) {
  const stack = [cell]
  const area = {}
  const visited = {}
  const adjacent = { ...adjacentMinesCount }

  function calcAdjacentAndCache(cell) {
    if (adjacent[cell] === undefined) {
      adjacent[cell] = getAdjacentCells(cell, rows, cols).reduce((acc, point) => acc + (mined[point] ? 1 : 0), 0)
    }

    return adjacent[cell]
  }

  while (stack.length) {
    const cursor = stack.pop()

    area[cursor] = true
    visited[cursor] = true

    if (shallow && stack.length === 0 && calcAdjacentAndCache(cell) > 0) {
      break
    }

    const cells = getAdjacentCells(cursor, rows, cols, visited)

    for (let cell of cells) {
      visited[cell] = true
    }

    for (const point of cells) {
      if (mined[point]) {
        continue
      }

      if (calcAdjacentAndCache(point) === 0) {
        stack.push(point)
      } else {
        area[point] = true
      }
    }
  }

  return [area, adjacent]
}

function getCell(rowIdx, colIdx) {
  return rowIdx + '/' + colIdx
}

function extractCellPos(cell) {
  return cell.split('/').map(Number)
}

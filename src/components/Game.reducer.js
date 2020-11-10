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
    explodedKey: ''
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
      if (state.remainFlags <= 0 && !state.flagged[action.payload]) return state

      const flagged = { ...state.flagged }
      const minesKeys = Object.keys(state.mined)

      if (state.flagged[action.payload]) {
        delete flagged[action.payload]
      } else {
        flagged[action.payload] = true
      }

      return {
        ...state,
        flagged,
        remainFlags: state.settings.mines - Object.keys(flagged).length,
        gameState: minesKeys.length > 0 && minesKeys.every(key => flagged[key]) ? gameStateTypes.won : state.gameState
      }
    }
    case actionTypes.reveal: {
      const cell = action.payload

      if (state.opened[cell]) return state

      let mines = state.mined
      let adjacentMinesCount = state.adjacentMinesCount

      if (state.gameState === gameStateTypes.idle) {
        mines = generateMines(
          state.settings,
          getAdjacentCells(cell).reduce((acc, key) => ({ ...acc, [key]: true}), { [cell]: true })
        )
        adjacentMinesCount = state.grid.reduce((acc, key) =>
          ({ ...acc, [key]: calcAdjacentMinesCount(mines, key) })
        , {})
      }

      const isLost = Boolean(mines[cell])
      const opened = isLost ? state.opened : {
        ...state.opened,
        ...getOpenedArea(
          mines,
          cell,
          state.settings.rows,
          state.settings.cols,
          state.gameState === gameStateTypes.started
        )
      }

      return {
        ...state,
        mined: mines,
        gameState: isLost ? gameStateTypes.lost : gameStateTypes.started,
        explodedKey: isLost ? cell : '',
        adjacentMinesCount,
        opened
      }
    }
    default:
      return state
  }
}

export function calcAdjacentMinesCount(mined, cell) {
  return getAdjacentCells(cell).reduce((acc, point) => acc + (mined[point] || 0), 0)
}

function getCell(rowIdx, colIdx) {
  return [rowIdx, colIdx].join('/')
}

function extractCellPos(cell) {
  return cell.split('/').map(Number)
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

function getAdjacentCells(cell, rowCount = Infinity, colCount = Infinity) {
  const [row, col] = extractCellPos(cell)

  return [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1], [1,0], [1,1]
  ].map(([offset1, offset2]) =>
    [offset1 + row, offset2 + col]
  ).filter(([r, c]) =>
    r > -1 && c > -1 && r < rowCount && c < colCount
  ).map(pair => getCell(pair[0], pair[1]))
}

function getOpenedArea(mines, cell, rowCount, colCount, shallow) {
  if (shallow) {
    if (calcAdjacentMinesCount(mines, cell) > 0) {
      return { [cell]: true }
    }
  }

  const stack = [cell]
  const result = {}

  while (stack.length) {
    const cursor = stack.pop()
    result[cursor] = true

    getAdjacentCells(cursor, rowCount, colCount).forEach(point => {
      if (!mines[point] && !result[point]) {
        if (calcAdjacentMinesCount(mines, point) === 0) {
          stack.push(point)
        } else {
          result[point] = true
        }
      }
    })
  }

  return result
}

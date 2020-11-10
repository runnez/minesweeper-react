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
    mined: {},
    opened: {},
    flagged: {},
    remainFlags: settings.mines,
    explodedKey: '',
    isStarted: false,
    isWon: false,
    isLost: false
  }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'FLAG': {
      if (state.remainFlags <= 0 && !state.flagged[action.payload]) return state

      const flagged = { ...state.flagged }

      if (state.flagged[action.payload]) {
        delete flagged[action.payload]
      } else {
        flagged[action.payload] = true
      }

      const mineKeys = Object.keys(state.mined)

      return {
        ...state,
        flagged,
        remainFlags: state.settings.mines - Object.keys(flagged).length,
        isWon: mineKeys.length > 0 && mineKeys.every(key => flagged[key])
      }
    }
    case 'REVEAL': {
      const cell = action.payload

      let mines = state.mined

      if (!state.isStarted) {
        let possibleMines = generateMines(state.settings.mines, state.settings.rows, state.settings.cols)

        while (possibleMines[cell] || calcAdjacentMinesCounter(possibleMines, cell) > 0) {
          possibleMines = generateMines(state.settings.mines, state.settings.rows, state.settings.cols)
        }

        mines = possibleMines
      }

      const isExploded = Boolean(mines[cell])

      const opened = isExploded ? state.opened : {
        ...state.opened,
        ...getOpenedArea(mines, cell, state.settings.rows, state.settings.cols, state.isStarted)
      }

      console.log(`%c${Object.keys(opened).length - Object.keys(state.opened).length}`, 'color: red', 'cells were opened')

      return {
        ...state,
        mined: mines,
        isStarted: true,
        explodedKey: isExploded ? cell : '',
        isLost: isExploded,
        opened
      }
    }
    default:
      return state
  }
}

export function calcAdjacentMinesCounter(mined, cell) {
  return getAdjacentCells(cell).reduce((acc, point) => acc + (mined[point] || 0), 0)
}

function getCell(rowIdx, colIdx) {
  return [rowIdx, colIdx].join('-')
}

function extractCellPos(cell) {
  if (!cell.split) console.log(cell)
  return cell.split('-').map(Number)
}

function generateMines(minesCount, rowsCount, colsCount) {
  const mines = {}

  while (minesCount > 0) {
    const cell = getCell(
      Math.floor(Math.random() * rowsCount),
      Math.floor(Math.random() * colsCount)
    )

    if (mines[cell]) {
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

function getOpenedArea(mined, cell, rowCount, colCount, shallow) {
  if (shallow) {
    if (calcAdjacentMinesCounter(mined, cell) > 0) {
      return { [cell]: true }
    }
  }

  const stack = [cell]
  const result = {}

  while (stack.length) {
    const cursor = stack.pop()
    result[cursor] = true

    getAdjacentCells(cursor, rowCount, colCount).forEach(point => {
      if (!mined[point] && !result[point]) {
        if (calcAdjacentMinesCounter(mined, point) === 0) {
          stack.push(point)
        } else {
          result[point] = true
        }
      }
    })
  }

  return result
}

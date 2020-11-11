import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #333;
  border-color: white #8B8B8B #8B8B8B white;
  font-size: 10px;
  line-height: 12px;
  text-align: center;

  ${props => props.opened && `
    background: #BDBDBD;
    border: 1px solid #ccc;
    border-style: inset;
  `}

  ${props => props.exploded && `
    background: #FF1D00;
    border-color: transparent;
  `}
`

const Counter = styled.div`
  font-weight: 700;
  color: ${props => ['#2301FF', '#017B00', '#FF1D00'][props.count - 1] || '#7B0800'}
`

const Cell = React.memo(function({
  id,
  opened,
  mined,
  exploded,
  flagged,
  revealed,
  count,
  debug,
  onReveal,
  onFlag
}) {
  if (debug) console.log('render Cell')

  return (
    <Wrapper
      opened={opened}
      exploded={exploded}
      revealed={revealed}
      onClick={() => !flagged && onReveal(id)}
      onContextMenu={(evt) => {
        evt.preventDefault()

        if (onFlag) {
          onFlag(id)
        }
      }}
    >
      <CellContent
        flagged={flagged}
        mined={revealed && mined}
        opened={opened}
        count={count}
      />
    </Wrapper>
  )
})

const CellContent = function({
  flagged,
  mined,
  opened,
  count
}) {
  if (flagged) return '🚩'
  if (mined) return '💣'
  if (opened && count > 0) return <Counter count={count}>{count}</Counter>
  return null
}

export default Cell

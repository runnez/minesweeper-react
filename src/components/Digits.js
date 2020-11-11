import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex
`

const Digit = styled.div`
  width: 13px;
  height: 23px;
  background-position: -${props => props.value * 13}px 0;
  background-image: url(/sprite.gif)
`

const Digits = React.memo(({ value }) => {
  const fillerLength = 3 - String(value).length
  const visibleValue = '0'.repeat(fillerLength >= 0 ? fillerLength : 0) + value

  return (
    <Wrapper>
      {String(visibleValue).split('').map((digit, i) =>
        <Digit key={i} value={digit} />
      )}
    </Wrapper>
  );
});

export default Digits;

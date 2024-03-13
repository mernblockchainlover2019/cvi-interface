import React from 'react'
import './ExpectedTokens.scss'

import Tooltip from 'components/Tooltip';
import { commaFormatted } from 'utils';

const ExpectedTokens = ({ description, amount, tokenName, tooltip, className }) => {
    return (
        <div className={`expected-tokens-component ${className ?? ''}`}>
          <span>
            {description}
            <Tooltip
              type="question"
              left={tooltip?.left ?? -30}
              mobileLeft={tooltip?.mobileLeft}
              maxWidth={400}
              minWidth={250}
              content={tooltip?.content}
            />
          </span>
          <div className={`expected-token-amount`}>
            {amount > 0 ? commaFormatted(amount) : "0"}{' '}{tokenName}
          </div>
        </div>
    )
}

export default ExpectedTokens;
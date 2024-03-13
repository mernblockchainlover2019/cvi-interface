import FulfillmentInTimer from 'components/pages/Arbitrage/FulfillmentInTimer';
import Stat from 'components/Stat';
import React from 'react';
import { commaFormatted, customFixed, toDisplayAmount } from 'utils';

const BurnV1 = ({
    activeToken,
    requestData,
    preFulfillData,
    errorMessage
}) => {
    return <>
        <Stat
          title="Amount"
          className="bold amount"
          value={`${requestData.amount} ${requestData.symbol}` || "-"}
        />
  
        <Stat
          title="Up front payment"
          className="large-value bold"
          value={requestData.upfrontPayment || "0"}
          _suffix={requestData.symbol}
        />

        <Stat
          title="Amount to fullfill"
          className="large-value bold"
          value={requestData.amountToFulfill || "0"}
          _suffix={requestData.symbol}
        />

        <div className="stat-component">
            <h2>Fullfillment in</h2>
            <FulfillmentInTimer fulfillmentIn={requestData.fulfillmentIn} />
        </div>

        {preFulfillData === 'N/A' && errorMessage && <p className="no-liquidity-msg">{errorMessage}</p>}

        <Stat
            title="Time to fullfillment and penalty fees"
            className="large-value bold"
            value={preFulfillData}
            format={preFulfillData === 'N/A' ? 'N/A' : `${commaFormatted(customFixed(preFulfillData?.penaltyFeePercentWithTimeDelay?.toString(), 4))}%`}
        />

        <Stat
            title="Burn fee"
            className="large-value bold"
            value={preFulfillData}
            format={preFulfillData === 'N/A' ? 'N/A' : `${commaFormatted(customFixed(preFulfillData?.closeFeePercent?.toString(), 4))}%`}
        />

        <Stat
            name="estimateBurn"
            className="large-value bold green"
            value={preFulfillData}
            format={preFulfillData === 'N/A' ? 'N/A' : `${customFixed(toDisplayAmount(preFulfillData?.receive?.toString(), activeToken.pairToken.decimals), 4) || "0"}`}
            _suffix={activeToken.pairToken.name.toUpperCase()}
        />
    </>
};

export default BurnV1;

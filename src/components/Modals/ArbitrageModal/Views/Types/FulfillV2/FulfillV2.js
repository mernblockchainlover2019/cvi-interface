import { useGetSubmitFees } from 'components/Hooks';
import ExpectedTokens from 'components/pages/Arbitrage/ExpectedTokens';
import SlippageTolerance from 'components/SlippageTolerance';
import Stat from 'components/Stat';
import React from 'react';
import { commaFormatted, toBN } from 'utils';
import { customFixedTokenValue } from 'utils';
import { upperCase, upperFirst } from 'lodash';
import './FulfillV2.scss';

const FulfillV2 = ({
    requestData,
    errorMessage,
    preFulfillData,
    slippageTolerance,
    setSlippageTolerance
}) => {
    const {
        tokenAmount,
        amount,
        type,
        delayFee,
        fromToken,
        toToken
    } = requestData;

    const submitFees = useGetSubmitFees(type, amount.replace(/,/g, ''), delayFee, fromToken);

    return <div className='mint-v2-component'>
        <Stat
            title="Submitted amount"
            className="bold amount"
            value={`${requestData.amount} ${requestData.symbol}` || "-"}
        />

        <Stat
            name={`net${upperFirst(type)}`}
            title={`Net ${type} amount`}
            className="large-value bold"
            value={commaFormatted(customFixedTokenValue(toBN(tokenAmount).sub(toBN(submitFees?._netFeeAmount)), fromToken.fixedDecimals, fromToken.decimals))}
            _suffix={requestData.symbol}
        />

        {preFulfillData === 'N/A' && errorMessage && <p className="no-liquidity-msg">{errorMessage}</p>}

        <SlippageTolerance
            slippageTolerance={slippageTolerance ?? "0.5"}
            setSlippageTolerance={setSlippageTolerance}
        />

        <ExpectedTokens
            description="Estimated number of tokens"
            amount={`${customFixedTokenValue(preFulfillData?.receive?.toString(), fromToken.fixedDecimals, toToken.decimals)}`}
            tokenName={upperCase(toToken.key)}
        />
    </div>
};

export default FulfillV2;

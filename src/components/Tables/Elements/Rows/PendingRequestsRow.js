import { useExpectedTokens, useGetSubmitFees, useInsufficientLiquidity, useIsMobile, useIsTablet, useNetworkVersion } from "components/Hooks";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import RowItem from './RowItem';
import Value from '../Values/Value';
import ActionController from "components/Actions/ActionController";
import arbitrageConfig from "config/arbitrageConfig";
import moment from "moment";
import FulfillmentInTimer from "components/pages/Arbitrage/FulfillmentInTimer";
import { upperCase } from "lodash";
import { commaFormatted, customFixedTokenValue, toBN } from "utils";

const PendingRequestsRow = ({ rowData, isHeader, className }) => {
    const { 
        tokenAmount,
        amount,
        symbol,
        submitTime,
        submitTimeToFulfillment,
        timeToFulfillmentFee,
        type,
        upfrontPayment,
        fulfillmentIn,
        lastBlockTime,
        amountToFulfill,
        delayFee,
        toToken,
        fromToken
    } = rowData;

    const { selectedNetwork } = useSelector(({app}) => app); 
    const [actionType, setActionType] = useState(arbitrageConfig.actionsConfig.fulfill.key);
    const isTablet = useIsTablet();
    const isMobile = useIsMobile();
    const appVersion = useNetworkVersion();
    const submitTimePlus = moment(submitTime * 1000).add(15, 'minutes'); // Submit Time + 15 minutes
    const isLocked = moment(moment.utc(submitTimePlus)).isSameOrAfter(moment.utc(lastBlockTime * 1000)); // Check if locked
    const submitFees = useGetSubmitFees(type, amount.replace(/,/g, ''), delayFee, fromToken);
    const expectedAmount = useExpectedTokens(type, amount.replace(/,/g, ''), submitFees?._netFeeAmount, fromToken);
    const isInsufficientLiquidity = useInsufficientLiquidity(fromToken, rowData);

    const fulfillmentController = useMemo(() => {
        const isDisabled = () => {
            if(actionType === arbitrageConfig.actionsConfig.processing.key) return true;
            return lastBlockTime ? isLocked : true;
        }

        return <ActionController
            action={type}
            isModal
            type={actionType}
            requestData={rowData}
            disabled={isDisabled()}
        />
    }, [type, actionType, rowData, lastBlockTime, isLocked]);

    const RowData = useMemo(() => (
        <>
            <RowItem
                 header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.submitTime}
                content={<Value text={moment(submitTime * 1000).format("DD/MM/YY HH:mm")}/> }
            />

            {appVersion === "v1" && <RowItem
                header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.amount}
                content={<Value text={amount} subText={symbol}/>}
            />}
            
            {(!isTablet && !isMobile) && <RowItem
                header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.type}
                content={<Value className="uppercase-first-letter" text={type} />}
            />}

            {appVersion === "v2" && <> 
                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.amount}
                    content={<Value text={amount} subText={symbol}/>}
                />

                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.netAmount}
                    content={<Value text={commaFormatted(customFixedTokenValue(toBN(tokenAmount).sub(toBN(submitFees?._netFeeAmount)), fromToken.fixedDecimals, fromToken.decimals))} subText={upperCase(fromToken.key)}/>}
                />

                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.expectedTokens}
                    content={(
                        <div className="claim-component">
                            <div className={`claim-component__container expected`}>
                                <Value text={`${commaFormatted(customFixedTokenValue(expectedAmount, toToken.fixedDecimals, toToken.decimals))} ${upperCase(toToken.key)}`}/>
                            </div>
                        </div>
                    )}
                />

                {!isMobile && <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.receiveIn}
                    content={<FulfillmentInTimer 
                        fulfillmentIn={fulfillmentIn} 
                        setActionType={setActionType}
                        isInsufficientLiquidity={isInsufficientLiquidity}
                    />}
                />}
                        
            </>}
            
            {appVersion === "v1" && <> 
                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.submitTimeToFulfillment}
                    content={<Value className="small-subtext" text={submitTimeToFulfillment.text} subText={submitTimeToFulfillment.subText}/>}
                />
                
                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.timeToFulfillmentFee}
                    content={<Value text={timeToFulfillmentFee} />}
                />

                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.upfrontPayment}
                    content={<Value text={`${upfrontPayment} ${symbol}`} />}
                />

                <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.amountToFulfill}
                    content={<Value text={`${amountToFulfill} ${symbol}`} />}
                />

                {!isMobile && <RowItem
                    header={arbitrageConfig.tables[selectedNetwork][type].pending.headers.fulfillmentIn}
                    content={<FulfillmentInTimer 
                        fulfillmentIn={fulfillmentIn} 
                        setActionType={setActionType}
                        
                    />}
                />}
            </>}


            {(!isTablet || isMobile) && <RowItem 
                content={
                    <div className={`row-actions-wrapper${!isMobile && isTablet ? ' isTablet' : ''}`}>
                        {fulfillmentController}
                    </div>
                }
            />}

        </>
    ), [isTablet, isMobile, selectedNetwork, type, appVersion, amount, symbol, submitTime, tokenAmount, submitFees?._netFeeAmount, fromToken.fixedDecimals, fromToken.decimals, fromToken.key, expectedAmount, toToken.fixedDecimals, toToken.decimals, toToken.key, fulfillmentIn, isInsufficientLiquidity, submitTimeToFulfillment.text, submitTimeToFulfillment.subText, timeToFulfillmentFee, upfrontPayment, amountToFulfill, fulfillmentController]);

    if (isHeader) {
        return (
            <> 
                <RowItem
                    type={type}
                    content={
                        <>
                            <Value className="uppercase-first-letter" text={type} />
                            {isMobile && <FulfillmentInTimer 
                                fulfillmentIn={fulfillmentIn} 
                                setActionType={setActionType} 
                                isInsufficientLiquidity={isInsufficientLiquidity}
                            />}
                        </>
                    }
                />
                {!isMobile && <RowItem 
                    content={
                        <div className={`row-actions-wrapper${!isMobile && isTablet ? ' isTablet' : ''}`}>
                            {fulfillmentController}
                        </div>
                    }
                />}
            </>
        )
    }

    return isTablet ? RowData : <tr className={className ?? ''}>
        {RowData}
    </tr>
}

export default PendingRequestsRow;

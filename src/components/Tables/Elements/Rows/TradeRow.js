import { useIsMobile, useIsTablet } from "components/Hooks";
import { useMemo, useState } from "react";
import { Coin, Pnl, Value } from "../Values";
import RowItem from './RowItem';
import platformConfig, { activeViews } from "config/platformConfig";
import ActionController from "components/Actions/ActionController";
import PlatformClaim from "components/Actions/PlatformClaim";
import { useWeb3Api } from "contracts/useWeb3Api";
import { useActiveWeb3React } from "components/Hooks/wallet";
import { customFixedTokenValue } from "utils";

const TradeRow = ({token, isHeader, className}) => {
    const { account } = useActiveWeb3React();
    const isTablet = useIsTablet();
    const isMobile = useIsMobile();
    const [amount, setAmount] = useState("");
    const positionValue = token.data.positionValue;
    const pos = token.data.pos;
    const positionPnlPayload = useMemo(() => ({account}), [account]);
    const [positionPnlData] = useWeb3Api("getPositionsPNL", token.key, positionPnlPayload, {errorValue: "0", updateOn: "positions"});
    const header = useMemo(() => platformConfig.headers[activeViews.trade][platformConfig.tabs.trade.positions], []);
    const leverage = pos?.leverage ? `x${pos.leverage}` :  "N/A";
    const [slippageTolerance, setSlippageTolerance] = useState("0.5");

    const sellController = useMemo(() => {
        return <ActionController 
            amountLabel="Select amount to sell"
            isModal 
            token={token.key}
            amount={amount}
            setAmount={setAmount}
            type={platformConfig.actionsConfig.sell.key}
            leverage={pos?.leverage ?? "1"}
            slippageTolerance={slippageTolerance}
            setSlippageTolerance={setSlippageTolerance}
            balances={{
                posUnitsAmount: pos?.positionUnitsAmount ?? "0",
                tokenAmount: positionValue
            }}
        />
    }, [token, amount, pos, positionValue, slippageTolerance]);

    const RowData = useMemo(() => (
        <> 
            <RowItem 
                header={header.index.label}
                content={<Value text={token.oracleId.toUpperCase()} />} 
            />
            
            {!isTablet && <> 
                <RowItem content={<Value 
                    coin={token.key}
                    text={positionValue} 
                    subText={`${token.name.toUpperCase()}`} 
                    format={customFixedTokenValue(positionValue?.toString(), token.fixedDecimals, token.decimals)}
                /> } />
            </>}
            
            <RowItem 
                header={header.Leverage.label} 
                content={<Value text={leverage === "N/A" ? 'x1' : leverage} />} 
            />

            <RowItem 
                header={header["P&L"].label}
                tooltip={header["P&L"].tooltip}
                content={<Pnl 
                    value={positionPnlData} 
                    token={`${token.name.toUpperCase()}`} 
                    format={customFixedTokenValue(!Number(positionPnlData?.amount) ? "0" :  positionPnlData?.amount, token.fixedDecimals, token.decimals)}
                    /> } 
            />

            <RowItem 
                header={header["Rewards (claimable today)"].label} 
                tooltip={header["Rewards (claimable today)"].tooltip}
                content={<PlatformClaim token={token} />} 
            />
        
            {(!isTablet || isMobile) && <RowItem content={sellController} /> }
        </>
    ), [isTablet, token, positionValue, header, positionPnlData, isMobile, sellController, leverage]);

    if(isHeader) {
        return <>
            <RowItem content={<Coin token={token.key} />} />
            <RowItem content={<Value 
                text={positionValue} 
                subText={`${token.name.toUpperCase()}`} 
                format={customFixedTokenValue(positionValue?.toString(), token.fixedDecimals, token.decimals)}
            />}/>

             {!isMobile && <RowItem type="action" content={sellController} /> }
        </>
    }


    return isTablet ? RowData : <tr className={className ?? ''}>
        {RowData}
    </tr>
}

export default TradeRow;
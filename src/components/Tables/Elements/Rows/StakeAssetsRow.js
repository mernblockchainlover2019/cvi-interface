import { useIsMobile, useIsTablet } from "components/Hooks";
import { useMemo, useState } from "react";
import RowItem from './RowItem';
import Coin from '../Values/Coin';
import Value from '../Values/Value';
import ActionController from "components/Actions/ActionController";
import stakingConfig, { stakingProtocols, stakingViews } from "config/stakingConfig";
import { Pairs } from "../Values";
import Apy from "../Values/Apy";
import { useActiveWeb3React } from '../../../Hooks/wallet';
import useStakedData from "components/Hooks/Staking";
import { useSelector } from "react-redux";
import { toBN } from "utils";

const StakeAssetsRow = ({rowData, isHeader}) => {
    const isTablet = useIsTablet();
    
    const RowDataComponent = () => <RowData 
        isHeader={isHeader} 
        rowData={rowData}
    />

    return useMemo(()=> {
        return isTablet ? <RowDataComponent /> : <tr><RowDataComponent /></tr>
    //eslint-disable-next-line
    },[]);
}

export default StakeAssetsRow;


const RowData = ({isHeader, rowData}) => {
    const { label, key: token, protocol, poolLink, type, buyBond} = rowData;
    const isTablet = useIsTablet();
    const isMobile = useIsMobile();
    const chainName = useSelector(({app}) => app.selectedNetwork);
    const header = useMemo(() => stakingConfig.headers[stakingViews["available-to-stake"]], []);
    const [leftToken, rightToken] = token?.split('-');
    const tokenNameFormatted = leftToken && rightToken ? token.replace(/-([^-]*)$/, ' $1') : token;
    const [stakedData] = useStakedData(chainName, protocol, token);
    const { account } = useActiveWeb3React();
    const [amount, setAmount] = useState("");

    return useMemo(() => {
        const tokenBalance = stakedData.balance.tokenBalance ?? 0
        const StakeController = 
        <ActionController 
            amountLabel="Select amount to stake"
            isModal 
            token={token}
            amount={amount}
            setAmount={setAmount}
            type={stakingConfig.actionsConfig.stake.key}
            view={"staking"}
            protocol={protocol}
            disabled={!toBN(tokenBalance).gt(toBN(0))}
            balances={{
                tokenAmount: stakedData.balance.tokenBalance,
                available: stakedData.balance.tokenBalance
            }}
        />

        if(isHeader) {
            return <>
                <RowItem content={
                    stakingProtocols[protocol] === stakingProtocols.platform ? 
                    <Coin token={token} showName protocol={protocol} version={type === 'cvi-sdk' ? 'v2' : ''} /> : 
                    <Pairs leftToken={leftToken} rightToken={rightToken} token={token} protocol={protocol} poolLink={poolLink} />} 
                />
                {!isMobile && <RowItem type="action" content={StakeController} /> }
            </>
        }

        return (
        <> 
            {!isTablet && <> 
                <RowItem content={
                    stakingProtocols[protocol] === stakingProtocols.platform ? 
                    <Coin token={token} showName protocol={protocol} version={type === 'cvi-sdk' ? 'v2' : ''} /> : 
                    <Pairs leftToken={leftToken} rightToken={rightToken} label={label} token={token} protocol={protocol} poolLink={poolLink} />} 
                />
            </>}

            <RowItem 
                header={header["Your wallet balance"].label}
                content={<Value 
                    text={stakedData.balance.formatted} 
                    subText={label ?? `${tokenNameFormatted?.toUpperCase()}`} 
                    bottomText={`${stakedData.balance.usdBalance}`} 
                    showData={account}
                /> 
            } />

            <RowItem 
                header={header.TVL.label} 
                content={<Value 
                    text={stakedData.tvl.stakedAmountUSD} 
                    bottomText={`${stakedData.tvl.stakedAmountLP} 
                    ${label ?? tokenNameFormatted?.toUpperCase()}`} 
                /> } 
            />

            <RowItem 
                header={header.APY.label} 
                content={<Apy apyList={stakedData.apy} buyBond={buyBond} />} 
            />

            {(!isTablet || isMobile) && <RowItem content={StakeController} />}
        </>
        //eslint-disable-next-line
    )}, [stakedData, isTablet, isMobile, account, amount, poolLink]);
}
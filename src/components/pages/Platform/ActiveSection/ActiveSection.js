import { appViewContext } from 'components/Context';
import React, { useContext, useEffect, useMemo, useState, useCallback} from 'react'
import CurrencySelect from 'components/CurrencySelect';
import SelectLeverage from 'components/SelectLeverage';
import platformConfig, { activeViews } from 'config/platformConfig';
import ActionController from 'components/Actions/ActionController';
import { useSelector } from 'react-redux';
import { contractsContext } from 'contracts/ContractContext';
import { useInDOM, useIsTablet } from 'components/Hooks';
import { useWeb3Api } from 'contracts/useWeb3Api';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import Graphs from '../Graphs';
import './ActiveSection.scss';
import Details from 'components/Details/Details';
import config from 'config/config';

const ActiveSection = ({activeTab}) => {
    const isTablet = useIsTablet();
    const { account } = useActiveWeb3React();
    const { activeView } = useContext(appViewContext);
    const { selectedNetwork } = useSelector(({app}) => app);
    const [selectedCurrency, setSelectedCurrency] = useState(platformConfig.tokens[selectedNetwork]?.['usdc-cvol'].key);
    const tokenLeverageList = platformConfig.tokens?.[selectedNetwork]?.[selectedCurrency]?.leverage;
    const [leverage, setLeverage] = useState(tokenLeverageList?.[0]);
    const [amount, setAmount] = useState("");
    const type = activeView === "trade" ? platformConfig.actionsConfig.buy.key : platformConfig.actionsConfig.deposit.key;
    const availableBalancePayload = useMemo(() => ({account, type}), [account, type]);
    const availableBalanceOptions = useMemo(() => ({updateOn: activeView === "trade" ? 'positions' : 'liquidities', errorValue: "0"}), [activeView]);
    const [availableBalance, getAvailableBalance] = useWeb3Api("getAvailableBalance", selectedCurrency, availableBalancePayload, availableBalanceOptions);
    const isMigrated = selectedCurrency && platformConfig.tokens?.[selectedNetwork]?.[selectedCurrency]?.migrated
    const [slippageTolerance, setSlippageTolerance] = useState("0.5");

    const updateAvailableBalance = () => {
      getAvailableBalance();
    }

    useEffect(() => {
        if(!platformConfig.tokens[selectedCurrency]?.leverage) setLeverage("1");
        
        if(tokenLeverageList?.length > 0) {
            setLeverage(tokenLeverageList?.[0]);
        }
        //eslint-disable-next-line
    }, [selectedCurrency]);
    
    return useMemo(() => {
        return (
            <div className="platform-form-component">
               <div className="platform-form-component__left">
                    <CurrencySelect 
                        selectedCurrency={selectedCurrency} 
                        setSelectedCurrency={setSelectedCurrency} 
                        activeVolIndex={activeTab}
                    />

                    {activeView === 'trade' 
                        && platformConfig.tokens?.[selectedNetwork]?.[selectedCurrency]?.leverage 
                        && <SelectLeverage selectedCurrency={selectedCurrency} leverage={leverage} tokenLeverageList={tokenLeverageList} setLeverage={setLeverage} /> }
                  
                    {!isMigrated && <ActionController 
                            amount={amount}
                            setAmount={setAmount}
                            setSlippageTolerance={setSlippageTolerance}
                            slippageTolerance={slippageTolerance}
                            token={selectedCurrency}
                            leverage={leverage}
                            type={type}
                            balances={{ tokenAmount: availableBalance }}
                            disabled={!amount}
                            cb={updateAvailableBalance}
                        />
                    }

                    {!isTablet && <SeeMore isMigrated={isMigrated} selectedCurrency={selectedCurrency?.toUpperCase()}/>}
               </div>
    
               <div className="platform-form-component__middle">
                    <Details 
                        activeVolIndex={activeTab}
                        selectedCurrency={selectedCurrency?.toLowerCase()} 
                        amount={amount} 
                        leverage={leverage} 
                        slippageTolerance={slippageTolerance}
                        path={config.routes.platform.path}
                    />
               </div>

               <div className="platform-form-component__right">
                    <Graphs 
                        activeVolIndex={activeTab}
                        tabs={["index", "fee"]} 
                    />  
                </div>

                {isTablet && <SeeMore isMigrated={isMigrated} selectedCurrency={selectedCurrency?.toUpperCase()}/>}
            </div>
        )
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrency, activeTab, activeView, selectedNetwork, leverage, tokenLeverageList, amount, type, availableBalance, isTablet, slippageTolerance]) 
}

const SeeMore = ({selectedCurrency, isMigrated}) => {
    const { activeView } = useContext(appViewContext);
    const { selectedNetwork } = useSelector(({app}) => app);
    const contracts = useContext(contractsContext);
    const [lockup, setLockup] = useState(48);
    const platfromName = platformConfig.tokens[selectedNetwork][selectedCurrency.toLowerCase()]?.rel.platform;
    const isActiveInDom = useInDOM();
    
    useEffect(()=>{
        if(!contracts || !selectedNetwork || !selectedCurrency) return
        const getLockup = async (cb) => {
            try{
                const locktime = await contracts[platfromName].methods.lpsLockupPeriod().call();
                if(isActiveInDom()) {
                    setLockup(locktime / 60 / 60)
                }
            } catch (error) {
                console.log("getLockuptime error: ", error);
            }
        }

        let canceled = false;

        getLockup((cb)=>{
            if(canceled) return
            cb()
        });

        return () => {
            canceled = true;
        }
    //eslint-disable-next-line
    },[selectedCurrency, selectedNetwork, contracts]);


    
const migrationMsg = useCallback(() => {
        switch(activeView) {
            case "trade":
                return  platformConfig.migrationMsgs?.trade?.map((msg, msgNum) => <p key={msgNum}>{msg}</p>);
            case "view-liquidity":
                return  platformConfig.migrationMsgs?.liquidity?.map((msg, msgNum) => <p key={msgNum}>{msg}</p>);
            default:
                return null;
        }
    }, [activeView]);

    return useMemo(() => {
        return <div className="platform-form-component__bottom">
            {isMigrated ? 
                <div className="migration-message">
                  <p className="pay-attention">Please note:&nbsp;</p>
                  {migrationMsg()}
                </div>
                : activeView === activeViews.trade ? <p>
                    <b>Pay Attention: </b> 
                    GOVI tokens will become claimable starting the day after your last open position action (UTC time) and for a period not exceeding 30 days.
                    <br/>Please also note that you won't be able to sell your position within the next 6 hours. 
                </p> 
                : <p>
                    <b>Pay Attention: </b>you won't be able to withdraw your liquidity within the next {lockup} hours.
                </p>
            }
        </div>
    }, [activeView, isMigrated, lockup, migrationMsg]);
}

export default ActiveSection;
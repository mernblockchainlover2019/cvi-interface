import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Modal from 'components/Modal';
import InputAmount from 'components/InputAmount';
import Slippage from 'components/Slippage';
import { appViewContext } from 'components/Context';
import Action from './Action';
import platformConfig from 'config/platformConfig';
import arbitrageConfig from 'config/arbitrageConfig';
import TimeToFullfill from 'components/pages/Arbitrage/TimeToFullfill';
import ReceiveIn from 'components/pages/Arbitrage/ReceiveIn';
import { activeTabs as arbitrageActiveTabs } from 'config/arbitrageConfig';
import FulfillMint from 'components/Modals/ArbitrageModal/Views/FulfillMint';
import FulfillBurn from 'components/Modals/ArbitrageModal/Views/FulfillBurn';
import SlippageTolerance from 'components/SlippageTolerance';
import { useSelector } from 'react-redux';
import { chainNames } from 'connectors';
import ExpectedTokens from 'components/pages/Arbitrage/ExpectedTokens';
import Expand from 'components/Expand';
import { upperCase } from 'lodash';
import { useActiveToken, useExpectedTokens, useNetworkVersion } from 'components/Hooks';
import config from 'config/config';
import { customFixedTokenValue } from 'utils';

const actionControllerContext = createContext({});
export const ActionControllerContext = (props = {}) => {
  return (
    <actionControllerContext.Provider value={props}>
      <Action />
    </actionControllerContext.Provider>
  )
}

export const useActionController = () => {
  const context = useContext(actionControllerContext);
  return context;
}

const ActionController = ({action, requestData, type, disabled, amountLabel = "Amount", token, leverage, delayFee, setDelayFee, amount, setAmount, slippageTolerance, setSlippageTolerance, isModal, view="platform", protocol, balances, cb}) => {
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const { selectedNetwork } = useSelector(({app}) => app);
  const [isOpen, setIsOpen] = useState();
  const [netAmount, setNetAmount] = useState();
  const { activeView } = useContext(appViewContext);
  const appVersion = useNetworkVersion();
  const _activeToken = useActiveToken(token);

  const getActiveToken = useCallback( () => {
    if(arbitrageActiveTabs?.[activeView]) return activeView === arbitrageActiveTabs.mint ? _activeToken : _activeToken.pairToken;
    return _activeToken;
  }, [_activeToken, activeView]);

  const activeToken = getActiveToken();
  
  const expectedAmount = useExpectedTokens(activeView, amount, netAmount);

  const getButtonType = useCallback(() => {
    if(appVersion === "v1") return type === arbitrageConfig.actionsConfig.fulfill.key ? type : arbitrageConfig.actionsConfig.liquidate.key;
    if(type === arbitrageConfig.actionsConfig.fulfill.key) return requestData.fulfillmentIn > 0 ? arbitrageConfig.actionsConfig.receive_now.key : type;
    return type;
  }, [appVersion, requestData?.fulfillmentIn, type])

  const renderActionComponent = useCallback((isModal = false) => {
    return <ActionControllerContext
        action={action}
        disabled={!(!disabled && !insufficientBalance)}
        type={type} 
        token={token} 
        protocol={protocol}
        leverage={leverage} 
        amount={amount} 
        setAmount={setAmount} 
        delayFee={delayFee}
        isOpen={isOpen} 
        isModal={isModal} 
        balances={balances} 
        setIsOpen={setIsOpen}
        slippageTolerance={slippageTolerance}
        requestData={requestData}
        buttonType={getButtonType()}
        cb={cb}
      />
  }, [action, disabled, insufficientBalance, type, token, protocol, leverage, amount, setAmount, delayFee, isOpen, balances, slippageTolerance, requestData, getButtonType, cb])

  useEffect(() => {
    if(action) return;
    if(!isOpen && amount !== "") {
      setAmount("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeView]);

  const getInnerModal = useCallback(() => {
    const buttonType = getButtonType();

    switch (action) { // @TODO: refactor it to be use in "PendingRequest component"
      case arbitrageActiveTabs.mint: return <FulfillMint 
        closeBtn={() => setIsOpen(false)} 
        requestData={requestData} 
        buttonType={buttonType}
      />

      case arbitrageActiveTabs.burn: return <FulfillBurn 
        closeBtn={() => setIsOpen(false)} 
        requestData={requestData} 
        buttonType={buttonType}
      />
    
      default: return (
        <InputAmount 
          label={amountLabel}
          symbol={token} 
          amount={amount} 
          setAmount={setAmount} 
          setInsufficientBalance={setInsufficientBalance}
          availableBalance={balances?.tokenAmount}
          view={view}
          protocol={protocol} 
          type={type}
        />
      )
    }
  }, [action, amount, amountLabel, balances?.tokenAmount, getButtonType, protocol, requestData, setAmount, token, type, view])

  return useMemo(() => <div className="action-controller_component">
    {(isModal && isOpen) && <Modal className={action ? "arbitrage-modal" : ""} clickOutsideDisabled closeIcon handleCloseModal={() => setIsOpen(false)}>
      {getInnerModal()}
      {(type === platformConfig.actionsConfig.sell.key) ? <AdvancedOptions
        slippageTolerance={slippageTolerance}
        setSlippageTolerance={setSlippageTolerance} /> : <br />}

      {!action && renderActionComponent()}
    </Modal>}

    {!isModal && <>
      <InputAmount
        label={amountLabel}
        symbol={token}
        amount={amount}
        setAmount={setAmount}
        setInsufficientBalance={setInsufficientBalance}
        availableBalance={balances?.tokenAmount}
        protocol={protocol}
        view={view}
        type={type} 
      />

      {arbitrageConfig.actionsConfig[type] && (selectedNetwork === chainNames.Matic ? <> 
        <ReceiveIn 
          amount={amount} 
          token={token} 
          netAmount={netAmount} 
          type={arbitrageConfig.actionsConfig[type].key} 
          setNetAmount={setNetAmount} 
          delayFee={delayFee} 
          slippageTolerance={slippageTolerance}
          setDelayFee={setDelayFee}
          tooltip={type === arbitrageConfig.actionsConfig.mint.key ? config.statisticsDetails.receiveInMint.tooltip : (type === arbitrageConfig.actionsConfig.burn.key && config.statisticsDetails.receiveInBurn.tooltip)} 
        /> 
        {type === arbitrageConfig.actionsConfig.mint.key && <SlippageTolerance 
          slippageTolerance={slippageTolerance ?? "0.5"} 
          setSlippageTolerance={setSlippageTolerance} 
        />}
        <ExpectedTokens description="Estimated number of tokens" amount={customFixedTokenValue(expectedAmount, activeToken?.fixedDecimals, activeToken?.decimals)} tokenName={upperCase(activeToken?.name)} tooltip={config.statisticsDetails.expectedTokens.tooltip}/>
      </>
      : 
        <TimeToFullfill delayFee={delayFee} setDelayFee={setDelayFee} />
      )}

      {activeToken?.name === 'usdc' && <AdvancedOptions
        slippageTolerance={slippageTolerance}
        setSlippageTolerance={setSlippageTolerance} />}
    </>}
    {renderActionComponent(isModal)}
  </div>, [isModal, isOpen, action, getInnerModal, type, slippageTolerance, setSlippageTolerance, renderActionComponent, amountLabel, token, amount, setAmount, balances?.tokenAmount, protocol, view, selectedNetwork, netAmount, delayFee, setDelayFee, expectedAmount, activeToken?.fixedDecimals, activeToken?.decimals, activeToken?.name])
};

const AdvancedOptions = ({slippageTolerance, setSlippageTolerance}) => {
  const { activeView } = useContext(appViewContext);
  if(activeView !== "trade") return null;
  return <Expand header="Advanced" classNames="advanced-expand" expandedView={<Slippage slippageTolerance={slippageTolerance} setSlippageTolerance={setSlippageTolerance} />} />
}

export default ActionController;
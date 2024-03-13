import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Title from "components/Elements/Title";
import Button from "components/Elements/Button";
import { appViewContext } from 'components/Context';
import { useActiveToken, useNetworkVersion } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import config from 'config/config';
import MintV1 from 'components/Modals/ArbitrageModal/Views/Types/MintV1';
import arbitrageConfig from 'config/arbitrageConfig';
import ReceiveIn from 'components/Modals/ArbitrageModal/Views/Types/ReceiveIn';
import FulfillV2 from 'components/Modals/ArbitrageModal/Views/Types/FulfillV2';

const FulfillMint = ({ closeBtn, requestData, buttonType }) => { // @TODO: refactor mint & burn into one view 
  const dispatch = useDispatch();
  const { unfulfilledRequests } = useSelector(({wallet})=>wallet);
  const { w3 } = useContext(appViewContext);
  const {account} = useActiveWeb3React();
  const activeToken = useActiveToken();
  const [collateralMint, setCollateralMint] = useState(false);
  const [preFulfillData, setPreFulfillData] = useState(null);
  const [isProcessing, setIsProcessing] = useState();
  const originalRequest = unfulfilledRequests.find(r => r.requestId === requestData.requestId);
  const [errorMessage, setErrorMessage] = useState();
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const appVersion = useNetworkVersion();
  const isReceiveNow = buttonType === arbitrageConfig.actionsConfig.receive_now.key;

  const onClick = useCallback(async() => {
    try {
      setIsProcessing(true);
      const mintAction = collateralMint ? "fulfillCollateralizedMint" : "fulfillMint";
      await w3?.tokens[activeToken.rel.volTokenKey][mintAction](originalRequest, {account, slippage: Number(slippageTolerance)});
      dispatch(addAlert({
        id: 'mint',
        eventName: "Mint - success",
        alertType: config.alerts.types.CONFIRMED,
        message: "Transaction success!"
      }));
    } catch (error){
      console.log("fulfill mint error: ", error);
      dispatch(addAlert({
        id: 'mint',
        eventName: "Mint - failed",
        alertType: config.alerts.types.FAILED,
        message: "Transaction failed!"
      }));
    } finally {
      closeBtn();
      setIsProcessing(false);
    }
  }, [account, activeToken.rel.volTokenKey, closeBtn, collateralMint, dispatch, originalRequest, slippageTolerance, w3?.tokens]);

  useEffect(()=>{
    if(!originalRequest) return;
    setPreFulfillData(null);

    const preFulfill = async () => {
      try {
        const preFulfillAction = collateralMint ? "preFulfillCollateralizedMint" : "preFulfillMint";
        let preFulfillRes = await w3?.tokens[activeToken.rel.volTokenKey][preFulfillAction](originalRequest, { account });
        preFulfillRes.penaltyFeePercentWithTimeDelay = preFulfillRes.penaltyFeePercent + Number(requestData.timeToFulfillmentFee.replace('%', ''));
        setPreFulfillData(preFulfillRes);
      } catch (error) {
        console.log(error);
        if(error.message.toLowerCase().includes('not enough liquidity')) 
          setErrorMessage("There is not enough available liquidity to cover your position. Please use a collateral mint option or try again later.")
        else 
          setErrorMessage("Something went wrong, please try again later.");
        
        setPreFulfillData("N/A");
      }
    }

    if(w3?.tokens[activeToken.rel.volTokenKey] && originalRequest) preFulfill();
  },[w3, requestData, activeToken, originalRequest, closeBtn, collateralMint, account]);

  return useMemo(() => (
    <>
      <Title
        className={`arbitrage-title ${buttonType}`}
        color="white"
        text={isReceiveNow ? "Don't want to wait? You can receive your USDC tokens now" : `Mint ${activeToken.name.toUpperCase()} tokens`}
      /> 

      {appVersion === "v1" ? 
        <MintV1 
            activeToken={activeToken}
            requestData={requestData}
            preFulfillData={preFulfillData}
            collateralMint={collateralMint}
            setCollateralMint={setCollateralMint}
            errorMessage={errorMessage}
        /> 
      : 
        isReceiveNow ? <ReceiveIn 
          requestData={requestData}
          preFulfillData={preFulfillData}
          slippageTolerance={slippageTolerance}
          setSlippageTolerance={setSlippageTolerance}
          errorMessage={errorMessage}
        />
      : 
        <FulfillV2 
            requestData={requestData}
            preFulfillData={preFulfillData}
            slippageTolerance={slippageTolerance}
            setSlippageTolerance={setSlippageTolerance}
            errorMessage={errorMessage}
        />
      }

      <div className='button-group'>
        <Button
          className={`button arbitrage-button ${buttonType}`} 
          buttonText={isReceiveNow ? "RECEIVE NOW" : "Fulfill"}
          disabled={isProcessing || !originalRequest || !preFulfillData || preFulfillData === "N/A"}
          processing={isProcessing}
          onClick={onClick} 
        />

        <Button
          className={`button secondary arbitrage-button`}
          buttonText="Cancel"
          onClick={closeBtn} 
        />
      </div>
    </>
  ),[isReceiveNow, buttonType, activeToken, appVersion, requestData, preFulfillData, collateralMint, errorMessage, slippageTolerance, isProcessing, originalRequest, onClick, closeBtn])
}

export default FulfillMint
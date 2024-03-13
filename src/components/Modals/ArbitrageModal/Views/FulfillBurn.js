import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Title from "components/Elements/Title";
import Button from "components/Elements/Button";
import { appViewContext } from 'components/Context';
import { useActiveToken, useNetworkVersion } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import config from 'config/config';
import BurnV1 from 'components/Modals/ArbitrageModal/Views/Types/BurnV1';
import ReceiveIn from 'components/Modals/ArbitrageModal/Views/Types/ReceiveIn';
import arbitrageConfig from 'config/arbitrageConfig';
import FulfillV2 from 'components/Modals/ArbitrageModal/Views/Types/FulfillV2';

const Burn = ({ closeBtn, requestData, buttonType }) => {
  const dispatch = useDispatch();
  const { unfulfilledRequests } = useSelector(({wallet})=>wallet);
  const { w3 } = useContext(appViewContext);
  const {account} = useActiveWeb3React();
  const activeToken = useActiveToken();
  const [preFulfillData, setPreFulfillData] = useState(null);
  const [isProcessing, setIsProcessing] = useState();
  const originalRequest = unfulfilledRequests.find(r => r.requestId === requestData.requestId);
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const appVersion = useNetworkVersion();
  const isReceiveNow = buttonType === arbitrageConfig.actionsConfig.receive_now.key;
  const [errorMessage, setErrorMessage] = useState();

  const onClick = useCallback(async() => {
    try {
      setIsProcessing(true);
      await w3?.tokens[activeToken.rel.volTokenKey].fulfillBurn(originalRequest, {account});
      dispatch(addAlert({
        id: 'burn',
        eventName: "Burn - success",
        alertType: config.alerts.types.CONFIRMED,
        message: "Transaction success!"
      }));
    } catch (error){
      console.log("fulfill burn error: ", error);
      dispatch(addAlert({
        id: 'burn',
        eventName: "Burn - failed",
        alertType: config.alerts.types.FAILED,
        message: "Transaction failed!"
      }));
    } finally {
      closeBtn();
      setIsProcessing(false);
    }
  }, [account, activeToken.rel.volTokenKey, closeBtn, dispatch, originalRequest, w3?.tokens]);

  useEffect(()=>{
    if(!originalRequest || !account) return;

    const preFulfill = async () => {
      try {
        const preFulfillRes = await w3?.tokens[activeToken.rel.volTokenKey].preFulfillBurn(originalRequest, { account });
        preFulfillRes.penaltyFeePercentWithTimeDelay = preFulfillRes.penaltyFeePercent + Number(requestData.timeToFulfillmentFee.replace('%', ''));
        setPreFulfillData(preFulfillRes);
      } catch (error) {
        console.log(error);
        setErrorMessage("Something went wrong, please try again later.");
        setPreFulfillData("N/A");
      }
    }

    if(w3?.tokens[activeToken.rel.volTokenKey] && originalRequest) preFulfill();
  },[w3, requestData, activeToken, originalRequest, closeBtn, account]);

  return useMemo(() => {
    return (
      <>
        <Title
          className={`arbitrage-title ${buttonType}`}
          color="white"
          text={isReceiveNow ? "Don't want to wait? You can receive your USDC tokens now" : `Burn ${activeToken.name.toUpperCase()} tokens`}
        />
  
        {appVersion === "v1" ?
          <BurnV1 
            activeToken={activeToken}
            requestData={requestData}
            preFulfillData={preFulfillData}
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
            className="button arbitrage-button"
            buttonText={isReceiveNow ? "RECEIVE NOW" : "Fulfill"}
            disabled={isProcessing || !originalRequest || !preFulfillData || preFulfillData === "N/A"}
            processing={isProcessing}
            onClick={onClick}
          />

          <Button
            className="button secondary arbitrage-button"
            buttonText="Cancel"
            onClick={closeBtn}
          />
        </div>
      </>
    )
  }, [buttonType, isReceiveNow, activeToken, appVersion, requestData, preFulfillData, errorMessage, slippageTolerance, isProcessing, originalRequest, onClick, closeBtn])

}

export default Burn
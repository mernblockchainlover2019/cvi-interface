import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { appViewContext } from "components/Context";
import { debounce, isNumber, upperFirst } from "lodash";
import Dropdown from "components/Dropdown/Dropdown";
import "./ReceiveIn.scss";
import Spinner from "components/Spinner/Spinner";
import { commaFormatted, customFixedTokenValue, toBN, toBNAmount, customFixed } from "utils";
import { upperCase } from "lodash";
import { useSelector } from "react-redux";
import arbitrageConfig from "config/arbitrageConfig";
import Tooltip from "components/Tooltip";
import Stat from "components/Stat";
import { useIsLaptop } from 'components/Hooks';
import { getSubmitFees } from "contracts/utils";

const ReceiveIn = ({ amount, token, netAmount, tooltip, type, setNetAmount, delayFee, setDelayFee }) => {
  const { selectedNetwork } = useSelector(({app}) => app);
  const optionsType = arbitrageConfig.timeToFulfillment[selectedNetwork].type;
  const { w3, activeToken } = useContext(appViewContext);
  const [hoursDropdownValue, setHoursDropdownValue] = useState("");
  const [minutesDropdownValue, setMinutesDropdownValue] = useState("");
  const [maxHours, setMaxHours] = useState();
  const [maxMinutes, setMaxMinutes] = useState();
  const [submitFeeAmount, setSubmitFeeAmount] = useState();
  const [timeDelayFeeAmount, setTimeDelayFeeAmount] = useState();
  const isLaptop = useIsLaptop();
  const tokenAmount = useMemo(() => toBN(toBNAmount(customFixed(amount, activeToken.pairToken.decimals), activeToken.pairToken.decimals)), [activeToken.pairToken.decimals, amount]);

  const getOptions = useCallback((minRange, maxRange) => {
    try {
      if(maxMinutes === 0 && maxHours === 0) return [];
      if((!minRange && minRange !== 0) || !maxRange) return [];
      const _maxRange = optionsType === 'minutes' ? maxRange * 60 : maxRange; 
      return [...new Array(_maxRange)].map((option, index) => index+minRange)
    } catch(error) {
      console.log(error);
      return []
    }
  }, [maxHours, maxMinutes, optionsType]);

  useEffect(() => {
    const calculateNetAmount = async () => {
      let isValid = true;
      try {
        const longTokenFeesCalculator = w3?.tokens[activeToken.rel.contractKey].platform.feesCalculator;
        const {_submitFeeAmount, _netFeeAmount, _delayFeeAmount} = await getSubmitFees(type, tokenAmount, delayFee.feePercent, longTokenFeesCalculator);
        setTimeDelayFeeAmount(_delayFeeAmount);
        setSubmitFeeAmount(_submitFeeAmount);
        setNetAmount(_netFeeAmount);
      }
      catch(error) {
        console.log(error);
        setSubmitFeeAmount("N/A");
        setNetAmount("N/A");
        setTimeDelayFeeAmount("N/A");
      } finally {
        if(!isValid) {
          setSubmitFeeAmount("N/A");
          setNetAmount("N/A");
          setTimeDelayFeeAmount("N/A");
        }
      }
    }
    if (!activeToken?.rel.contractKey || !w3?.tokens || !delayFee?.feePercent) return;
    calculateNetAmount();
  }, [activeToken.rel.contractKey, w3?.tokens, amount, activeToken.pairToken.decimals, tokenAmount, token, activeToken, delayFee, setNetAmount, type])

  const calculateTimeDelayFee = useCallback(async (totalTime) => {
    let isValid = true;
    try {
      if(!hoursDropdownValue && !minutesDropdownValue) return;
      if(totalTime < (maxMinutes * 60) || totalTime > (maxHours * 60 * 60)) return;
      const timeDelayFee = await w3?.tokens[activeToken.rel.contractKey].calculateTimeDelayFee(totalTime);
      setDelayFee(prev => ({
        ...prev,
        fee: timeDelayFee.feeNumber,
        feePercent: timeDelayFee.feePercent,
        totalTime: maxHours * 60 * 60
      }));
    } catch (error) {
      console.log(error);
      setDelayFee("N/A");
    } finally {
      if(!isValid) setDelayFee("N/A");
    }
  }, [activeToken.rel.contractKey, hoursDropdownValue, maxHours, maxMinutes, minutesDropdownValue, setDelayFee, w3?.tokens]);

  const calculateTimeDelayFeeDebounce = useMemo(
    () => debounce(calculateTimeDelayFee, 750),
  [calculateTimeDelayFee]);

  useEffect(() => {
    if(!w3 || !w3.tokens) return; 

    const fetchData = async () => {
      try {
          const {maxTimeWindow, minTimeWindow} = await w3?.tokens[activeToken.rel.contractKey].getTimeDelayWindow();
          setMaxHours(maxTimeWindow ? (maxTimeWindow/60/60) : 0);
          setMaxMinutes(minTimeWindow < 3600 ? (minTimeWindow/60) : minTimeWindow/60);

          if(optionsType === 'minutes') {
            setMinutesDropdownValue(maxTimeWindow/60)
          }
      } catch (error) {
        console.log(error);
        setMaxHours("0");
        setMaxMinutes("0");
      }
    }

    const fetchDataDebounce = debounce(fetchData, 350);
    fetchDataDebounce();

    return () => {
      fetchDataDebounce.cancel();
    }
  }, [activeToken.rel.contractKey, optionsType, w3]);

  useEffect(() => {
    const calculateDropdown = () => {
      if(optionsType === 'minutes') {
        const totalTime = Number(minutesDropdownValue * 60);
        setDelayFee({fee: null, delayTime: totalTime});
        calculateTimeDelayFeeDebounce(totalTime);
        return;
      }

      if(!isNumber(hoursDropdownValue) && !isNumber(!minutesDropdownValue)) {
        setHoursDropdownValue(maxHours || "0");
        return setMinutesDropdownValue("0");
      }
      
      const totalTime = Number(hoursDropdownValue * 60 * 60) + Number(minutesDropdownValue * 60);
      setDelayFee({fee: null, feePercent: null, delayTime: totalTime});
      calculateTimeDelayFeeDebounce(totalTime);
  
      if(Number(hoursDropdownValue) >= maxHours) return setMinutesDropdownValue("0");
      if(Number(hoursDropdownValue) === 0 && Number(minutesDropdownValue) < maxMinutes) return setMinutesDropdownValue(maxMinutes);
    }
    
    calculateDropdown();
    
    return () => {
      calculateTimeDelayFeeDebounce.cancel();
    }
  }, [hoursDropdownValue, minutesDropdownValue, maxHours, maxMinutes, calculateTimeDelayFee, calculateTimeDelayFeeDebounce, setDelayFee, optionsType]);

  return useMemo(() => {
    const hoursOptions = getOptions(maxHours > 1 ? 1 : 0 , maxHours > 1 ? maxHours : maxHours+1);
    const minutesOptions = () => {
      if(optionsType === 'minutes') return getOptions(maxMinutes, maxHours - ((maxMinutes - 1) / 60));
      return getOptions(hoursDropdownValue === 0 ? maxMinutes < 60 ? maxMinutes : (maxMinutes/60) : 0, hoursDropdownValue === maxHours ? 0 : Math.floor((61-(maxMinutes/60))));
    }

    return (
      <div className="receive-wrapper">
        <div className="receive-title">
          <span className="receive-in">Receive in
            {isLaptop && <Tooltip
              type="question"
              left={tooltip?.left ?? -30}
              mobileLeft={tooltip?.mobileLeft}
              maxWidth={400}
              minWidth={250}
              content={tooltip?.content}
            />}
          </span>
          
          <BetweenText 
            optionsType={optionsType}
            maxMinutes={maxMinutes} 
            maxHours={maxHours} 
          />
          {!isLaptop && <Tooltip
            type="question"
            left={tooltip?.left ?? -30}
            mobileLeft={tooltip?.mobileLeft}
            maxWidth={400}
            minWidth={250}
            content={tooltip?.content}
          />}
        </div>

        <div className={`time-wrapper ${optionsType}`}>
          {
            optionsType === 'hours' && <> 
               <Dropdown
                type="number"
                label="hours"
                dropdownOptions={hoursOptions}
                dropdownValue={hoursDropdownValue}
                setDropdownValue={setHoursDropdownValue}
              />
              <span>:</span>
            </>
          }
          <Dropdown
            type="number"
            label="minutes"
            dropdownOptions={minutesOptions()}
            dropdownValue={minutesDropdownValue}
            setDropdownValue={setMinutesDropdownValue}
          />
        </div>
        <div className="net-amount">
          <span className="net-amount-title">
            {`Net ${type ?? 'mint'} amount`}
            <Tooltip
              type="question"
              left={0}
              mobileLeft={-40}
              maxWidth={336}
              minWidth={336}
            >
              <div className="tooltip-container">
                <div className="tooltip-data">
                  <Stat 
                    className="row small-value"
                    title="Amount"
                    value={amount === 'N/A' ? 'N/A' : amount === undefined ? null : `${amount > 0 ? customFixed(amount, activeToken.pairToken.decimals) : 0} ${upperCase(token)}`}
                  />
                  <Stat 
                    className="row small-value"
                    title={`${upperFirst(type)} fees`}
                    value={submitFeeAmount === 'N/A' ? 'N/A' : submitFeeAmount === undefined ? null : `${commaFormatted(customFixedTokenValue(submitFeeAmount, activeToken.pairToken.fixedDecimals, activeToken.pairToken.decimals))} ${upperCase(token)}`}
                  />
                  <Stat 
                    className="row small-value"
                    title="Time delay"
                    value={timeDelayFeeAmount === 'N/A' ? 'N/A' : timeDelayFeeAmount === undefined ? null : `${commaFormatted(customFixedTokenValue(timeDelayFeeAmount, activeToken.pairToken.fixedDecimals, activeToken.pairToken.decimals))} ${upperCase(token)}`}
                  />
                  <div className="divider"></div>
                  <Stat 
                    className="row small-value"
                    title={`Net ${type ?? 'mint'} amount`}
                    value={netAmount === 'N/A' ? 'N/A' : netAmount === undefined ? null : `${commaFormatted(customFixedTokenValue(tokenAmount.sub(netAmount), activeToken.pairToken.fixedDecimals, activeToken.pairToken.decimals))} ${upperCase(token)}`}
                  />
                </div>
              </div>
            </Tooltip>
          </span>
          <span className="net-amount-value">
            {netAmount === 'N/A' ? 'N/A' : netAmount === undefined ? <Spinner className="statistics-spinner" /> : `${commaFormatted(customFixedTokenValue(tokenAmount.sub(netAmount), activeToken.pairToken.fixedDecimals, activeToken.pairToken.decimals))} ${upperCase(token)}`}
          </span>
        </div>
      </div>
    );
  }, [getOptions, maxHours, isLaptop, tooltip?.left, tooltip?.mobileLeft, tooltip?.content, optionsType, maxMinutes, hoursDropdownValue, minutesDropdownValue, type, amount, token, submitFeeAmount, timeDelayFeeAmount, netAmount, tokenAmount, activeToken.pairToken.fixedDecimals, activeToken.pairToken.decimals])
};

const BetweenText = ({optionsType, maxMinutes, maxHours}) => {
  return useMemo(() => {
    if(!maxMinutes && !maxHours) return <span className="between-text">between <Spinner className="statistics-spinner" /> {optionsType} to <Spinner className="statistics-spinner" /> {optionsType}.</span>
    return <span>
      (between 
      {(optionsType === 'minutes' || maxHours <= 1) ? ` ${maxMinutes} ${optionsType}` : ` ${maxMinutes/60} hour`} 
      &nbsp;to {optionsType === 'minutes' ? `${maxHours * 60} ${optionsType}` : ` ${maxHours} ${optionsType}`})
    </span>
  }, [maxHours, maxMinutes, optionsType]);
}
export default ReceiveIn;

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Stat from "components/Stat";
import { appViewContext } from "components/Context";
import { debounce, isNumber } from "lodash";
import Dropdown from "components/Dropdown/Dropdown";
import "./TimeToFullfill.scss";
import Spinner from "components/Spinner/Spinner";
import { customFixed } from "utils";
import { useSelector } from "react-redux";
import arbitrageConfig from "config/arbitrageConfig";

const TimeToFullfill = ({ delayFee, setDelayFee }) => {
  const { selectedNetwork } = useSelector(({app}) => app);
  const optionsType = arbitrageConfig.timeToFulfillment[selectedNetwork].type;
  const { w3, activeToken } = useContext(appViewContext);
  const [hoursDropdownValue, setHoursDropdownValue] = useState("");
  const [minutesDropdownValue, setMinutesDropdownValue] = useState("");
  const [maxHours, setMaxHours] = useState();
  const [maxMinutes, setMaxMinutes] = useState();


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

  const calculateTimeDelayFee = useCallback(async (totalTime) => {
    let isValid = true;
    try {
      if(!hoursDropdownValue && !minutesDropdownValue) return;
      if(totalTime < (maxMinutes * 60) || totalTime > (maxHours * 60 * 60)) return;
      const timeDelayFee = await w3?.tokens[activeToken.rel.contractKey].calculateTimeDelayFee(totalTime);
      setDelayFee(prev => ({
        ...prev,
        fee: timeDelayFee.feeNumber,
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
      setDelayFee({fee: null, delayTime: totalTime});
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
      <div className="fullfill-wrapper">
        <h2>Time to fulfillment</h2>
        <BetweenText 
          optionsType={optionsType}
          maxMinutes={maxMinutes} 
          maxHours={maxHours} 
        />

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
        <div className="time-to-fulfill-fee">
          <Stat 
            className="row bold small-value"
            title="Time to fulfillment fee"
            value={delayFee === 'N/A' ? 'N/A' : delayFee?.fee === null ? null : `${customFixed(delayFee.fee, 2)}%`}
          />
        </div>
      </div>
    );
  }, [delayFee, getOptions, hoursDropdownValue, maxHours, maxMinutes, minutesDropdownValue, optionsType])
};

const BetweenText = ({optionsType, maxMinutes, maxHours}) => {
  return useMemo(() => {
    if(!maxMinutes && !maxHours) return <span className="between-text">Between <Spinner className="statistics-spinner" /> {optionsType} to <Spinner className="statistics-spinner" /> {optionsType}.</span>
    return <span>
      (Between 
      {(optionsType === 'minutes' || maxHours <= 1) ? ` ${maxMinutes} ${optionsType}` : ` ${maxMinutes/60} hour`} 
      &nbsp;to {optionsType === 'minutes' ? `${maxHours * 60} ${optionsType}` : ` ${maxHours} ${optionsType}`})
    </span>
  }, [maxHours, maxMinutes, optionsType]);
}
export default TimeToFullfill;

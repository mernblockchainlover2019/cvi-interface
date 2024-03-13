import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import moment from 'moment';
import Api from "Api";
import { useDispatch, useSelector } from "react-redux";
import { updateVolInfo } from "store/actions";
import { activeVolsSet, customFixed, toDisplayAmount } from "utils";
import { chainNames, chainsData } from "connectors";
import { debounce } from "lodash";
import config from "config/config";
import { contractsContext } from "contracts/ContractContext";
import { getCviValue } from "contracts/utils";

export const getPercentageChange = (oldNumber, newNumber) => {
   const decreaseValue = oldNumber - newNumber;
   return (decreaseValue / oldNumber) * 100;
}

const useCvi = () => {
   const dispatch = useDispatch();
   const interval = useRef();
   const indexInfo = useSelector(({app}) => app.indexInfo);
   const { selectedNetwork } = useSelector(({app}) => app);
   const [timeDuration, setTimeDuration] = useState();
   const contracts = useContext(contractsContext);
   
   const getIndexFromOracle = useCallback(async (type) => {
      try {
         if(!contracts) return null;
         const value = await getCviValue(contracts[type]);
         return value === "N/A" ? null : value;
      } catch(error) {
         console.log(error);
      }
   }, [contracts]);

   const mappedIndexData = (key, customIndex, {index, oneHourAgo, oneDayChange, oneDayChangePercent, oneWeekHigh, oneWeekLow, timestamp}) => {
      return {
         key,
         time: moment.utc(timestamp * 1000).format("LLL"),
         index: customIndex ? toDisplayAmount(customIndex, 2) : customFixed(index, 2),
         oneDayChange: customFixed(oneDayChange, 2),
         oneDayChangePercent: customFixed(oneDayChangePercent, 2),
         oneHourAgo: customFixed(oneHourAgo, 2),
         oneWeekHigh: customFixed(oneWeekHigh, 2), 
         oneWeekLow: customFixed(oneWeekLow, 2),
         [`${key}ApiV2`]: index,
         [`${key}Oracle`]: customIndex,
      }
   }

   const startPollingInterval = () => {
      const nextUpdateOnMinutes = chainsData[selectedNetwork]?.poolingInterval || 62;
      const now = moment.utc();
      const pollingTime = ((nextUpdateOnMinutes - (now.minute() % nextUpdateOnMinutes))) * 60 * 1000;
      setTimeDuration(pollingTime);
   }

   const fetchGraphData = useCallback(async (index = "cvi") => {
         try {
            const chainName = selectedNetwork === chainNames.Matic ? 'Polygon' : selectedNetwork;
            const { data: hourlySeries } = await Api.GET_INDEX_HISTORY({chainName, index: config.volatilityApiKey[index]}); 
            const { data: dailyHistory } = await Api.GET_FULL_DAILY_HISTORY({chainName, index: config.volatilityApiKey[index]}); 
            const sortedHourlySeries = hourlySeries
               .map(serie => ([serie[0] * 1000, serie[1]]))
               .sort((a,b)=> b[0] - a[0])
               .slice(0, 4000)
               .reverse() // limit to 4000 attributes, from now to the past. 

            const sortedDailySeries = dailyHistory.sort((a,b)=> a[0] - b[0])
            dispatch(updateVolInfo({
               history: {
                  daily: sortedDailySeries,
                  hourly: sortedHourlySeries
               }
            }, index));
         } catch(error) {
            dispatch(updateVolInfo({
               history: "N/A"
            }, index));
            console.log(error);
         }
      }, [dispatch, selectedNetwork],
   )

   const fetchVolData = useCallback(async () => {
      try {

         const _activeVolsSet = activeVolsSet(selectedNetwork);
         const activeVolsList = Object.values(_activeVolsSet);
         
         Object.keys(indexInfo).forEach(volKey => { // remove unlisted vols from redux state
            if(!activeVolsList.some(activeVolKey => activeVolKey === volKey)) {
               dispatch(updateVolInfo(null, volKey));
            }
         })
         
         activeVolsList.forEach(volKey => {
            fetchGraphData(volKey);
         });

         const chainName = selectedNetwork === chainNames.Matic ? 'Polygon' : selectedNetwork;
         const { data: volInfo } = await Api.GET_VOL_INFO(chainName); // fetch vols info from backend
        
         // map and filter backend data by active vols.
         (await Promise.allSettled(activeVolsList.map(async volKey => {
            const volIndex = await getIndexFromOracle(config.oracles[volKey]);
            return mappedIndexData(volKey, volIndex, volInfo?.data?.[config.volatilityApiKey[volKey]])
         })))
         .filter(({status}) => status === "fulfilled")
         .map(({value}) => value)
         .forEach(volInfo => {
            dispatch(updateVolInfo(volInfo, volInfo.key));
         });
      } catch (error) {
         console.log(error);
      }
   }, [dispatch, fetchGraphData, getIndexFromOracle, indexInfo, selectedNetwork]);

   const getDataDebounce = useMemo(
      () => debounce(fetchVolData, 750)
   , [fetchVolData]);

   useEffect(()=> {
      if(!selectedNetwork || !contracts) return;
      startPollingInterval();
      getDataDebounce();

      return () => {
         getDataDebounce.cancel();
      }
      //eslint-disable-next-line
   }, [selectedNetwork, contracts]);


   useEffect(() => {
      if(!selectedNetwork) return;
      interval.current = setInterval(() => {
            if(timeDuration) {
               getDataDebounce();
               startPollingInterval();
            }
      }, timeDuration);
      return () => interval.current && clearInterval(interval.current);
   //eslint-disable-next-line
   }, [timeDuration, selectedNetwork]);

   return useMemo(() => {
      try {
         if(!indexInfo) return {};
         return {
            ...indexInfo
         }
      } catch (error) {   
            console.error('Failed to get cvi info', error)
            return {}
      }
   }, [indexInfo])
}

export default useCvi;
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setData } from 'store/actions/wallet';
import { useActiveWeb3React } from '../wallet';

const useArbitrageEvents = (w3, activeToken) => {
  const dispatch = useDispatch();
  const [{unfulfilledRequests, arbitrage}, events] = useSelector(({wallet, events}) => [wallet, events]);
  const { actionConfirmed } = events;
  const { account } = useActiveWeb3React();
  const tokenEvents = events[activeToken?.rel?.volTokenKey];
  const { volTokenKey } = activeToken?.rel || {};
  
  const fetchHistory = useCallback(async () => {
    try {
      const history = await w3?.tokens[volTokenKey].getHistory({account});
      dispatch(setData("arbitrage", history));
    } catch (error) {
      console.log("ArbitrageEvents fetch history error: ", error);
    }
  }, [account, volTokenKey, dispatch, w3?.tokens])

  const fetchUnfulfilledRequests = useCallback(async () => {
    try {
      const unfulfilledRequests = await w3?.tokens[volTokenKey].getUnfulfilledRequests({account});
      dispatch(setData("unfulfilledRequests", unfulfilledRequests));
    } catch (error) {
      console.log(error);
    }
  }, [account, volTokenKey, dispatch, w3?.tokens]);

  useEffect(()=> {
    if(!activeToken?.rel || !account || !w3?.tokens || unfulfilledRequests) return;
    fetchUnfulfilledRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w3?.tokens, account, activeToken?.rel, fetchUnfulfilledRequests]);
    
  useEffect(()=>{
    if(!activeToken?.rel || !w3?.tokens || !account || arbitrage) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w3?.tokens, account, activeToken?.rel, fetchHistory]);
  
  useEffect(()=>{
    if(!tokenEvents?.Mint?.events?.length) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenEvents?.Mint?.events?.length]);
  
  useEffect(()=>{
    if(!tokenEvents?.Burn?.events?.length) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenEvents?.Burn?.events?.length]);
  
  useEffect(()=>{
    if(!tokenEvents?.CollateralizedMint?.events?.length) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenEvents?.CollateralizedMint?.events?.length]);

  useEffect(() => {
    if(!actionConfirmed) return;
    fetchHistory();
    fetchUnfulfilledRequests();
  }, [actionConfirmed, fetchHistory, fetchUnfulfilledRequests])
    
  useEffect(()=>{
    if(!events || !tokenEvents || !w3?.tokens) return;

    const getUnfulfilledRequestsById = async (requestId) => {
      try {
        const lastRequest = await w3?.tokens[volTokenKey].getUnfulfilledRequests({requestId, account});
        if(!lastRequest?.length) return;
        dispatch(setData("unfulfilledRequests", lastRequest[0], true, "requestId"));
      } catch (error) {
        console.log(error);
      }
    }
    
    const longTokenUnfulfilledEvents = events[volTokenKey]?.SubmitRequest?.events;
    if(!!longTokenUnfulfilledEvents?.length) {
      const lastEvent = longTokenUnfulfilledEvents[longTokenUnfulfilledEvents.length-1];
      getUnfulfilledRequestsById(lastEvent.requestId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenEvents?.SubmitRequest?.events?.length]);

  useEffect(()=>{
    if(!events || !tokenEvents?.FulfillRequest|| !w3?.tokens) return;
    const longTokenFulfillRequestEvents = events[volTokenKey]?.FulfillRequest?.events;
    if(!!longTokenFulfillRequestEvents?.length) {
      const lastEvent = longTokenFulfillRequestEvents[longTokenFulfillRequestEvents.length-1];
      const unfulfilledFiltered = unfulfilledRequests.filter(({requestId}) => lastEvent.requestId !== requestId);
      dispatch(setData("unfulfilledRequests", unfulfilledFiltered));

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenEvents?.FulfillRequest?.events?.length]);

  useEffect(()=>{
    if(!events || !tokenEvents?.LiquidateRequest|| !w3?.tokens || !unfulfilledRequests) return;
    const longTokenLiquidateRequestEvents = events[volTokenKey]?.LiquidateRequest?.events;
    if(!!longTokenLiquidateRequestEvents?.length) {
      const lastEvent = longTokenLiquidateRequestEvents[longTokenLiquidateRequestEvents.length-1];
      const unfulfilledFiltered = unfulfilledRequests.filter(({requestId}) => lastEvent.requestId !== requestId);
      dispatch(setData("unfulfilledRequests", unfulfilledFiltered));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenEvents?.LiquidateRequest?.events?.length]);
}

export default useArbitrageEvents;
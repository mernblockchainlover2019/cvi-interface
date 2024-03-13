import { useWeb3React } from "@web3-react/core";
import config from "config/config";
import { contractsContext } from "contracts/ContractContext";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { addEvent } from "store/actions/events";

const eventsToListen = [
    "Transfer",
    "Withdraw",
    "RewardAdded",
    "RewardPaid",
    "Staked",
    "Withdrawn",
    "Claimed",
    "Mint",
    "Burn",
    "SubmitRequest",
    "CollateralizedMint",
    "FulfillRequest",
    "LiquidateRequest"
];

const useSubscribe = () => {
    const { account, library: web3 } = useWeb3React(config.web3ProviderId);
    const [subscribedEvents,  setSubscribedEvents] = useState({});
    const [called,  setCalled] = useState(null);
    const contracts = useContext(contractsContext);
    const dispatch = useDispatch();
    const mapEvents = () => {
        // filter the JSON Interface from the contracts
        const [contractsNames, contractsObj] = [Object.keys(contracts), Object.values(contracts)];
        return contractsObj.map((a, i) => ({name: contractsNames[i], events: a._jsonInterface.filter(({type}) => type === 'event') }));
    }
    const subscribeLogEvent = () => {
        const assets = mapEvents();
        assets.forEach(({name, events} )=> {
            try {
                const contract = contracts[name];
                if(!contract) return
                events.forEach(eventJsonInterface => {
                    const eventName = eventJsonInterface.name;
                    if(eventsToListen.includes(eventName)){
                        const subscription = web3.eth.subscribe('logs', {
                            address: contract.options.address,
                            topics: [eventJsonInterface?.signature, web3.utils.padLeft(account, 64)]
                        }, (error, result) => {
                            if (!error) {
                                // console.log('...result: ', result);
                                const eventObj = web3.eth.abi.decodeLog(
                                    eventJsonInterface.inputs,
                                    result.data,
                                    result.topics.slice(1),
                                    )
                                    if(!config.isMainnet || process.env.NODE_ENV === "development") {
                                        console.log(`New ${eventName} of ${name}!`, eventObj);
                                    }
                                    dispatch(addEvent(name, eventName, eventObj))
                                }
                            })

                            setSubscribedEvents(prev => ({
                                ...prev,
                                [name]: {
                                    ...prev[name],
                                    [eventName]: subscription
                                }
                            }))
                            if(!config.isMainnet || process.env.NODE_ENV === "development") {
                                console.log(`subscribed to event '${eventName}' of contract '${name}' `) 
                            }
                        }
                });
            } catch (error) {
                console.log(error);
                console.log(name);
            }
        });
    } 
    useEffect(() =>{
        return () => {
            const events = Object.values(Object.values(subscribedEvents));
            events.forEach((subs) => {
                Object.values(subs).forEach((sub)=>{
                    sub.unsubscribe(function(error, success){
                        if(error) console.log("error: ", error);
                        if(success)
                            console.log('Successfully unsubscribed!');
                    });
                })
            }) 
        }
    },[subscribedEvents])

    useEffect(() => {
        if(called || !contracts || !account) return
        setCalled(true);
        subscribeLogEvent();
        // eslint-disable-next-line
    }, [contracts, account]);

    return useMemo( ()=> { return null }, []);
}

export default useSubscribe;
import { useActionController } from 'components/Actions/ActionController';
import { useInDOM, useNetworkVersion } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { useWeb3Api } from 'contracts/useWeb3Api';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getTimeDurationFormatted } from 'utils';
import Tooltip from 'components/Tooltip';
import './Countdown.scss';

import config from 'config/config';

export const useTimer = ({ timerDuration, setTimerDuration, start = true, stopPoint = 0, step = 1000}) => {
    const _lockedDurationTimer = useRef();
    const isActiveInDOM = useInDOM();
    useEffect(() => {
        if(timerDuration === null || timerDuration < stopPoint || timerDuration === undefined || !start) return;
        _lockedDurationTimer.current = setTimeout(() => {
            if(isActiveInDOM()) { 
                setTimerDuration(prevTime => {
                    if(prevTime === null || prevTime === undefined) return;
                    if(timerDuration <= stopPoint) {
                        clearTimeout(_lockedDurationTimer.current);
                        return 0;
                    }
                    return prevTime - step
                });
            }
        }, 1000);

        return () => {
            if(_lockedDurationTimer.current) clearTimeout(_lockedDurationTimer.current);
        }
    }, [isActiveInDOM, setTimerDuration, start, step, stopPoint, timerDuration]);
}

export const useIsLockedTime = (start = true) => {
    const { account } = useActiveWeb3React();
    const { token, type } = useActionController();
    const isLockedOptionsPayload = useMemo(() => ({updateOn: type === "withdraw" ? 'liquidities' : 'positions'}), [type]);
    const isLockedPayload = useMemo(() => ({type, account, stopInitialCall: !start}), [type, account, start]);
    const [lockedData] = useWeb3Api("isLocked", token, isLockedPayload, isLockedOptionsPayload);
    const [_lockedTime, setLockTime] = useState(null);
    useTimer({timerDuration: _lockedTime, setTimerDuration: setLockTime, start });

    useEffect(() => {
        if(lockedData && lockedData !== "N/A" && start) {
            setLockTime(lockedData[1]);
        }
    }, [lockedData, start]);

    return _lockedTime;
}

export const CountdownComponent = ({ lockedTime, className, showIfZero, showSeconds, isExpired, isInsufficientLiquidity }) => {
    const appVersion = useNetworkVersion()
    return useMemo(() => {
        if(lockedTime === "N/A" || lockedTime === undefined || lockedTime === null || isNaN(lockedTime)) return null;
        return <div className={`count-down-component ${className ?? ''}`}>
            <div className='processing'>
                {lockedTime && lockedTime > 0 ?
                <> 
                    <img src={require('../../images/icons/processing.svg').default} alt="processing" /> 
                    <b>{getTimeDurationFormatted(lockedTime, showSeconds)}</b> 
                    <small>HH:MM{showSeconds && ":SS"}</small>
                </>
                : showIfZero ?
                    isExpired ?
                        <> 
                            <img src={require('../../images/icons/processing-expired.svg').default} alt="expired" /> 
                            <b>Expired</b> 
                        </> :
                        <> 
                            <img src={require('../../images/icons/processing-negative.svg').default} alt="processing" /> 
                            { appVersion === 'v2' ? <b>Processing</b> : 
                                <>
                                    <b>{getTimeDurationFormatted(lockedTime, showSeconds)}</b> 
                                    <small>HH:MM{showSeconds && ":SS"}</small>
                                </>
                            }
                        </>
                : null
                }
            </div>
            <div className='insufficient-liquidity'>  
                {appVersion === 'v2' && isInsufficientLiquidity && <span className='insufficient-content'>{config.statisticsDetails.insufficientLiquidity.title} 
                    <Tooltip
                        type="question"
                        left={config.statisticsDetails.insufficientLiquidity.tooltip?.left ?? -30}
                        mobileLeft={config.statisticsDetails.insufficientLiquidity.tooltip?.mobileLeft}
                        maxWidth={400}
                        minWidth={330}
                        content={config.statisticsDetails.insufficientLiquidity.tooltip?.content}
                        />
                    </span>
                }
            </div>
        </div>
    }, [lockedTime, className, showSeconds, showIfZero, isExpired, appVersion, isInsufficientLiquidity])
}

export default CountdownComponent;
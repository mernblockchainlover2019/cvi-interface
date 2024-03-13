import CountdownComponent, { useTimer } from 'components/Countdown/Countdown';
import { useNetworkVersion } from 'components/Hooks';
import arbitrageConfig from 'config/arbitrageConfig';
import React, { useEffect, useMemo, useState } from 'react'

export const twelveHours = 43200000;
export const twoMinutes = 60000 * 2;

const FulfillmentInTimer = ({ fulfillmentIn, isInsufficientLiquidity, actionType, setActionType, setIsExtendTime}) => {
    const appVersion = useNetworkVersion();
    const [_lockedTime, setLockTime] = useState(fulfillmentIn);
    useTimer({ timerDuration: _lockedTime, setTimerDuration: setLockTime, start: true, stopPoint: -twelveHours });

    useEffect(() => {
        if(-twelveHours >= _lockedTime) {
            setActionType(arbitrageConfig.actionsConfig.liquidate.key);
        } else if(appVersion === 'v2') {
            if(_lockedTime < 0 && _lockedTime >= -twoMinutes) {
                setActionType(arbitrageConfig.actionsConfig.processing.key);
            } else if(_lockedTime < -twoMinutes){
                setActionType(arbitrageConfig.actionsConfig.fulfill.key);
            }
        }
    }, [_lockedTime, actionType, appVersion, setActionType, setIsExtendTime]);

    return useMemo(() => {
        return <CountdownComponent 
                lockedTime={_lockedTime} 
                isExpired={_lockedTime <= -twelveHours}
                isInsufficientLiquidity={isInsufficientLiquidity}
                showIfZero
                showSeconds
            />
    }, [_lockedTime, isInsufficientLiquidity]);
}

export default FulfillmentInTimer;
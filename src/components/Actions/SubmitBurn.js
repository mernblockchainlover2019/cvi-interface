import Button from 'components/Elements/Button';
import { useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { useActiveToken, useInDOM, useNetworkVersion } from 'components/Hooks';
import { useActionController } from './ActionController';
import { actionConfirmEvent, toBN, toBNAmount } from '../../utils/index';
import { useDispatch } from 'react-redux';
import { addAlert } from 'store/actions';
import config from '../../config/config';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { appViewContext } from 'components/Context';
import { setData } from 'store/actions/wallet';
import { upperCase } from 'lodash';
import Note from 'components/Note';

const SubmitBurn = () => {
    const dispatch = useDispatch();
    const [status, setStatus] = useState();
    const isActiveInDOM = useInDOM();
    const { account } = useActiveWeb3React();
    const { w3 } = useContext(appViewContext);
    const { type, disabled, setIsOpen, amount, setAmount, delayFee, cb: updateAvailableBalance } = useActionController();
    const activeToken = useActiveToken(type);
    const [isSubmitProcessing, setSubmitProcessing] = useState();
    const [isApproveProcessing, setApproveProcessing] = useState();
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const appVersion = useNetworkVersion();

    const getAllowance = useCallback(async () => {
        const volToken = w3.tokens[activeToken.rel.volTokenKey];
        
        const allowance = await volToken.allowance(volToken.address, account);
        if (allowance > toBN(0)) {
            setStatus(config.approveStatus.alreadyApproved.key);
        } else {
            setStatus(config.approveStatus.notApproved.key);
        }
    }, [w3?.tokens, account, activeToken.rel.volTokenKey])

    useEffect(() => {
        if ((!status || status === config.approveStatus.notApproved.key)  && w3) {
            getAllowance();
        }
    }, [w3, status, account, activeToken.rel.volTokenKey, getAllowance])

    const onApprove = useCallback(async () => {
        setApproveProcessing(true);

        try {
            const volToken = w3?.tokens[activeToken.rel.volTokenKey];

            const allowance = await volToken.allowance(volToken.address, account);
            if (allowance > toBN(0)) return;

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet."
            }));

            await volToken.approve(account, volToken.address);

            setStatus(config.approveStatus.justApproved.key);

            actionConfirmEvent(dispatch);

            dispatch(addAlert({
                id: 'approve',
                eventName: "Approve request - success",
                alertType: config.alerts.types.CONFIRMED,
                message: "Transaction success!"
            }));
        }
        catch (error) {
            console.log(error);
        
            dispatch(addAlert({
                id: 'approve',
                eventName: "Approve - failed",
                alertType: config.alerts.types.FAILED,
                message: "Transaction failed!"
            }));
        }
        finally {
            if(isActiveInDOM()) {
                setApproveProcessing(false);
            }
        }
    }, [w3, activeToken.rel.volTokenKey, account, dispatch, isActiveInDOM])

    const onClick = useCallback(async () => {
        setSubmitProcessing(true);

        try {
            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet."
            }));

            const burnResponse = await w3?.tokens[activeToken.rel.volTokenKey].submitBurn(tokenAmount, {
                delay: delayFee.delayTime,
                keepers: true,
                account 
            });

            if(burnResponse.event) {
                dispatch(setData("unfulfilledRequests", burnResponse.event, true, "requestId"));
            } else {
                actionConfirmEvent(dispatch);
            }

            dispatch(addAlert({
                id: 'Burn',
                eventName: "Burn request - success",
                alertType: config.alerts.types.CONFIRMED,
                message: "Transaction success!"
            }));
        } catch (error) {
            console.log(error);
        
            dispatch(addAlert({
                id: 'Burn',
                eventName: "Burn - failed",
                alertType: config.alerts.types.FAILED,
                message: "Transaction failed!"
            }));
        } finally {
            if(isActiveInDOM()) {
                setSubmitProcessing(false);
                setAmount("");
                setIsOpen(false);
                if(updateAvailableBalance) {
                    updateAvailableBalance();
                }
            }
        }
    }, [account, activeToken.rel.volTokenKey, delayFee.delayTime, dispatch, isActiveInDOM, setAmount, setIsOpen, tokenAmount, updateAvailableBalance, w3])

    return useMemo(() => {
        return  (
            <div className="burn-component">
                {appVersion === 'v2' && <> 
                    <Note title="Note:">A small keeper fee will be taken when you receive the tokens</Note> 
                    { status === config.approveStatus.notApproved.key && <Note title="Approve:">You only have to do this once per tokens</Note> }
                </>}
                <div className="button-group">
                    { status && status !== config.approveStatus.alreadyApproved.key && <Button 
                        className="button approve" 
                        onClick={onApprove}
                        disabled={status === config.approveStatus.justApproved.key}
                        processing={isApproveProcessing}
                        processingText={!isApproveProcessing && "Calculating"}
                    >
                        {status === config.approveStatus.justApproved.key ? <><img className="connected-icon" src={require('../../images/icons/confirmed-icon.svg').default} alt="confirmed" /> 1. APPROVED</> : `1. APPROVE ${upperCase(activeToken.name)}`}
                    </Button>}
                    { status && <Button 
                        className={`button ${(appVersion !== 'v2' || !status || status === config.approveStatus.alreadyApproved.key) && 'full'}`} 
                        buttonText={ (appVersion !== 'v2' || !status || status === config.approveStatus.alreadyApproved.key) ? ((amount && amount !== "0") ? "SUBMIT" : 'ENTER AMOUNT') : ((amount && amount !== "0") ? "2. SUBMIT" : "2. ENTER AMOUNT") }
                        onClick={onClick}
                        disabled={disabled || delayFee === 'N/A' || !amount || amount === "0" || delayFee?.fee === null || !status || (appVersion === 'v2' && status === config.approveStatus.notApproved.key)}
                        processing={isSubmitProcessing || delayFee?.fee === null || amount === null}
                        processingText={!isSubmitProcessing && "Calculating"}
                    />}
                </div>
            </div>
        )
    }, [appVersion, status, activeToken.name, onApprove, isApproveProcessing, onClick, disabled, delayFee, amount, isSubmitProcessing])
}

export default SubmitBurn;
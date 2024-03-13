import Button from 'components/Elements/Button';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useActiveToken, useInDOM, useNetworkVersion } from 'components/Hooks';
import { useActionController } from './ActionController';
import { actionConfirmEvent, commaFormatted, toBN, toBNAmount, toDisplayAmount } from '../../utils/index';
import { useDispatch } from 'react-redux';
import { addAlert } from 'store/actions';
import config from 'config/config';
import { appViewContext } from 'components/Context';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import ErrorModal from 'components/Modals/ErrorModal';
import { upperCase } from 'lodash';
import { setData } from 'store/actions/wallet';
import Note from 'components/Note';

const SubmitMint = () => {
    const dispatch = useDispatch();
    const [status, setStatus] = useState();
    const isActiveInDOM = useInDOM();
    const { account } = useActiveWeb3React();
    const { w3 } = useContext(appViewContext);
    const { type, disabled, setIsOpen, amount, setAmount, delayFee, slippageTolerance, cb: updateAvailableBalance } = useActionController();
    const activeToken = useActiveToken(type);
    const [isSubmitProcessing, setSubmitProcessing] = useState();
    const [isApproveProcessing, setApproveProcessing] = useState();
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const [errorMessage, setErrorMessage] = useState();
    const appVersion = useNetworkVersion();

    const getAllowance = useCallback(async () => {
        const baseToken = w3.tokens[upperCase(activeToken.key)];
        const volToken = w3.tokens[activeToken.rel.volTokenKey];
        
        const allowance = await baseToken.allowance(volToken.address, account);
        if (allowance > toBN(0)) {
            setStatus(config.approveStatus.alreadyApproved.key);
        } else {
            setStatus(config.approveStatus.notApproved.key);
        }
    }, [w3?.tokens, activeToken.key, account, activeToken.rel.volTokenKey])

    useEffect(() => {
        if ((!status || status === config.approveStatus.notApproved.key)  && w3) {
            getAllowance();
        }
    }, [w3, status, account, activeToken.key, activeToken.rel.volTokenKey, getAllowance])

    const onApprove = useCallback(async () => {
        setApproveProcessing(true);

        try {
            const baseToken = w3?.tokens[upperCase(activeToken.key)];
            const volToken = w3?.tokens[activeToken.rel.volTokenKey];

            const allowance = await baseToken.allowance(volToken.address, account);
            if (allowance > toBN(0)) return;

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet."
            }));

            await baseToken.approve(account, volToken.address);

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
    }, [w3, activeToken.key, activeToken.rel.volTokenKey, account, dispatch, isActiveInDOM])

    const onClick = useCallback(async () => {
        setSubmitProcessing(true);

        try {
            const totalRequestsAmount = await w3?.tokens[activeToken.rel.volTokenKey].getTotalRequestsAmount();
            const availableToOpen = await w3?.tokens[activeToken.rel.volTokenKey].maxSubmitMintAmount();
            const maxAvailableToOpen = availableToOpen < 0 ? totalRequestsAmount : totalRequestsAmount.add(availableToOpen);
            const availableBalanceWithTokenAmount = totalRequestsAmount.add(tokenAmount);

            if(availableToOpen <= 0) {
                return setErrorMessage(`The total pending mint requests amount can not exceed ${commaFormatted(toDisplayAmount(maxAvailableToOpen, activeToken.decimals))} ${upperCase(activeToken.name)} Please try again later`);
            } else if(availableBalanceWithTokenAmount.gt(maxAvailableToOpen)) {
                const amountToSelect = tokenAmount.sub(toBN(availableBalanceWithTokenAmount.sub(maxAvailableToOpen)));
                return setErrorMessage(`
                    The total pending mint requests amount can not exceed 
                    ${commaFormatted(toDisplayAmount(maxAvailableToOpen, activeToken.decimals))} ${upperCase(activeToken.name)} 
                    Please select an amount lower than ${commaFormatted(toDisplayAmount(amountToSelect, activeToken.decimals))} ${upperCase(activeToken.name)} 
                    or try again later`
                );
            }

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet."
            }));

            const mintResponse = await w3?.tokens[activeToken.rel.volTokenKey].submitMint(tokenAmount, {
                delay: delayFee.delayTime,
                keepers: true,
                slippage: Number(slippageTolerance),
                account 
            });
            
            if(mintResponse.event) {
                dispatch(setData("unfulfilledRequests", mintResponse.event, true, "requestId"));
            } else {
                actionConfirmEvent(dispatch);
            }

            dispatch(addAlert({
                id: 'mint',
                eventName: "Mint request - success",
                alertType: config.alerts.types.CONFIRMED,
                message: "Transaction success!"
            }));
        } catch (error) {
            console.log(error);
        
            dispatch(addAlert({
                id: 'mint',
                eventName: "Mint - failed",
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
    }, [account, activeToken.decimals, activeToken.name, activeToken.rel.volTokenKey, delayFee.delayTime, dispatch, isActiveInDOM, setAmount, setIsOpen, slippageTolerance, tokenAmount, updateAvailableBalance, w3?.tokens])

    return useMemo(() => {
        return  (
            <div className="mint-component">
                {appVersion === 'v2' && <> 
                    <Note title="Note:">A small keeper fee will be taken when you receive the tokens</Note> 
                    { status === config.approveStatus.notApproved.key && <Note title="Approve:">You only have to do this once per tokens</Note> }
                </>}

                {errorMessage && <ErrorModal error={errorMessage} setModalIsOpen={() => setErrorMessage(false)} /> }
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
                        className={`button ${(!status || status === config.approveStatus.alreadyApproved.key) && 'full'}`} 
                        buttonText={(!status || status === config.approveStatus.alreadyApproved.key) ? ((amount && amount !== "0") ? "SUBMIT" : 'ENTER AMOUNT') : ((amount && amount !== "0") ? "2. SUBMIT" : "2. ENTER AMOUNT") }
                        onClick={onClick}
                        disabled={disabled || delayFee === 'N/A' || !amount || amount === "0" || delayFee?.fee === null || !status || (appVersion === 'v2' && status === config.approveStatus.notApproved.key)}
                        processing={isSubmitProcessing || delayFee?.fee === null || amount === null}
                        processingText={!isSubmitProcessing && "Calculating"}
                    />}
                </div>
            </div>
        )
    }, [appVersion, errorMessage, status, activeToken.name, onApprove, isApproveProcessing, onClick, disabled, delayFee, amount, isSubmitProcessing])
}

export default SubmitMint;
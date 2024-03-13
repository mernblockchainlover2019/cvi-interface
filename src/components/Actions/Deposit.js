import Button from 'components/Elements/Button';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useActiveToken, useInDOM } from 'components/Hooks';
import { useActionController } from './ActionController';
import { useContext } from 'react';
import { contractsContext } from '../../contracts/ContractContext';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { actionConfirmEvent, maxUint256, toBN, toBNAmount } from '../../utils/index';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import config from '../../config/config';
import platformConfig from 'config/platformConfig';
import Contract from 'web3-eth-contract';
import { getTransactionType } from 'contracts/utils';
import { upperCase } from 'lodash';

const Deposit = () => {
    const dispatch = useDispatch(); 
    const isActiveInDOM = useInDOM();
    const { disabled, type, setIsOpen, token, amount, setAmount, cb: updateAvailableBalance } = useActionController();
    const { account, library } = useActiveWeb3React();
    const contracts = useContext(contractsContext);
    const activeToken = useActiveToken(token);
    const [isSubmitProcessing, setSubmitProcessing] = useState();
    const [isApproveProcessing, setApproveProcessing] = useState();
    const [status, setStatus] = useState();
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const { selectedNetwork } = useSelector(({app}) => app);
    
    const getContract = useCallback((contractKey) => {
        const contractsJSON = require(`../../contracts/files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
        const { abi, abiRef, address } = contractsJSON[contractKey];
        const _contract = new Contract(abi || contractsJSON[abiRef].abi, address);
        _contract.setProvider(library?.currentProvider);
        return _contract
    }, [library?.currentProvider, selectedNetwork])

    const allowance = useCallback(async (_account) => {
        const _contract = getContract(activeToken.rel.contractKey);
        return await _contract.methods.allowance(account, _account).call();
    }, [account, activeToken.rel.contractKey, getContract]);

    const hasAllowance = useCallback(async () => {
        if(!activeToken?.rel) return;
        const { _address } = contracts[activeToken.rel.platform];
        const approvalValue = await allowance(_address);
        const compareApprovalWithAmount = toBN(approvalValue).cmp(toBN(0));

        return compareApprovalWithAmount === 1;
    }, [activeToken, allowance, contracts])

    const approve = useCallback(async (_address) => {
        const _contract = getContract(activeToken.rel.contractKey);
        return await _contract.methods.approve(_address, maxUint256).send({from: account, ...getTransactionType(selectedNetwork)});
    }, [getContract, activeToken.rel.contractKey, account, selectedNetwork])
       
    const approvalValidation = useCallback(async () => {
        const isETH = token === 'eth';
        if(isETH) return true;
        const { _address } = contracts[activeToken.rel.platform];
        const approvalValue = await allowance(_address);
        const compareApprovalWithAmount = toBN(approvalValue).cmp(tokenAmount);
        if(compareApprovalWithAmount === -1){
            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet"
            }));
            const allowanceRes = await approve(_address);
            if(!allowanceRes.status) return false;
        }
        return true;
    }, [token, contracts, allowance, dispatch, approve, activeToken.rel.platform, tokenAmount])

    const deposit = async () => {
        const _contract = getContract(activeToken.rel.platform);
        if(activeToken.type === "eth") return await _contract.methods.depositETH(toBN('0')).send({ from: account, value: tokenAmount, ...getTransactionType(selectedNetwork) });
        return await _contract.methods.deposit(tokenAmount, toBN('0')).send({from: account, ...getTransactionType(selectedNetwork)});
    }

    const getAllowance = useCallback(async () => {
        try {
            const isAlreadyApproved = await hasAllowance();
            if (isAlreadyApproved) {
                setStatus(config.approveStatus.alreadyApproved.key);
            } else {
                setStatus(config.approveStatus.notApproved.key);
            }
        } catch(error) {
            console.log(error);
        }
    }, [hasAllowance])

    useEffect(() => {
        getAllowance();
    }, [token, type, getAllowance])

    const onApprove = useCallback(async () => {
        setApproveProcessing(true);

        try {
            const isAlreadyApproved = await hasAllowance();
            if (isAlreadyApproved) return;

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet."
            }));

            await approvalValidation();

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
    }, [dispatch, approvalValidation, hasAllowance, isActiveInDOM])

    const onClick = async () => {
        setSubmitProcessing(true);
        
        try {
            const isAlreadyApproved = await hasAllowance(token);
            if (!isAlreadyApproved) return;

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet"
            }));
            const res = await deposit();
            
            if(res.status) {
                dispatch(addAlert({
                    id: 'deposit',
                    eventName: "Deposit liquidity - success",
                    alertType: config.alerts.types.CONFIRMED,
                    message: "Transaction success!"
                }));

                actionConfirmEvent(dispatch);
            }
        } catch (error) {
            console.log(error);
            dispatch(addAlert({
                id: 'deposit',
                eventName: "Deposit liquidity - failed",
                alertType: config.alerts.types.FAILED,
                message: "Transaction failed!"
            }));
        } finally {
            if(isActiveInDOM()) {
                setSubmitProcessing(false);
                setAmount("");
                updateAvailableBalance();
                setIsOpen(false);
            }
        }
    }

    return (
        <> 
            <div className="deposit-component">
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
                        buttonText={status === config.approveStatus.alreadyApproved.key ? ((amount && amount !== "0") ? platformConfig.actionsConfig?.[type]?.key?.toUpperCase() : 'ENTER AMOUNT') : ((amount && amount !== "0") ? `2. ${platformConfig.actionsConfig?.[type]?.key?.toUpperCase()}` : "2. ENTER AMOUNT")}
                        onClick={onClick}
                        disabled={disabled || status === config.approveStatus.notApproved.key}
                        processing={isSubmitProcessing}
                        processingText={!isSubmitProcessing && amount > 0 && "Calculating"}
                    />}
                </div>
            </div>
        </>
    )
}

export default Deposit;
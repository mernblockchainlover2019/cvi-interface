import Button from 'components/Elements/Button';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useActiveToken, useActiveVolInfo, useInDOM } from 'components/Hooks';
import { useActionController } from './ActionController';
import { useContext } from 'react';
import { contractsContext } from './../../contracts/ContractContext';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { useWeb3Api } from './../../contracts/useWeb3Api';
import { actionConfirmEvent, commaFormatted, maxUint256, toBN, toBNAmount, toDisplayAmount } from './../../utils/index';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import config from './../../config/config';
import platformConfig from 'config/platformConfig';
import ErrorModal from 'components/Modals/ErrorModal';
import Contract from 'web3-eth-contract';
import { useWeb3React } from '@web3-react/core';
import { upperCase } from 'lodash';
import { fromUnitsToTokenAmount, getTransactionType } from 'contracts/utils';

const feesHighWarningMessage = "This transaction will not succeed due to the change in the purchase fee premium. Try increasing your slippage tolerance.";

const Buy = () => {
    const dispatch = useDispatch();
    const isActiveInDOM = useInDOM();
    const { disabled, type, token, setIsOpen, amount, setAmount, leverage = 1, cb: updateAvailableBalance, slippageTolerance } = useActionController();
    const { library } = useWeb3React(config.web3ProviderId);
    const { account, library: web3 } = useActiveWeb3React();
    const [modalIsOpen, setModalIsOpen] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const contracts = useContext(contractsContext);
    const activeToken = useActiveToken(token);
    const [isSubmitProcessing, setSubmitProcessing] = useState();
    const [isApproveProcessing, setApproveProcessing] = useState();
    const [status, setStatus] = useState();
    const { selectedNetwork } = useSelector(({app}) => app);
    const activeVolInfo = useActiveVolInfo(activeToken.oracleId);
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const purchaseFeePayload = useMemo(() => ({ tokenAmount,leverage } ), [tokenAmount, leverage]);
    const [purchaseFee, getPurchaseFees] = useWeb3Api("getOpenPositionFee", token, purchaseFeePayload, { validAmount: true});
    const [collateralRatioData] = useWeb3Api("getCollateralRatio", token);
    
    const getContract = useCallback((contractKey) => {
        const contractsJSON = require(`../../contracts/files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
        const { abi, abiRef, address } = contractsJSON[contractKey];
        const _contract = new Contract(abi || contractsJSON[abiRef].abi, address);
        _contract.setProvider(web3?.currentProvider);
        return _contract
    }, [web3?.currentProvider, selectedNetwork])

    const allowance = useCallback(async (_account) => {
        const _contract = getContract(activeToken.rel.contractKey);
        return await _contract.methods.allowance(account, _account).call()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, activeToken.rel.contractKey]);

    const hasAllowance = useCallback(async () => {
        const { _address } = contracts[activeToken.rel.platform];
        const approvalValue = await allowance(_address);
        const compareApprovalWithAmount = toBN(approvalValue).cmp(toBN(0));

        return compareApprovalWithAmount === 1;
    }, [activeToken, allowance, contracts])

    const approve = useCallback(async (_address) => {
        const _contract = getContract(activeToken.rel.contractKey);
        return await _contract.methods.approve(_address, maxUint256).send({from: account, ...getTransactionType(selectedNetwork)});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, activeToken.rel.contractKey]);
    
    const approvalValidation = useCallback(async () => {
        const isETH = token === 'eth';
        if(isETH) return true;
        const { _address } = contracts[activeToken.rel.platform];
        const approvalValue = await allowance(_address);
        const compareApprovalWithAmount = toBN(approvalValue).cmp(tokenAmount);
        if(compareApprovalWithAmount === -1){
            const allowanceRes = await approve(_address);
            if(!allowanceRes.status) return false;
        }
        return true;
    }, [activeToken, contracts, token, tokenAmount, approve, allowance]);

    const toggleModal = async(flag) => {
        setModalIsOpen(flag);
    }

    const getMaxAmount = useCallback(async (index) => {
        let totalBalance = toBN(
            token === 'eth' ? await library.eth.getBalance(contracts[activeToken.rel.platform]._address) : 
            (token === "usdc" || activeToken.type === 'v3') ? await toBN(await contracts[activeToken.rel.platform].methods.totalLeveragedTokensAmount().call()) :
            await contracts[activeToken.rel.contractKey].methods.balanceOf(contracts[activeToken.rel.platform]._address).call()
        )
        let totalUnits = await contracts[activeToken.rel.platform].methods.totalPositionUnitsAmount().call();
        return fromUnitsToTokenAmount(totalBalance.sub(toBN(totalUnits)), index, config.oraclesData[activeToken.oracleId].maxIndex).div(toBN(leverage));
    }, [library?.eth, activeToken, contracts, token, leverage]);

    const getMaxAvailableToOpen = useCallback(async () => {
        try {
            const index = toBNAmount(activeVolInfo?.index, 2);
            let totalToOpen = await getMaxAmount(index);
            return [totalToOpen.cmp(toBN(toBNAmount(amount, activeToken.decimals))) > -1, toDisplayAmount(totalToOpen.toString(), activeToken.decimals)];
        } catch(error) {
            console.log(error);
        }
    }, [activeVolInfo, activeToken, amount, getMaxAmount]);

    const openFeeWithSlippageIsValid = useCallback(async () => {
        let fees = await getPurchaseFees(); // new fees data
        if(fees === "N/A" || purchaseFee === "N/A") return;
        const slippageBnValue = toBN(String(slippageTolerance * 100)); // selected slippage as big number
        const newBuyingPremiumFeeBn = toBN(fees.buyingPremiumFeePercent); // new buying premium fee (when click on buy)
        const oldBuyingPremiumFee = toBN(purchaseFee.buyingPremiumFeePercent); // buying premium fee on input change 
        const buyingPremiumFeeDiff = newBuyingPremiumFeeBn.sub(oldBuyingPremiumFee); // diff between new fee and old fee 
        return slippageBnValue.gt(buyingPremiumFeeDiff); // is valid = slippage is bigger than buying premium fee diff.
        
    }, [getPurchaseFees, purchaseFee, slippageTolerance]);

    const buy = useCallback(async () => {
        const _contract = getContract(activeToken.rel.platform);
        const _leverage = !leverage ? "1" : leverage;
        const _feesWithSlippage = toBN(purchaseFee?.buyingPremiumFeePercent || "0").add(toBN(String((slippageTolerance * 100) || "0")));

        const maxIndexValue = config.oraclesData[activeToken.oracleId].maxIndex;
        if (activeToken.type === "eth") {
            return await _contract.methods.openPositionETH(maxIndexValue, _feesWithSlippage, _leverage).send({ from: account, value: tokenAmount.toString(), ...getTransactionType(selectedNetwork) });
        } else if (activeToken.type === "v2" || activeToken.type === "usdc" || activeToken.type === "v3") {
            return await _contract.methods.openPosition(tokenAmount, maxIndexValue, _feesWithSlippage, _leverage).send({ from: account, ...getTransactionType(selectedNetwork) });
        } else {
            return await _contract.methods.openPosition(tokenAmount, maxIndexValue).send({ from: account, ...getTransactionType(selectedNetwork) });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeToken, leverage, purchaseFee, account, tokenAmount])

    const getAllowance = useCallback(async () => {
        const isAlreadyApproved = await hasAllowance();
        if (isAlreadyApproved) {
            setStatus(config.approveStatus.alreadyApproved.key);
        } else {
            setStatus(config.approveStatus.notApproved.key);
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

    const onClick = useCallback(async () => {
        const [allowToBuy, totalToOpen] = await getMaxAvailableToOpen();
        if(!allowToBuy) {
            if(isActiveInDOM()) {
                setModalIsOpen(true);
                setErrorMessage(`There is not enough available liquidity to cover your position. Please select an amount lower than ${commaFormatted(totalToOpen)} ${activeToken.name.toUpperCase()} or try again later.`)
            }
            return;
        }

        const openFeeIsValid = await openFeeWithSlippageIsValid();

        if(!openFeeIsValid) {
            setModalIsOpen(true);
            setErrorMessage(feesHighWarningMessage);
            setAmount("");
            return;
        }

        setSubmitProcessing(true);

        try {
            const isAlreadyApproved = await hasAllowance(token);
            if (!isAlreadyApproved) return;

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet."
            }));
            const res = await buy();
                
            if(res.status) {
                dispatch(addAlert({
                    id: 'openPosition',
                    eventName: "Buy position - success",
                    alertType: config.alerts.types.CONFIRMED,
                    message: "Transaction success!"
                }));

                actionConfirmEvent(dispatch);
            }
        } catch (error) {
            console.log(error);
            if(error?.message.toLowerCase().search('revert not enough liquidity') !== -1) {
                if(isActiveInDOM()) { 
                    setModalIsOpen(true);
                    setErrorMessage("There is not enough available liquidity to cover your position. Please buy a lower amount or try again later.")
                }
            }
            else if(error?.message.toLowerCase().search('premium fee too high') !== -1) {
                setModalIsOpen(true);
                setErrorMessage("The transaction has failed due to the change in the purchase fee.")
            } 
            else {
                dispatch(addAlert({
                    id: 'openPosition',
                    eventName: "Buy position - failed",
                    alertType: config.alerts.types.FAILED,
                    message: "Transaction failed!"
                }));
            }
        } finally {
            if(isActiveInDOM()) {
                setSubmitProcessing(false);
                setAmount("");
                updateAvailableBalance();
                setIsOpen(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [approvalValidation, buy, dispatch, openFeeWithSlippageIsValid, hasAllowance, getMaxAvailableToOpen, isActiveInDOM, setAmount, token, updateAvailableBalance])

    return useMemo(() => {
        return  (
            <> 
                {modalIsOpen && <ErrorModal
                    error={errorMessage}
                    setModalIsOpen={toggleModal}
                    isWarning={errorMessage === feesHighWarningMessage}
                />}
                
                <div className="buy-component">
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
                            disabled={disabled || purchaseFee === "N/A" || purchaseFee === null || collateralRatioData === null || collateralRatioData === "N/A" || status === config.approveStatus.notApproved.key}
                            processing={isSubmitProcessing || purchaseFee === null}
                            processingText={!isSubmitProcessing && amount > 0 && purchaseFee === null && "Calculating"}
                        />}
                    </div>
                </div>
            </>
        )
    }, [amount, collateralRatioData, disabled, errorMessage, activeToken, onApprove, status, isApproveProcessing, isSubmitProcessing, modalIsOpen, onClick, purchaseFee, type])
}

export default Buy;
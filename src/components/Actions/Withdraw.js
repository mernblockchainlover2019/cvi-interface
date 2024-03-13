import Button from 'components/Elements/Button';
import { useMemo, useState } from 'react';
import { useActiveToken, useActiveVolInfo, useInDOM } from 'components/Hooks';
import { useActionController } from './ActionController';
import { useContext } from 'react';
import { contractsContext } from '../../contracts/ContractContext';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { actionConfirmEvent, commaFormatted, maxUint256, toBN, toBNAmount, toDisplayAmount } from '../../utils/index';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import config from '../../config/config';
import CountdownComponent, { useIsLockedTime } from 'components/Countdown/Countdown';
import ErrorModal from 'components/Modals/ErrorModal';
import WithdrawInfo from 'components/pages/Platform/Info/WithdrawInfo';
import Contract from 'web3-eth-contract';
import { useWeb3React } from '@web3-react/core';
import { fromUnitsToTokenAmount, getTransactionType } from 'contracts/utils';

const Withdraw = () => {
    const dispatch = useDispatch(); 
    const isActiveInDOM = useInDOM();
    const { library } = useWeb3React(config.web3ProviderId);
    const { library: web3, account } = useActiveWeb3React();
    const { isOpen, setIsOpen, isModal, disabled, token, amount, setAmount, balances } = useActionController();
    const contracts = useContext(contractsContext);
    const activeToken = useActiveToken(token);
    const [isProcessing, setProcessing] = useState();
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const lockedTime = useIsLockedTime();
    const [errorMessage, setErrorMessage] = useState();
    const activeVolInfo = useActiveVolInfo(activeToken.oracleId);
    const { selectedNetwork } = useSelector(({app}) => app);
    
    const getContract = (contractKey) => {
        const contractsJSON = require(`../../contracts/files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
        const { abi, abiRef, address } = contractsJSON[contractKey];
        const _contract = new Contract(abi || contractsJSON[abiRef].abi, address);
        _contract.setProvider(web3?.currentProvider);
        return _contract
    }

    const getMaxAmount = async (index) => {
        let totalBalance = toBN(
            activeToken.key === 'eth' ? await library.eth.getBalance(contracts[activeToken.rel.platform]._address) : 
            activeToken.type === "v3" ? await toBN(await contracts[activeToken.rel.platform].methods.totalLeveragedTokensAmount().call()) :
            await contracts[activeToken.rel.contractKey].methods.balanceOf(contracts[activeToken.rel.platform]._address).call()
        )
        let totalUnits = await contracts[activeToken.rel.platform].methods.totalPositionUnitsAmount().call();
        return fromUnitsToTokenAmount(totalBalance.sub(toBN(totalUnits)), index, config.oraclesData[activeToken.oracleId].maxIndex);
    }

    const getMaxAvailableToWithdraw = async () => {
        try {
            const index = toBNAmount(activeVolInfo?.index, 2);
            let totalToWithdraw = await getMaxAmount(index);
            return [toBN(toBNAmount(amount, activeToken.decimals)).cmp(totalToWithdraw) < 1, toDisplayAmount(totalToWithdraw.toString(), activeToken.decimals)]
        } catch(error) {
            console.log(error);
        }
    }

    const withdraw = async () => {
        const _contract = getContract(activeToken.rel.platform);
   
        if(tokenAmount.eq(toBN(balances.tokenAmount))) { 
            const lpBalance = toBN(await contracts[activeToken.rel.platform].methods.balanceOf(account).call());
            return await _contract.methods.withdrawLPTokens(lpBalance).send({from: account, ...getTransactionType(selectedNetwork)}); // withdraw all - only use for better accurate calculation.
        }

        await _contract.methods.withdraw(tokenAmount, maxUint256).send({from: account, ...getTransactionType(selectedNetwork)}); // withdraw part of the position
    }

    const onClick = async () => {
        if(!isOpen) return setIsOpen(true);
        
        setProcessing(true);
        
        try {
            const [allowToWithdraw, max_amount] = await getMaxAvailableToWithdraw();
            
            if(!allowToWithdraw) {
                setErrorMessage(`Part of the liquidity you've provided is used as collateral and can't be currently withdrawn. Please select an amount less than ${commaFormatted(max_amount)} ${activeToken.name.toUpperCase()} or try again later.`)
                return;
            }

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet"
            }));

            await withdraw();

            dispatch(addAlert({
                id: 'withdraw',
                eventName: "Withdraw liquidity - success",
                alertType: config.alerts.types.CONFIRMED,
                message: "Transaction success!"
            }));

            actionConfirmEvent(dispatch);

            setIsOpen(false);

        } catch (error) {
            console.log(error);
            if(error?.message.toLowerCase().search('revert collateral ratio broken') !== -1) {
                setErrorMessage("Part of the liquidity you've provided is used as collateral and can't be currently withdrawn. Please select a lower amount or try again later.")
            } else {
                dispatch(addAlert({
                    id: 'withdraw',
                    eventName: "Withdraw liquidity - failed",
                    alertType: config.alerts.types.FAILED,
                    message: "Transaction failed!"
                }));

                setIsOpen(false);
            }
        } finally {
            if(isActiveInDOM()) {
                setProcessing(false);
                setAmount("");
            }
        }
    }
    
    return (
        <> 
            {errorMessage && <ErrorModal error={errorMessage} setModalIsOpen={setErrorMessage}/>}
            <div className="withdraw-component">
                <div className="withdraw-component__container">
                    {(isOpen && !isModal) && <WithdrawInfo />}
                    {(!isOpen && isModal) && <CountdownComponent lockedTime={lockedTime} /> }
                    <Button 
                        className="withdraw-component__container--button"
                        buttonText="Withdraw" 
                        onClick={onClick}
                        processing={isProcessing}
                        disabled={(isOpen && !isModal && (disabled || tokenAmount?.isZero())) || (lockedTime > 0 || lockedTime === null)}
                    />
                </div>
            </div>
        </>
    )
}

export default Withdraw;
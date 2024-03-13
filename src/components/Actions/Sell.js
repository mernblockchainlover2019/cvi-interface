import Button from 'components/Elements/Button';
import { useCallback, useMemo, useState } from 'react';
import { useActiveToken, useInDOM } from 'components/Hooks';
import { useActionController } from './ActionController';
import { useContext } from 'react';
import { contractsContext } from '../../contracts/ContractContext';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import { actionConfirmEvent, toBN, toBNAmount } from '../../utils/index';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import config from '../../config/config';
import SellInfo from 'components/pages/Platform/Info/SellInfo';
import { getClosingPremiumFee } from 'contracts/apis/position';
import CountdownComponent, { useIsLockedTime } from 'components/Countdown/Countdown';
import web3Api, { getTokenData } from 'contracts/web3Api';
import SellAllModal from './SellAllModal.js';
import { useWeb3Api } from 'contracts/useWeb3Api';
import ErrorModal from 'components/Modals/ErrorModal';
import Contract from 'web3-eth-contract';
import { getTransactionType } from 'contracts/utils';

const feesChangedWarning = "This transaction will not succeed due to the change in the sell fee premium. Try increasing your slippage tolerance.";

const Sell = () => {
    const dispatch = useDispatch(); 
    const isActiveInDOM = useInDOM();
    const { isOpen, setIsOpen, isModal, disabled, leverage, token, amount, setAmount, balances, slippageTolerance} = useActionController(); 
    const { account, library } = useActiveWeb3React();
    const contracts = useContext(contractsContext);
    const activeToken = useActiveToken(token);
    const [isProcessing, setProcessing] = useState();
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const lockedTime = useIsLockedTime();
    const [sellAllModal, setSellAllModal] = useState(false);
    const sellFeePayload = useMemo(() => ({ tokenAmount, account, leverage } ), [tokenAmount, account, leverage]);
    const [sellFee, updateSellFee] = useWeb3Api("getClosePositionFee", token, sellFeePayload, { validAmount: true});
    const [modalIsOpen, setModalIsOpen] = useState();
    const { selectedNetwork } = useSelector(({app}) => app);

    const getContract = (contractKey) => {
        const contractsJSON = require(`../../contracts/files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
        const { abi, abiRef, address } = contractsJSON[contractKey];
        const _contract = new Contract(abi || contractsJSON[abiRef].abi, address);
        _contract.setProvider(library?.currentProvider);
        return _contract
    }
    
    const sell = async () => {
        try {
            const { positionUnitsAmount } = await contracts[activeToken.rel.platform].methods.positions(account).call();
            const { getCVILatestRoundData } = contracts[activeToken.rel.oracle].methods;
            const { cviValue } = await getCVILatestRoundData().call();
            let positionUnitsToClose;
            
            if(!toBN(balances.tokenAmount).cmp(tokenAmount)) {
                positionUnitsToClose = toBN(balances.posUnitsAmount);
            };
            
            positionUnitsToClose = !positionUnitsToClose ? tokenAmount.mul(toBN(leverage)).mul(toBN(config.oraclesData[activeToken.oracleId].maxIndex)).div(toBN(cviValue)) : toBN(positionUnitsAmount);

            const _contract = getContract(activeToken.rel.platform);
            
            if(activeToken.type === "v3" || activeToken.type === "usdc") {
                const tokenData = await getTokenData(contracts[activeToken.rel.contractKey]);
                const closingPremiumFee = await getClosingPremiumFee(contracts, activeToken, { tokenAmount, cviValue, leverage, tokenData, library});
                const _feesWithSlippage =  String(Number(closingPremiumFee || 0) + Number((slippageTolerance * 100) || 0));
                await _contract.methods.closePosition(positionUnitsToClose, toBN('1'), toBN(_feesWithSlippage)).send({from: account, ...getTransactionType(selectedNetwork)});
            } else {
                await _contract.methods.closePosition(positionUnitsToClose, toBN('1')).send({from: account, ...getTransactionType(selectedNetwork)});
            }
 
            dispatch(addAlert({
                id: 'closePositionSuccess',
                eventName: "Sell position - success",
                alertType: config.alerts.types.CONFIRMED,
                message: "Transaction success!"
            }));
        } catch(error) {
            console.log(error);
            dispatch(addAlert({
                id: 'closePositionFailed',
                eventName: "Sell position - failed",
                alertType: config.alerts.types.FAILED,
                message: "Transaction failed!"
            }));
        }
    }

    const sellFeeWithSlippageIsValid = useCallback(async () => {
        let fees = await updateSellFee(); // new fees data
        if(fees === "N/A" || sellFee === "N/A") return;
        const slippageBnValue = toBN(String(slippageTolerance * 100)); // selected slippage as big number
        const newSellPremiumFeeBn = toBN(fees.closePremiumFeePercent); // new buying premium fee (when click on buy)
        const oldSellPremiumFee = toBN(sellFee.closePremiumFeePercent); // buying premium fee on input change 
        const sellPremiumFeeDiff = newSellPremiumFeeBn.sub(oldSellPremiumFee); // diff between new fee and old fee 
        return slippageBnValue.gt(sellPremiumFeeDiff); // is valid = slippage is bigger than buying premium fee diff.
    }, [sellFee, slippageTolerance, updateSellFee]);

    const onClick = async () => {
        if(!isOpen && !sellAllModal) {
            const [claimRewardData] = await web3Api.getClaimableReward(contracts, activeToken, { account });
            if(toBN(claimRewardData)?.gt(toBN("0"))) return setSellAllModal(true);

            return setIsOpen(true);
        }
        setProcessing(true);
        
        try {
            const sellFeeIsValid = await sellFeeWithSlippageIsValid();
            if(!sellFeeIsValid) {
                setAmount("");
                return setModalIsOpen(true);
            }

            dispatch(addAlert({
                id: 'notice',
                alertType: config.alerts.types.NOTICE,
                message: "Please confirm the transaction in your wallet"
            }));

            await sell();

            if(isActiveInDOM()) {
                if(sellAllModal) setSellAllModal(false);
                setIsOpen(false);
                setAmount("");
                actionConfirmEvent(dispatch);
            }

        } catch (error) {
            console.log(error);
            if(isActiveInDOM()) {
                setAmount("");
                setIsOpen(false);
            }
            
            dispatch(addAlert({
                id: 'closePositionFailed',
                eventName: "Sell position - failed",
                alertType: config.alerts.types.FAILED,
                message: "Transaction failed!"
            }));
        } finally {
            if(isActiveInDOM()) {
                setProcessing(false);
            }
        }
    }

    return <> 
        {sellAllModal && <SellAllModal isProcessing={isProcessing} onSubmit={() => setIsOpen(true)} setSellAllModal={setSellAllModal} />}
        {modalIsOpen && <ErrorModal error={feesChangedWarning} setModalIsOpen={() => setModalIsOpen(false)} isWarning /> }

        <div className="sell-component">
            <div className="sell-component__container">
                {(isOpen && !isModal) && <SellInfo sellFee={sellFee === null ? null : sellFee === 'N/A' ? 'N/A' : sellFee?.closeFeeAmount || "0"} />}
                {(!isOpen && isModal) && <CountdownComponent lockedTime={lockedTime} /> }
                <Button 
                    className="sell-component__container--button" 
                    buttonText="Sell" 
                    onClick={onClick}
                    processing={isProcessing || sellFee === null}
                    processingText={amount > 0 && sellFee === null && "Calculating"}
                    disabled={(isOpen && (disabled || tokenAmount?.isZero())) || lockedTime > 0 || lockedTime === null}
                />
            </div>
        </div>
    </>
}

export default Sell;
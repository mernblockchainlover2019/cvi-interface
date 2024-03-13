import React, { useEffect, useMemo } from 'react'
import { commaFormatted, customFixed, customFixedTokenValue, isGoviToken, toBN, toBNAmount } from 'utils';
import Button from 'components/Elements/Button';
import Input from 'components/Elements/Input';
import config from 'config/config';
import InputGroup from 'components/InputGroup';
import { useActiveToken } from 'components/Hooks';
import Spinner from 'components/Spinner/Spinner';
import './InputAmount.scss';

const InputAmount = ({
    label = "Amount", 
    breakLine, 
    amount = "", 
    setAmount, 
    symbol, 
    availableText = "Your available balance:", 
    setInsufficientBalance, 
    error,
    availableBalance,
    view,
    protocol,
    type
}) => {
    const activeToken = useActiveToken(view === config.routes.arbitrage.path ? type : symbol, view, protocol); 
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const availableBalanceAmount = useMemo(() => customFixedTokenValue(availableBalance, activeToken.decimals, activeToken.decimals), [activeToken, availableBalance]);
    const insufficientBalance = useMemo(() => tokenAmount.gt(toBN(availableBalance)), [tokenAmount, availableBalance]);
    const symbolName = useMemo(() => isGoviToken(symbol) ? 'govi' : symbol, [symbol]);

    useEffect(() => {
        setInsufficientBalance(insufficientBalance);
        //eslint-disable-next-line
    }, [insufficientBalance]);

    useEffect(() => {
        setAmount("");
        //eslint-disable-next-line
    }, [symbol])

    const _onChangeNumber = (value) => {
        if(value?.split && value?.split('.')?.length > 0 && value?.split('.')?.[1]?.length > activeToken.decimals) return;
        if(Number(value) > 999999999999) return;

        if (value?.match && value.match(/[+-]?([0-9]*[.])?[0-9]+/) && !isNaN(value)) {
            setAmount(value);
        }

        if(!value.length) {
            setAmount('');
        }
    }

    const mapSymbol = () => {
        if(!breakLine) return activeToken?.name || symbolName;
        const [from, to] = symbolName.split('-');
        return from && to ? <>
            <span>{
                from === config.pages.home.sections.getCviTokens.info.rhegic2.toLowerCase() ? 
                    config.pages.home.sections.getCviTokens.info.rhegic2 
                    : from}</span><span>{to.toUpperCase()}
            </span>
            </> : <span>{symbolName}</span>
    }

    return (
        <InputGroup className={`amount-component__group ${(error || insufficientBalance) ? 'error' : ''}`} label={label}>
            <div className="amount-component__group__input-container">
                <Input
                    className="amount-component__group__amount" 
                    type="text" 
                    placeholder="Enter amount"
                    value={amount} 
                    onChange={({target: { value }}) => _onChangeNumber(value)}
                />
                
                <div className="amount-component__group__container">
                    <Button className="amount-component__group__container--max" buttonText="Max" onClick={() => _onChangeNumber(String(availableBalanceAmount))}/>
                    <span className={`amount-component__group__container--currency ${activeToken.name || symbolName}`}>{mapSymbol()}</span>
                </div>
            </div>
            {availableBalance !== "N/A" && <>
                <span className="amount-component__group__balance">
                    <span>{availableText} {availableBalance === null ? <>&nbsp; <Spinner className="statistics-spinner" /></> : <b>
                        &nbsp;<span> {commaFormatted(availableBalanceAmount ? customFixed(availableBalanceAmount, activeToken.fixedDecimals) : "0")} </span>
                        &nbsp;{symbolName === 'rhegic2-eth' ? <span style={{textTransform: 'none'}}>rHEGIC2-ETH</span> : activeToken.name || symbolName}
                    </b> }</span> 
                </span>
            </> }
        </InputGroup>
    )
}

export default InputAmount;
import React, { useEffect } from 'react';
import Button from '../Elements/Button';
import { useLocation } from 'react-router';
import platformConfig from 'config/platformConfig';
import { useSelector } from 'react-redux';
import './CurrencySelect.scss';

const CurrencySelect = ({selectedCurrency, setSelectedCurrency, activeVolIndex}) => {
    const location = useLocation();
    const { selectedNetwork } = useSelector(({app}) => app);
    const tokens = platformConfig.tokens[selectedNetwork];
    const filteredTokens = Object.values(tokens).filter(({key}) => {
        if(tokens[key]?.migrated) return false;
        return !activeVolIndex || tokens[key]?.oracleId === activeVolIndex;
    })
    
    useEffect(() => {
        const getCurrencyQuery = new URLSearchParams(location?.search).get('currency');
        if(getCurrencyQuery) {
            const currenctCurrency = filteredTokens[getCurrencyQuery];
            if(!currenctCurrency || currenctCurrency?.soon) return;
            setSelectedCurrency(currenctCurrency.key);
        }
        //eslint-disable-next-line
    }, [location?.search]);

    useEffect(() => {
        if(!filteredTokens.find(token => token.key === selectedCurrency)) {
            setSelectedCurrency(filteredTokens?.[0]?.key);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVolIndex]);

    return (
        <div className="currency-select-component">
            <h2 className="currency-select-component__title">Select currency</h2>
            <div className="currency-select-component__container">
                {filteredTokens
                .map(token => 
                    <Currency 
                        key={token.key} 
                        state={selectedCurrency === token.key ? 'selected' : ''} 
                        soon={token.soon} 
                        name={token.name?.toUpperCase()} 
                        symbol={token.key} 
                        setSelectedCurrency={setSelectedCurrency}
                />)}
            </div>
        </div>
    )
}

const Currency = ({ name, symbol, state = '', soon, setSelectedCurrency}) => {
    return (
        <div id={symbol} className={`currency-component ${state} ${soon ? 'coming-soon' : ''}`}>
            <Button className="currency-component__button" disabled={soon} onClick={() => setSelectedCurrency(symbol)}>
                {soon && <span className="coming-soon__text">Coming soon</span>}
                <img className="currency-component__image" src={require(`../../images/coins/${state && `${state}-`}${symbol}.svg`).default} alt="currency" />
            </Button>
            <span className="currency-component__name">{name}</span>
        </div>
    )
}

export default CurrencySelect;

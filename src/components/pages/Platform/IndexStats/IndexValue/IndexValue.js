import { useActiveVolInfo } from 'components/Hooks';
import Spinner from 'components/Spinner/Spinner';
import config from 'config/config';
import React, { useMemo } from 'react'
import './IndexValue.scss';

const IndexValue = ({type, activeIndex = "cvi", header}) => {
    const activeVolInfo = useActiveVolInfo(activeIndex);
    const isPositive = activeVolInfo?.oneDayChange > 0;

    return (
        <div className="index-value-component">
            {activeVolInfo?.key ? <> 
                {header && <h2 className="index-value-component__header">{header}</h2> }
                <div className="index-value-component__top">
                    {!header && activeVolInfo && <span className="index-value-component__top--title">
                        <CviTitle type={type} activeVol={activeVolInfo?.key} />
                    </span> }
                    <b className="index-value-component__top--value">{activeVolInfo?.index}</b>
                    <div className={`index-value-component__top--info ${isPositive ? 'high' : 'low'}`}>
                        <span>{activeVolInfo?.oneDayChange}</span> 
                        <span>({`${isPositive ? '+' : ''}`}{activeVolInfo?.oneDayChangePercent}%)</span>
                        <img src={require(`images/icons/${isPositive ? 'up-arrow' : 'down-arrow'}.svg`).default} alt="arrow" />
                    </div>
                </div>
            </> : <> 
                <div className="index-value-component__top index-value-spinner-container"> 
                    {type === 'home' && <span className="index-value-component__top--title">
                        <CviTitle type={type} activeVol={activeIndex} /> 
                    </span> }
                    <Spinner className="statistics-spinner"/>
                </div>
            </>}
        </div>
    )
}

const CviTitle = ({type, activeVol = "cvi"}) => {
    return useMemo(() => {
        return type === "home" ? 
            <span className="index-value-component--cvi-title stat-component">
                <h2>Index</h2>
                {config.volatilityLabel[activeVol]}
            </span> : config.volatilityLabel[activeVol]
    }, [activeVol, type]);
}

export default IndexValue;
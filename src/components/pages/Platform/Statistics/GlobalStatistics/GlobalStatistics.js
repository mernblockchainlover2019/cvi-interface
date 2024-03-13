import { useIsTablet } from 'components/Hooks';
import Container from 'components/Layout/Container';
import Stat from 'components/Stat';
import React from 'react'
import { useSelector } from 'react-redux';
import { customFixed, toDisplayAmount } from 'utils';
import './GlobalStatistics.scss';

const GlobalStatistics = ({platformBalance, platformBalanceReduced, goviPrice, feesCollected}) => {
    const { selectedNetwork } = useSelector(({app}) => app);
    const isTablet = useIsTablet();

    return <Container className="global-stats-container">
        <div key={selectedNetwork} className="statistics-component">
            <div className="statistics-component__container">
                <Stat 
                    name="totalValueLocked" 
                    value={platformBalance === "N/A" ? "N/A" : platformBalanceReduced || null}
                    format={customFixed(toDisplayAmount(platformBalanceReduced, 6), 2)}
                />

                <Stat 
                    name="goviPrice" 
                    value={goviPrice} 
                    format={customFixed(goviPrice, 2)}
                />

                {!isTablet && <div className="statistics-component__container--breaker"></div> }

                <Stat name="feesCollected" value={feesCollected} />
            </div>
        </div>
    </Container>
}

export default GlobalStatistics;


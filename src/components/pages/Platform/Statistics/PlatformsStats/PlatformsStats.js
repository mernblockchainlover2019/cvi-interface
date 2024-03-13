import Container from 'components/Layout/Container';
import DataController from 'components/Tables/DataController';
import Table from 'components/Tables/Table';
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import './PlatformsStats.scss';
import { arrayIsLoaded, commaFormatted } from '../../../../../utils';
import commonApi from '../../../../../contracts/commonApi';
import { isEmpty } from 'lodash';
import { useIsMobile } from 'components/Hooks';
import platformConfig from 'config/platformConfig';


const PlatformsStats = ({liquidityPools, platformBalance}) => {
    const { selectedNetwork } = useSelector(({app}) => app);
    const isMobile = useIsMobile();
    
    return useMemo(() => {
        const initialPlatformStatsData = [{
            index: null,
            liquidityPools: null,
            openPositions: null,
        }];
        
        const _openPositions = () => {
            if(!liquidityPools || !platformBalance) return null;
            if(liquidityPools === "N/A" || platformBalance === "N/A") return "N/A";
            const liquidityPoolsMapped = liquidityPools.map(pool => [pool[2], pool[3]]) // example: ['usdc', 'cvi'];
            const findPlatform = (tokenName, oracleId) => platformBalance.find(platformData => platformData[2] === tokenName && platformData[3] === oracleId) /* example for platformData ['pool size', BN, 'usdc', 'cvi']*/
            return liquidityPoolsMapped?.map((item, index) => {
                const platformData = findPlatform(item[0], item[1]);
                if(!platformData) return ["N/A", "N/A"]
                return [
                    `${commaFormatted(commonApi.getTradersPoolSize(platformData[1], liquidityPools[index][1]))} (${platformData[2]?.toUpperCase()} pool)`,
                    liquidityPools[index][3]
                ];
            })
        }
        const openPositions = _openPositions(); // calculate open positions for active tokens
        const liquidityPoolsLoaded = arrayIsLoaded(liquidityPools);
        const openPositionsLoaded = arrayIsLoaded(openPositions);
        const activeOracles = liquidityPoolsLoaded.reduce((current, item) => ({...current, [item[3]]: item[3]}), {});
     
        const rowData = Object.values(activeOracles).map(oracle => ({ // map row data by oracle.
            index: oracle.toUpperCase(), // oracle to index display name
            liquidityPools: liquidityPoolsLoaded.filter(pool => pool !== "N/A" && pool[3] === oracle), // filter by oracle
            openPositions: openPositionsLoaded.filter(pool => pool !== "N/A" && pool[1] === oracle), // filter by oracle
        }));

        return <Container className="platform-stats-container">
            <div key={selectedNetwork} className="statistics-component">
                <DataController 
                    customTableHeaders={isMobile ? [] : Object.values(platformConfig.headers.stats)}
                    activeTab="stats" 
                    data={isEmpty(rowData) ? initialPlatformStatsData : rowData}
                >
                    <Table />
                </DataController>
            </div>
            
        </Container>
    }, [isMobile, liquidityPools, platformBalance, selectedNetwork])
}

export default PlatformsStats;
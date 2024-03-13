import DataController from 'components/Tables/DataController';
import React, { lazy, Suspense, useMemo } from 'react'
import { useSelector } from 'react-redux';
import Stat from 'components/Stat';
import IndexValue from './IndexValue';
import { useIsMobile } from 'components/Hooks';
import config from 'config/config';
import platformConfig from 'config/platformConfig';
import './IndexStats.scss';
const Table = lazy(() => import('components/Tables/Table'));

const IndexStats = ({type}) => {
    return useMemo(() => {
        return (
            <div key={type} className={`index-stats-component ${type === 'home' ? 'cvi-stats-component' : ''}`}>
                <div className={`index-stats-component__container ${type === 'home' ? 'cvi-stats-component__container' : ''}`}>
                    {type === "home" ? 
                        <HomeDefaultIndex type={type} /> : 
                        <IndexsTable />
                    }
                </div>  
            </div>
        )
    }, [type]) 
}

const HomeDefaultIndex = ({type}) => {
    const { cvi } = useSelector(({app}) => app.indexInfo);
    return useMemo(() => {
        return  <> 
            <IndexValue type={type} />
            <Stat title="Previous hour" value={cvi?.oneHourAgo} />
            <Stat prefix="" className="green" title="Last week high" value={cvi?.oneWeekHigh}/>
            <Stat prefix="" className="red" title="Last week low" value={cvi?.oneWeekLow}/>
        </>
    }, [cvi?.oneWeekHigh, cvi?.oneWeekLow, cvi?.oneHourAgo, type])
}

const IndexsTable = () => {
    const indexsInfo = useSelector(({app}) => app.indexInfo);
    const isMobile = useIsMobile();

    return useMemo(() => {
        const loadIndexsInfo = () => {
            return Object.keys(config.volatilityIndexKey).map(key => indexsInfo[key]);
        }

        const indexsList = loadIndexsInfo();
        const hasSomeVolInfo = indexsList.some(vol => vol !== null);
        
        return <DataController 
            customTableHeaders={isMobile ? [] : platformConfig.headers.index}
            activeTab="index" 
            data={hasSomeVolInfo ? indexsList.filter(vol => vol?.index) : indexsList}
        >
           <Suspense fallback={<> </>}>
                <Table />
           </Suspense>
           {indexsInfo?.cvi?.time && <span className="last-update-date">{indexsInfo?.cvi?.time}</span> }
        </DataController>
    }, [indexsInfo, isMobile])
}

export default IndexStats;
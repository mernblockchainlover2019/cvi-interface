import React, { useMemo } from 'react';
import Paginator from 'components/Paginator';
import ActiveRow from '../Elements/Rows/ActiveRow';
import SubHeader from '../Elements/SubHeader';
import { stakingViews } from 'config/stakingConfig';
import './ExpandList.scss';
import { useDataController } from '../DataController/DataController';
import Expand from 'components/Expand';

const ExpandList = () => {
    const { 
        currentData,
        currentPage,
        showPaginator,
        setCurrentPage,
        totalRecords,
        pageSize,
        activeTab,
        subHeaders
    } = useDataController();

    return useMemo(() => {
        return (
            <div className={`expand-list-component ${activeTab?.toLowerCase()}`}>
                {currentData.map((rowData, index) => [
                        subHeaders?.[index] && <SubHeader key={subHeaders[index]} title={subHeaders[index]} />, 
                        <Expand 
                            key={`${rowData.token}${index}${currentPage}`} 
                            header={<ActiveRow rowData={rowData} activeTab={activeTab} isHeader />} 
                            expandedView={<ActiveRow rowData={rowData} activeTab={activeTab} />}
                            classNames={rowData.key === 'govi-v2' && activeTab === stakingViews.staked? 'highlight' : ''} 
                        />
                    ])
                }
             
                {showPaginator && <Paginator 
                    currentPage={currentPage} 
                    totalRecords={totalRecords} 
                    onFirstClick={() => setCurrentPage(1)}
                    onLastClick={(last) => setCurrentPage(last)}
                    onBackClick={() => setCurrentPage(currentPage - 1)}
                    onFwdClick={() => setCurrentPage(currentPage + 1)}
                    pgSize={pageSize}
                    numOfpageBtndsToDispay={0}
                />}
            </div>
        )
        //eslint-disable-next-line
    }, [currentData, currentPage, showPaginator, setCurrentPage, totalRecords, pageSize, activeTab, subHeaders])
    
    
}

export default ExpandList;
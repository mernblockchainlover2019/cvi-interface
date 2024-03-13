import Paginator from 'components/Paginator';
import Tooltip from 'components/Tooltip';
import React, { useMemo } from 'react';
import ActiveRow from '../Elements/Rows/ActiveRow';
import SubHeader from '../Elements/SubHeader';
import { useDataController } from '../DataController/DataController';
import './Table.scss';

const Table = () => {
    const { 
        tableHeaders, 
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
        <div className={`table-component ${activeTab?.toLowerCase()}`}>
            <table>
                {tableHeaders?.length > 0 && <thead>
                    <tr>
                        {tableHeaders?.map((item, index) => 
                            <th 
                                key={index}
                            >
                                {item?.label ?? item} 
                                {item?.tooltip && <Tooltip 
                                                    type="question" 
                                                    left={item?.tooltip?.left ?? -30} 
                                                    mobileLeft={item?.tooltip?.mobileLeft} 
                                                    maxWidth={400} 
                                                    minWidth={250} 
                                                    content={item?.tooltip?.content} 
                                                />}
                            </th>
                        )}
                    </tr>
                </thead> }

                <tbody>
                    {currentData.map((rowData, index) => {
                        return [
                            subHeaders?.[index] && <SubHeader key={subHeaders[index]} title={subHeaders[index]} />,
                            <ActiveRow key={rowData?.key || index} activeTab={activeTab} rowData={rowData} />
                        ]
                    })}
                </tbody>
            </table>

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
    )}, [tableHeaders, currentData, currentPage, showPaginator, setCurrentPage, totalRecords, pageSize, activeTab, subHeaders]);
}

export default Table;
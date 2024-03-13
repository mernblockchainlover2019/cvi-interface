import { useIsMobile } from 'components/Hooks';
import IndexValue from 'components/pages/Platform/IndexStats/IndexValue';
import Stat from 'components/Stat';
import config from 'config/config';
import React, { useMemo } from 'react'
import { RowItem } from '.';

const IndexRow = ({rowData}) => {
    const isMobile = useIsMobile();
  
    return useMemo(() => {
        return <tr> 
            <RowItem 
                isTable
                content={<IndexValue activeIndex={rowData?.key} header={isMobile && `${config.volatilityLabel[rowData?.key]} index`} />} 
            />

            <RowItem 
                isTable
                header={isMobile && 'Previous hour'}
                content={<Stat value={rowData?.oneHourAgo} />} 
            />

            <RowItem 
                isTable
                header={isMobile && 'Last week high'}
                content={<Stat className="green" value={rowData?.oneWeekHigh} />} 
            />

            <RowItem 
                isTable
                header={isMobile && 'Last week low'}
                content={<Stat className="red" value={rowData?.oneWeekLow} />} 
            />
        </tr>
    }, [isMobile, rowData?.key, rowData?.oneWeekHigh, rowData?.oneWeekLow, rowData?.oneHourAgo]);
}

export default IndexRow;
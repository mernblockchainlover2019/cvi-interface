import { useIsTablet } from "components/Hooks";
import { useContext, useMemo } from "react";
import { useSelector } from 'react-redux';
import RowItem from './RowItem';
import { appViewContext } from "components/Context";
import platformConfig from "config/platformConfig";
import { Value } from "../Values";
import { isEmpty, omit } from "lodash";
import arbitrageConfig from "config/arbitrageConfig";

const HistoryRow = ({rowData, isHeader}) => {
    const isTablet = useIsTablet();
    const { activeView } = useContext(appViewContext);
    const { selectedNetwork } = useSelector(({app}) => app); 
    const arbitrageHeaders = arbitrageConfig.tables?.[selectedNetwork][activeView]?.history?.headers;
    const platformHeaders = platformConfig.headers?.[activeView]?.History;
  
    const headers = useMemo(() => {
        if(!isEmpty(arbitrageHeaders)) return Object.values(arbitrageHeaders);
        if(!isEmpty(platformHeaders)) return platformHeaders;
        return null;
    }, [arbitrageHeaders, platformHeaders]);

    const RowData = useMemo(() => {
        if(!rowData || !activeView || !headers) return null;
        const historyData = omit(rowData, ['transactionHash', 'timestamp']);

        return Object.values(historyData)?.map((value, index) => <RowItem 
            key={index}
            header={headers[index]} 
            content={<Value subText={value} />} 
        />)
    }, [rowData, activeView, headers]);

    if(isHeader) {
        return arbitrageConfig.requestType[rowData.type] ?
            <> 
                <RowItem
                    type={rowData.type}
                    content={<Value className="uppercase-first-letter" text={rowData.type} />} 
                />
                <RowItem
                    content={<Value text={rowData.amount} />}
                />
            </> : <> 
                <RowItem content={<Value text={rowData.date} />} />
                <RowItem content={<Value text={rowData.type} />} />
            </>
        
    }

    return isTablet ? RowData : <tr>
        {RowData}
    </tr>
}

export default HistoryRow;

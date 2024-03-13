import platformConfig, { activeViews } from "config/platformConfig"
import { stakingViews } from "config/stakingConfig"
import { uniqueId } from "lodash"
import { useMemo } from "react"
import HistoryRow from "./HistoryRow"
import IndexRow from "./IndexRow"
import LiquidityRow from "./LiquidityRow"
import PendingRequestsRow from "./PendingRequestsRow"
import StakeAssetsRow from "./StakeAssetsRow"
import StakedAssetsRow from "./StakedAssetsRow"
import StatsRow from "./StatsRow"
import TradeRow from "./TradeRow"

const ActiveRow = ({activeTab, isHeader, rowData}) => {
    return useMemo(() => {
        switch(activeTab) {
            
            case activeViews.history: 
            case "history":
                return <HistoryRow rowData={rowData} isHeader={isHeader} />
            
            case 'stats': 
                return <StatsRow rowData={rowData} />

            case 'index':
                return <IndexRow rowData={rowData} />
    
            case platformConfig.tabs.trade.positions:
                return <TradeRow className="trade-row" token={rowData} isHeader={isHeader} />
            
            case platformConfig.tabs['view-liquidity'].liquidity:
                return <LiquidityRow className="liquidity-row" token={rowData} isHeader={isHeader} />
    
            case stakingViews.staked:
                return <StakedAssetsRow rowData={rowData} isHeader={isHeader} />
    
            case stakingViews["available-to-stake"]:
                return <StakeAssetsRow rowData={rowData} isHeader={isHeader} />
            
            case 'pending':
                return <PendingRequestsRow key={rowData.requestId || uniqueId("pending")} className={activeTab} rowData={rowData} isHeader={isHeader} />

            default:
                return null;
        }
    }, [activeTab, isHeader, rowData]);
}

export default ActiveRow;
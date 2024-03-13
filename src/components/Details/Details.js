import { appViewContext } from "components/Context";
import { activeViews as platformActiveViews } from "config/platformConfig";
import { activeTabs as arbitrageActiveViews } from "config/arbitrageConfig";
import { lazy, Suspense, useContext, useMemo } from "react";
import { useActiveToken } from "components/Hooks";
import config from "config/config";
import './Details.scss';

const LiquidityView = lazy(() => import('./Views/LiquidityView'));
const TradeView = lazy(() => import('./Views/TradeView'));
const VolDetailsView = lazy(() => import('./Views/VolDetailsView'));

const Details = ({activeVolIndex, amount, leverage, delayFee, slippageTolerance, selectedCurrency, path = config.routes.platform.path}) => {
    const { activeView } = useContext(appViewContext);
    const activeToken = useActiveToken(selectedCurrency ?? activeView, path);

    return useMemo(() => {
        if(!activeToken) return null;
        
        const getActiveView = () => {
            switch(activeView) {
                case platformActiveViews.trade:
                    return <TradeView 
                        amount={amount} 
                        selectedCurrency={activeToken.key} 
                        leverage={leverage}
                        activeVolIndex={activeVolIndex}
                        slippageTolerance={slippageTolerance}
                    />
    
                case platformActiveViews["view-liquidity"]:
                    return <LiquidityView 
                        amount={amount} 
                        selectedCurrency={activeToken.key} 
                        activeVolIndex={activeVolIndex}
                    />
                
                case arbitrageActiveViews.burn:
                case arbitrageActiveViews.mint: 
                    return <VolDetailsView 
                        amount={amount} 
                        activeVolIndex={activeVolIndex}
                        delayFee={delayFee}
                    />
    
                default:
                    return null; 
            }
        };

        return (
            <div className="details-component">
                <div className="details-component__container">
                    <Suspense fallback={<></>}>
                        {getActiveView()}
                    </Suspense>
                </div>
            </div>
        )
    }, [activeToken, activeView, activeVolIndex, amount, delayFee, leverage, slippageTolerance]); 
}

export default Details;
import { useActionController } from "./ActionController";
import { useMemo } from 'react';
import arbitrageConfig from "config/arbitrageConfig";
import SubmitBurn from "./SubmitBurn";
import SubmitMint from "./SubmitMint";
import PendingRequest from "./PendingRequest";

const ArbitrageActions = () => {
    const { type } = useActionController();

    return useMemo(() => {
        switch (type) {
            case arbitrageConfig.actionsConfig.burn.key:
                return <SubmitBurn />

            case arbitrageConfig.actionsConfig.fulfill.key:
            case arbitrageConfig.actionsConfig.processing.key:
            case arbitrageConfig.actionsConfig.liquidate.key:
                return <PendingRequest />

            default:
                return <SubmitMint />
        }
    }, [type]);
}

export default ArbitrageActions;
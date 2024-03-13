import { useWeb3React } from '@web3-react/core';
import Button from 'components/Elements/Button';
import config from 'config/config';
import stakingConfig from 'config/stakingConfig';
import { supportedNetworksConfigByEnv } from 'connectors';
import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addAlert } from 'store/actions';
import './AddMetamaskAsset.scss';

const AddMetamaskAsset = ({token, protocol}) => {
    const { selectedNetwork } = useSelector(({app}) => app);
    let { library } = useWeb3React();
    const dispatch = useDispatch();

    const activeToken = useMemo(() => {
        if(!selectedNetwork || !protocol || !token) return;
        return stakingConfig.tokens[selectedNetwork][protocol][token]
    }, [selectedNetwork, protocol, token]);
    

    const onClick = async () => {
        try {
            library = window?.ethereum ?? library.currentProvider;

            if(selectedNetwork !== supportedNetworksConfigByEnv[library.networkVersion]?.chainName) {
                return dispatch(addAlert({
                    id: 'add-token',
                    eventName: "Add token failed",
                    alertType: config.alerts.types.FAILED,
                    message: "This token does not appear to be supported. Please check your Metamask network."
                }));
            }

            const wasAdded = await library.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                    address: activeToken.address,
                    symbol: activeToken.label.substring(0, 11),
                    decimals: activeToken.decimals,
                },
              },
            });
            
            if (wasAdded) {
                dispatch(addAlert({
                    id: 'add-token',
                    eventName: "Add token - success",
                    alertType: config.alerts.types.CONFIRMED,
                    message: "Add token successfully"
                }));
            } else {
                dispatch(addAlert({
                    id: 'add-token',
                    eventName: "Failed to add token.",
                    alertType: config.alerts.types.FAILED,
                    message: "Add token failed"
                }));
            }
          } catch (error) {
            console.log(error.message);
            dispatch(addAlert({
                id: 'add-token',
                eventName: "Add token - failed",
                alertType: config.alerts.types.FAILED,
                message: "Failed to add token."
            }));
          }
    }
    
    return useMemo(() => {
        return (
            <Button className="metamask-asset-component external-link" onClick={onClick} title="Add to Metamask">
                <img className="external-link" src={require('images/icons/metamask.svg').default} alt="metamask" />
            </Button>
        )
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

export default AddMetamaskAsset;
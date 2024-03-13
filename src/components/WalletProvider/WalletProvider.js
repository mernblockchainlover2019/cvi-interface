import React from 'react';
import Button from 'components/Elements/Button';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import './WalletProvider.scss';


const WalletProvider = ({avatarUrl, name, onClick }) => {
    const { library } = useActiveWeb3React();
    const isConnected = library.currentProvider[`is${name}`]

    return (
        <div className={`wallet-provider ${isConnected ? 'provider-is-connected' : ''}`}>
            {isConnected && <img className="connected-icon" src={require('../../images/icons/confirmed-icon.svg').default} alt="confirmed" />}
            {avatarUrl && <img className="wallet-provider__img" src={avatarUrl} alt={name} /> }
            <h2 className="wallet-provider__h2">{name}</h2>
            <Button className="button wallet-provider__button" buttonText={isConnected ? 'Connected' : 'CONNECT'} onClick={()=> !isConnected && onClick(name)}/>
        </div>
    )
}

export default WalletProvider;
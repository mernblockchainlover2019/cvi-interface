import { useActiveWeb3React } from "components/Hooks/wallet";
import React from "react";
import { useSelector } from "react-redux";
import { chainNames } from 'connectors';

export const Earn = ({ stepDetails }) => {
  const { account } = useActiveWeb3React();
  const { selectedNetwork } = useSelector(({app}) => app);

  return (
    <div className="migration-step-wrapper">
      <div className="step-details">
        {stepDetails.stepDesc &&
          stepDetails.stepDesc.map((stepDesc, tn) => (
            <p key={tn}>{
              stepDesc === 'rewards-id' ?  
                <span className="green bold float-left">{selectedNetwork === chainNames.Ethereum ? 200 : 50} GOVI</span> : 
                stepDesc
              }
            </p>
        ))}
        <span className="wallet-address">
          {account}
        </span>
      </div>
      <div className="actions-wrapper"></div>
    </div>
  );
};

export default Earn;

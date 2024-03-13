import React from "react";
import Button from "components/Elements/Button";

export const Migrate = ({
  stepDetails: {stepButton = [], stepDesc} = {},
  liquidityBalance,
  onClickHandler,
  isLoading,
  disabled,
  isApproved
}) => {
  return (
    <div className="migration-step-wrapper">
      <div className="step-details">
        {stepDesc?.map((stepDesc, tn) => {
          if (stepDesc instanceof Array) {
            return <p key={tn}>{stepDesc[0]} {liquidityBalance} USDT</p>;
          }
          return <p key={tn}>{stepDesc}</p>;
        })}
      </div>
      <div className="actions-wrapper">
        {stepButton.map((step) => {
            let isDisabled = 
              disabled === step.toLowerCase() 
              || (isApproved ? step.toLowerCase() === "approve" : step.toLowerCase() === "migrate");
            
            return <Button
              key={step}
              id={step}
              className="button step-button"
              buttonText={step}
              onClick={() => onClickHandler(step.toLowerCase())}
              processing={isLoading === step.toLowerCase()}
              disabled={isDisabled} 
            />
          }
        )}
      </div>
    </div>
  );
};

export default Migrate;

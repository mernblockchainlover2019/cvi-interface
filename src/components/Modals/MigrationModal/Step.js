import React from "react";
import { useSelector } from "react-redux";
import "./Step.scss";
import { chainNames } from 'connectors';

export const Step = ({ stepData, stepNumber, isActive, isConfirmed }) => {
  const { selectedNetwork } = useSelector(({app}) => app);

  return (
    <div className={`step-wrapper${isActive ? ' active' : ''}`}>
      <div className="circle">
        {stepNumber}
        {isConfirmed && <img className="step-confirmed-icon" src={require('../../../images/icons/confirmed-icon.svg').default} alt="confirmed" />}
        </div>
      <span className="step-title">
        {stepData.stepTitle} 
        {stepData.stepTitle.toLowerCase() === 'receive' ? selectedNetwork === chainNames.Ethereum ? " 200 GOVI" : " 50 GOVI" : null} 
      </span>
    </div>
  );
};

export default Step;
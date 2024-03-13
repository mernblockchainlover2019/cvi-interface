import React, { useCallback, useMemo, useState, useRef } from "react";
import Tooltip from "components/Tooltip";
import config from '../../config/config';
import "./SlippageTolerance.scss";
import { customFixed } from 'utils';
import { useOnClickOutside } from "components/Hooks";

const SlippageTolerance = ({slippageTolerance, setSlippageTolerance}) => {
  const [costumTolerance, setCostumTolerance] = useState("");
  const [inputSlippageFocus, setInputSlippageFocus] = useState(false);
  const [visibleSlippageButtons, setVisibleSlippageButtons] = useState(false);
  const slippageButtons = useMemo(() => ({
    buttons: config.slippageButtons,
  }), []);
  const containerRef = useRef(null);
  useOnClickOutside(containerRef, () => { setVisibleSlippageButtons(false); setInputSlippageFocus(false); });

  const isFixedTolerance = slippageButtons.buttons.includes(slippageTolerance);

  const slippageBtnHandler = useCallback((val) => {
    setInputSlippageFocus(false)
    if (slippageTolerance !== val) {
      setSlippageTolerance(val);
      setCostumTolerance("");
    }
  }, [setSlippageTolerance, slippageTolerance]);

  const customSlippageInput = ({target: { value }}) => {
    //eslint-disable-next-line
      var numbersOnly = /[^0-9][\.,]/g;
      let valNoLetters = value?.replace(numbersOnly, '');
      if (valNoLetters >= 0 && valNoLetters < 100) {
        let costumTolerance = valNoLetters
        setCostumTolerance(customFixed(costumTolerance, 2));
        setSlippageTolerance(customFixed(costumTolerance, 2));
      }
  }


  return (
    <div className="slippage-tolerance-component" ref={containerRef}>
      <div className="slippage-header">
        <span className="slippage-title">
          {config.statisticsDetails.slippageTolerance.title}
          <Tooltip
            type="question"
            left={config.statisticsDetails.slippageTolerance.tooltip?.left ?? -30}
            mobileLeft={config.statisticsDetails.slippageTolerance.tooltip?.mobileLeft}
            maxWidth={400}
            minWidth={250}
            content={config.statisticsDetails.slippageTolerance.tooltip?.content}
          />
        </span>

        <div className="slippage-value">
          <span>{slippageTolerance}%</span>
          <button className="slippage-edit" onClick={() => setVisibleSlippageButtons(true)}><img className="edit-icon" src={require('../../images/icons/edit.svg').default} alt="edit"></img></button>
        </div>
      </div>
      {visibleSlippageButtons &&
        <div className="slippage-buttons-group">
          {slippageButtons.buttons &&
            slippageButtons.buttons.map((slippageValue, valnum) => {
              return (
                <button
                  key={`${valnum}-${slippageValue}`}
                  type="button"
                  className={`slippage-button${!costumTolerance && !inputSlippageFocus && slippageValue === slippageTolerance ? " selected" : ""}`}
                  onClick={() => slippageBtnHandler(slippageValue)}>
                  <span>{slippageValue}%</span>
                </button>
              );
            })}

          <div className={`input-container${((slippageTolerance && !isFixedTolerance) || costumTolerance || inputSlippageFocus) ? " selected" : ""}`}>
            <input type="text"
              placeholder={((slippageTolerance && !isFixedTolerance) || costumTolerance || inputSlippageFocus) ? "" : "Custom"}
              name="slippage-input"
              autoComplete="off"
              className="slippage-input"
              value={slippageTolerance && isFixedTolerance ? costumTolerance : slippageTolerance}
              onChange={customSlippageInput}
              onFocus={() => setInputSlippageFocus(true)}
              onBlur={() => setInputSlippageFocus(false)}
            />
            {((slippageTolerance && !isFixedTolerance) || costumTolerance || inputSlippageFocus) ? <span className="slippage-sign">%</span> : ''}
          </div>
        </div>
      }
    </div>
  );
};

export default SlippageTolerance;

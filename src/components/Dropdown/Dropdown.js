import React, { useRef,useCallback, useMemo, useState } from "react";
import "./Dropdown.scss";
import { useOnClickOutside } from "components/Hooks";

const Dropdown = ({ label, type, dropdownOptions, dropdownValue, setDropdownValue, clickOutsideDisabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasOptions = dropdownOptions?.length > 0;
  const containerRef = useRef(null);
  useOnClickOutside(containerRef, () => !clickOutsideDisabled && setIsOpen(false));

  const dropdownToggle = useCallback(() => {
    if(!hasOptions) return;
    setIsOpen(!isOpen);
  }, [hasOptions, isOpen]);

  const valueChange = useCallback(
    ({ target: { value } }) => {
      if (value === "") return setDropdownValue(""); // Clear input
      if (
        type === "number" &&
        (isNaN(Number(value)) || !dropdownOptions.includes(Number(value)))
      )
        return; // Only Numbers, Only if included in options
      
      setDropdownValue(value);
    },
    [dropdownOptions, setDropdownValue, type]
  );

  return useMemo(() => {
    const dropdownSelection = (value) => {
      if(!hasOptions) return;
      setDropdownValue(value);
      setIsOpen(false);
    };

    return (
      <div
        ref={containerRef}
        className={`dropdown-component${isOpen ? " open" : ""}${dropdownValue === "" ? " error" : ""}${!hasOptions ? ' disabled' : ''}`}
      >
        <div className="dropdown-group">
          <div className="input-group">
            <input
              type="text"
              className="dropdown-input"
              name="dropdown-input"
              value={dropdownValue}
              onChange={valueChange}
              disabled={!hasOptions}
            />

            <img
              className="open-icon"
              src={require("../../images/icons/dropdown-chevron-orange.svg").default}
              alt="chevron"
              onClick={dropdownToggle}
            />
          </div>

          <div className="dropdown-label">{label}</div>
        </div>
        {isOpen && (
          <ul className="dropdown-component-open">
            {dropdownOptions.map((value, index) => {
              return (
                <li
                  key={index}
                  className={`dropdown-option${value === dropdownValue ? " selected" : ""}`}
                  onClick={() => dropdownSelection(value)}
                >
                  {value}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }, [isOpen, dropdownValue, valueChange, dropdownToggle, label, dropdownOptions, setDropdownValue, hasOptions]);
};

export default Dropdown;

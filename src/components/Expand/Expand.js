import Button from 'components/Elements/Button';
import React, { useState } from 'react';
import './Expand.scss';

const Expand = ({header, expandedView, classNames}) => {
    const [isExpanded, setIsExpanded] = useState();
    const [chevronAction, setChevronAction] = useState("");

    return (
        <div className={`expand-component ${isExpanded ? 'expanded' : ''} ${classNames ? classNames : ''}`}>
            <div className="expand-component__header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="expand-component__header--info">
                    {header}
                </div>
                <Button className="expand-component__header--button">
                    <img
                        onMouseOver={() => {
                            setChevronAction("hover")
                        }}
                        onMouseOut={() => {
                            setChevronAction("")
                        }}
                        onMouseDown={() => {
                            setChevronAction("click")
                        }}
                        onMouseUp={() => {
                            setChevronAction("")
                        }}
                        src={require(`../../images/icons/interactable-chevron/${chevronAction ? chevronAction : "regular"}/dropdown-chevron-orange.svg`).default} alt="chevron" />
                </Button>
            </div>

            {isExpanded && <div className="expand-component__expanded">
                {expandedView}
            </div> }
        </div>
    )
}

export default Expand;
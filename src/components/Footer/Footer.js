import config from 'config/config';
import React, {useState} from 'react'
import { track } from 'shared/analytics';
import './Footer.scss';

const Footer = () => {

    const [selectedIcon, setSelectedIcon] = useState("");
    const [iconAction, setIconAction] = useState("");

    return (
        <div className="footer-component">
            <div className="footer-component__container">
                <div className="footer-component__container--right">
                    {config.socialLinks.map(({iconName, to}) => <a
                        key={iconName}
                        href={to}
                        onClick={() => {track(iconName)}}
                        rel="nofollow noopener noreferrer"
                        target="_blank"
                        onMouseOver={() => {
                            setSelectedIcon(iconName)
                            setIconAction("hover")
                        }}
                        onMouseOut={() => {
                            setSelectedIcon("")
                        }}
                        onMouseDown={() => {
                            setIconAction("click")
                        }}
                    >
                        <img src={require(`../../images/social/${selectedIcon === iconName ? iconAction : "regular"}/${iconName}.svg`).default} alt={iconName}/>
                    </a>)}
                </div>

                <div className="footer-component__container--left">
                    <span>© 2021 all rights reserved to COTI</span>
                </div>
            </div>
        </div>
    )
}

export default Footer;
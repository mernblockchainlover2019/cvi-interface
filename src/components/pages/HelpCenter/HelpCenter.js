import React from 'react'
import FAQ from './FAQ';
import Guides from './Guides';
import './HelpCenter.scss';

const HelpCenter = () => {
    return (
        <div className="help-center-component">
            <div className="help-center-component__header">
              <h2>Help center</h2>
              <div className="help-center-component__header--background"></div>
            </div>
            <FAQ />
            <Guides />
        </div>
    )
}

export default HelpCenter;
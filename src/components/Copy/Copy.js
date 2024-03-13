import React from 'react'
import Button from 'components/Elements/Button';
import config from 'config/config';
import { useCopyToClipboard } from 'components/Hooks';
import { useDispatch } from 'react-redux';
import { addAlert } from 'store/actions';
import './Copy.scss';

const Copy = ({text, title}) => {
    //eslint-disable-next-line
    const [copied, copy] = useCopyToClipboard(text);
    const dispatch = useDispatch();

    const onCopy = () => {
        copy();
        dispatch(addAlert({
            id: 'copied-to-clipboard',
            eventName:  "Copied to clipboard",
            alertType: config.alerts.types.CONFIRMED,
            message: "Copied to clipboard"
        }));
    }

    return (
        <div className="copy-component">
            <Button className="button copy-component__btn" onClick={onCopy}>
                <img src={require('../../images/icons/copy.svg').default} alt="copy" />
                <span>{title}</span>
            </Button>
        </div>
    )
}

export default Copy;
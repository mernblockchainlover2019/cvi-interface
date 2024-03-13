import { networksFormattedByEnv } from 'connectors';
import ReactGA from 'react-ga';
import { parseHex } from 'utils';

const getPage = () => {
    return window.location.pathname;
}

export const track = (category, event) => {
    const chainId = parseHex(window.ethereum?.chainId);
    event = event || 'click';
    ReactGA.event({
        category: `${category} ${networksFormattedByEnv?.[chainId]?.name ?? ''}`,
        action: event,
        label: getPage().length === 1 ? '/home' : getPage()
    });
}
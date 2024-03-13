import { useInDOM, useIsTablet } from "components/Hooks";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import config from "../../config/config";
import Button from "../Elements/Button";
import TotalValueLocked from "components/TotalValueLocked";
import SelectNetwork from "components/SelectNetwork";
import ConnectWallet from "components/ConnectWallet";
import { track } from "shared/analytics";
import { useSelector } from "react-redux";
import { getAppMainRouteConfig } from "utils";
import "./Navbar.scss";
import NewNotificationMessage from "components/Navbar/NewNotificationMessage";

const Navbar = () => {
  const isActiveInDOM = useInDOM();
  const { selectedNetwork } = useSelector(({app}) => app);
  const [pageYOffset, setPageYOffset] = useState(0);
  const location = useLocation();
  const isTablet = useIsTablet();
  const [activePath, setActivePath] = useState();
  const [notificationData, setNotificationData] = useState(null);
  const links = Object.values(config.routes);
  const from = location?.state?.from;
  const showEnterApp =
    activePath === "/help" ||
    links.some(
      ({ enterApp, path }) => enterApp && activePath && activePath === path
    ); // show "enter app button" if config match enterApp flag.

  const filteredLinkForHide = links.filter(
    ({ hide, path }) =>
      !hide?.some((hidePath) => {
        const isHidePath = !(hidePath && hidePath !== activePath); // hide current link by hiding list in routes (config.js)
        return (isHidePath && showEnterApp) || path === "/"; // always hide home page link
      })
  ); // don't show links who hided in config by active path and "show enter app" state

  const filteredLink = filteredLinkForHide.filter(({ supportedByNetwork }) => !supportedByNetwork || (supportedByNetwork.includes(selectedNetwork)));

  useEffect(() => {
    if (isActiveInDOM()) setActivePath(location?.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setPageYOffset(window?.pageYOffset);
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if(!selectedNetwork || !filteredLink || notificationData === false) return;
    
    const { notification: notificationConfig } = filteredLink?.find((linkData) => {
      if(!linkData.notification?.activeBy || !config.routes[activePath?.replace('/', '')]?.notification ) return false;
      const { restricted, networks = [] } = linkData.notification.activeBy;
      return restricted === linkData.restricted && networks.includes(selectedNetwork);
    }) || [];

    
    if(notificationConfig) {
      if(localStorage.getItem(notificationConfig.type) === 'close') return setNotificationData('close');
      setNotificationData(notificationConfig);
    }
    
  }, [activePath, filteredLink, notificationData, selectedNetwork]);

  const RenderView = useMemo(() => {
    if(!activePath) return null;
    return (
      <>
        <Logo showEnterApp={showEnterApp} />
        {!isTablet && (
          <Links
            links={filteredLink}
            activePath={activePath}
            activeFrom={from}
          />
        )}
        {isTablet ? (
          <Hamburger
            links={filteredLink}
            activePath={activePath}
            showEnterApp={showEnterApp}
          />
        ) : (
          <AppButton showEnterApp={showEnterApp} />
        )}
      </>
    );
    //eslint-disable-next-line
  }, [showEnterApp, activePath, isTablet]);

  return useMemo(() => {
    const hasNotification = notificationData && notificationData !== 'close';
    return (
      <div
        className={`navbar-component ${showEnterApp ? "is-home" : ""} ${hasNotification ? 'navbar-component-is-notification' : ''} ${
          pageYOffset > 25 ? "is-scroll" : ""
        }`}
      >
        {hasNotification && <NewNotificationMessage type={notificationData.type} setNotificationData={setNotificationData} />}
        <div className="navbar-component__container">{RenderView}</div>
      </div>
    );
  }, [showEnterApp, notificationData, pageYOffset, RenderView]);
};

export const EnterApp = ({ setIsOpen }) => {
  const { selectedNetwork } = useSelector(({app}) => app);
  
  return useMemo(() => {
      const appMainRouteConfig = getAppMainRouteConfig(selectedNetwork);
      return (
        <div className="navbar-component__container--connect">
          <Link
            to={appMainRouteConfig.path}
            className="navbar-component__container--connect-enter-app"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <div>ENTER PLATFORM</div>
          </Link>
        </div>
      );
    },
    [selectedNetwork, setIsOpen]
  );
};

const AppButton = ({ showEnterApp, setIsOpen }) => {
  return useMemo(() => {
    if (showEnterApp) return <EnterApp setIsOpen={setIsOpen} />;

    return (
      <div className="navbar-component__container--connect">
        <TotalValueLocked placement="navbar" />
        <SelectNetwork />
        <NavbarConnectMemoized />
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEnterApp]);
};

const Links = ({ links, activePath, activeFrom, setIsOpen }) => {
  return useMemo(() => {
    const generatePath = (path, prevLink) => {
      if (prevLink) {
        if (activeFrom) return activeFrom;
        return activePath === "/" ? "home" : activePath?.replace("/", "");
      }
      return path;
    };

    return links.map(({ label, path, external, prevLink, soonByNetwork, fire, newLink }) => (
      <NavLink
        key={path}
        label={label}
        path={path}
        prevPath={generatePath(path, prevLink)}
        external={external}
        activePath={activePath}
        setIsOpen={setIsOpen}
        soonByNetwork={soonByNetwork}
        fire = {fire}
        newLink={newLink}
      />
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links, activePath, activeFrom]);
};

const Hamburger = ({ links, activePath, showEnterApp }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="mobile-menu">
          <Links links={links} activePath={activePath} setIsOpen={setIsOpen} />

          <div className="navbar-component__list-item">
            <TotalValueLocked placement="navitem" />
          </div>

          {showEnterApp ? (
            <AppButton showEnterApp={showEnterApp} setIsOpen={setIsOpen} />
          ) : (
            <>
              <div className="navbar-component__list-item">
                <SelectNetwork />
              </div>

              <div className="navbar-component__list-item">
                <ConnectWallet
                  type="navbar"
                  buttonText="CONNECT"
                  hasErrorButtonText="Wrong network"
                />
              </div>
            </>
          )}
        </div>
      )}

      <Button
        className={`hamburger-component ${isOpen ? "opened" : "closed"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="hamburger-component__container">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </Button>
    </>
  );
};

const NavLink = ({
  label,
  path,
  external,
  activePath,
  prevPath,
  setIsOpen,
  soonByNetwork,
  fire,
  newLink
}) => {
  const { selectedNetwork } = useSelector(({app}) => app);

  return useMemo(() => {
    const onClickLink = (path) => {
      window.scrollTo(0, 0);
      track(path);
      if (setIsOpen) setIsOpen(false);
    };

    const renderView = () => {
      if (newLink) return <NewLink label={label} path={path} onClickLink={onClickLink} />

      if(external) return <ExternalLink
        path={path}
        label={label}
        fire={fire}
        onClickLink={onClickLink}
      />

      const isComingSoon = soonByNetwork?.includes(selectedNetwork);

      if(isComingSoon) return <SoonLink label={label} />

      return <Link
        className={typeof path === "string" ? path === activePath ? "active" : "" : path.includes(activePath) ? "active" : ""}
        to={{
          pathname: !path.toString().includes("help") ? path : activePath === "/" || activePath === "/help" ? "/help" : "/platform/help",
          state: { from: prevPath },
        }}
        onClick={() => onClickLink(path)}
        disabled
      >
        {label}
      </Link>
    }

    return (
      <div key={path} className="navbar-component__list-item">
        {renderView()}
      </div>
    );
  }, [path, setIsOpen, external, label, soonByNetwork, selectedNetwork, activePath, prevPath, newLink, fire]);
};

const ExternalLink = ({path, onClickLink, label, fire}) => {
  return useMemo(() => {
    return  <a
      href={path}
      onClick={() => onClickLink(path)}
      rel="nofollow noopener noreferrer"
      target="_blank"
    >
      {label}{fire && <img src={require('../../images/icons/fire.svg').default} alt="fire" />}
    </a>
  }, [label, onClickLink, fire, path])
}

const SoonLink = ({label}) => {
  return useMemo(() => {
    return <Link className="coming-soon-link-component" to="#">
      {label}
      <span>Coming soon</span>
    </Link>
  }, [label]);
}

const NewLink = ({path, onClickLink, label}) => {
  return useMemo(() => {
    return  <a
        className="new-link-component"
        href={path}
        onClick={() => onClickLink(path)}
        rel="nofollow noopener noreferrer"
        target="_blank"
    >
      {label}
      <span>NEW!</span>
    </a>
  }, [label, onClickLink, path]);
}

const NavbarConnectMemoized = () => {
  return useMemo(
    () => (
      <ConnectWallet
        type="navbar"
        buttonText="Connect wallet"
        hasErrorButtonText="Wrong network"
      />
    ),
    []
  );
};

export const Logo = ({ showEnterApp }) => {
  const { selectedNetwork } = useSelector(({app}) => app);
  return useMemo(() => {
    const onClickLogo = () => {
      window.scrollTo(0, 0);
      track("CVI Logo");
    };

    const appMainRouteConfig = getAppMainRouteConfig(selectedNetwork);

    return (
      <Link
        className="logo-component"
        to={
          showEnterApp ? config.routes.home.path : appMainRouteConfig.path
        }
        onClick={onClickLogo}
      >
        <img src={require("../../images/logo.svg").default} alt="logo" />
        <div>Crypto Volatility Index</div>
      </Link>
    );
  }, [selectedNetwork, showEnterApp]);
};

export default Navbar;

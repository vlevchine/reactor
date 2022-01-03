import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { appState } from '@app/services';
import { Button, I } from '@app/components/core';

Brand.propTypes = {
  config: PropTypes.object,
};
export default function Brand({ config }) {
  const { nav } = appState,
    [min, toggle] = useState(),
    navigate = useNavigate(),
    navigateTo = (page) => {
      navigate(`/${page.path}`);
    },
    { staticPages, title } = config,
    onNav = (data) => {
      if (data?.leftNavToggle) toggle((e) => !e);
    };

  useEffect(() => {
    const n_sub = nav.subscribe(onNav);
    return () => nav.unsubscribe(n_sub);
  }, []);

  return (
    <Button
      minimal
      // className="info"
      onClick={() => navigateTo(staticPages.home)}>
      {/* <img src={window.location.origin + '/logo.jpg'} alt="Logo"/> */}
      <I name={'globe'} styled="s" size="xxxl" className="spin" />
      {!min && <h2 className="title fade-in">{title}</h2>}
    </Button>
  );
}

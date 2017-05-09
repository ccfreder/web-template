/**
 *  MobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Avatar, InlineButton, NamedLink } from '../../components';

import css from './MobileMenu.css';

const MobileMenu = props => {
  const { isAuthenticated, currentUserHasListings, name, onLogout } = props;

  if (!isAuthenticated) {
    return (
      <div className={css.root}>
        <div className={css.authenticationLinks}>
          <NamedLink name="SignupPage" className={css.signupLink}>
            <FormattedMessage id="MobileMenu.signupLink" />
          </NamedLink>
          <NamedLink name="LoginPage" className={css.loginLink}>
            <FormattedMessage id="MobileMenu.loginLink" />
          </NamedLink>
        </div>
        <div className={css.createNewListingLink}>
          <NamedLink name="NewListingPage">
            <FormattedMessage id="MobileMenu.newListingLink" />
          </NamedLink>
        </div>
      </div>
    );
  }

  const inboxLink = (
    <NamedLink name={currentUserHasListings ? 'InboxSalesPage' : 'InboxOrdersPage'}>
      <FormattedMessage id="MobileMenu.inboxLink" />
    </NamedLink>
  );

  return (
    <div className={css.root}>
      <div className={css.user}>
        <Avatar className={css.avatar} name={name} />
        <div className={css.userInfo}>
          <span>{name}</span>
          <NamedLink className={css.createNewListingLink} name="NewListingPage">
            <FormattedMessage id="MobileMenu.newListingLink" />
          </NamedLink>
        </div>
      </div>
      <div className={css.content}>
        {inboxLink}
      </div>
      <div className={css.footer}>
        <InlineButton className={css.logoutButton} onClick={onLogout}>
          <FormattedMessage id="MobileMenu.logoutLink" />
        </InlineButton>
      </div>
    </div>
  );
};

MobileMenu.defaultProps = { name: '' };

const { bool, func, string } = PropTypes;

MobileMenu.propTypes = {
  isAuthenticated: bool.isRequired,
  currentUserHasListings: bool.isRequired,
  name: string,
  onLogout: func.isRequired,
};

export default MobileMenu;
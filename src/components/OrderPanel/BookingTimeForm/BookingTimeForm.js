import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';

import config from '../../../config';
import { FormattedMessage, intlShape, injectIntl } from '../../../util/reactIntl';
import { timestampToDate } from '../../../util/dates';
import { propTypes } from '../../../util/types';

import { Form, IconSpinner, PrimaryButton } from '../../../components';

import EstimatedCustomerBreakdownMaybe from '../EstimatedCustomerBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';

import css from './BookingTimeForm.module.css';

export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleFormSubmit(e) {
    this.props.onSubmit(e);
  }

  // When the values of the form are updated we need to fetch
  // lineItems from FTW backend for the EstimatedTransactionMaybe
  // In case you add more fields to the form, make sure you add
  // the values here to the orderData object.
  handleOnChange(formValues) {
    const { bookingStartTime, bookingEndTime } = formValues.values;
    const startDate = bookingStartTime ? timestampToDate(bookingStartTime) : null;
    const endDate = bookingEndTime ? timestampToDate(bookingEndTime) : null;

    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    // We expect values bookingStartTime and bookingEndTime to be strings
    // which is the default case when the value has been selected through the form
    const isSameTime = bookingStartTime === bookingEndTime;

    if (bookingStartTime && bookingEndTime && !isSameTime && !this.props.fetchLineItemsInProgress) {
      this.props.onFetchTransactionLineItems({
        orderData: { bookingStart: startDate, bookingEnd: endDate },
        listingId,
        isOwnListing,
      });
    }
  }

  render() {
    const { rootClassName, className, price: unitPrice, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    if (!unitPrice) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingPriceMissing" />
          </p>
        </div>
      );
    }
    if (unitPrice.currency !== config.currency) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingCurrencyInvalid" />
          </p>
        </div>
      );
    }

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            form,
            pristine,
            handleSubmit,
            intl,
            isOwnListing,
            listingId,
            submitButtonWrapperClassName,
            values,
            monthlyTimeSlots,
            onFetchTimeSlots,
            timeZone,
            lineItems,
            fetchLineItemsInProgress,
            fetchLineItemsError,
          } = fieldRenderProps;

          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;
          const startDate = startTime ? timestampToDate(startTime) : null;
          const endDate = endTime ? timestampToDate(endTime) : null;

          // This is the place to collect breakdown estimation data. See the
          // EstimatedCustomerBreakdownMaybe component to change the calculations
          // for customized payment processes.
          const breakdownData =
            startDate && endDate
              ? {
                  startDate,
                  endDate,
                }
              : null;

          const showEstimatedBreakdown =
            breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

          return (
            <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
              <FormSpy
                subscription={{ values: true }}
                onChange={values => {
                  this.handleOnChange(values);
                }}
              />
              {monthlyTimeSlots && timeZone ? (
                <FieldDateAndTimeInput
                  startDateInputProps={{
                    label: intl.formatMessage({ id: 'BookingTimeForm.bookingStartTitle' }),
                    placeholderText: startDatePlaceholder,
                  }}
                  endDateInputProps={{
                    label: intl.formatMessage({ id: 'BookingTimeForm.bookingEndTitle' }),
                    placeholderText: endDatePlaceholder,
                  }}
                  className={css.bookingDates}
                  listingId={listingId}
                  onFetchTimeSlots={onFetchTimeSlots}
                  monthlyTimeSlots={monthlyTimeSlots}
                  values={values}
                  intl={intl}
                  form={form}
                  pristine={pristine}
                  timeZone={timeZone}
                />
              ) : null}

              {showEstimatedBreakdown ? (
                <div className={css.priceBreakdownContainer}>
                  <h3 className={css.priceBreakdownTitle}>
                    <FormattedMessage id="BookingTimeForm.priceBreakdownTitle" />
                  </h3>
                  <EstimatedCustomerBreakdownMaybe
                    breakdownData={breakdownData}
                    lineItems={lineItems}
                    timeZone={timeZone}
                  />
                </div>
              ) : null}

              {fetchLineItemsInProgress ? <IconSpinner className={css.spinner} /> : null}
              {fetchLineItemsError ? (
                <span className={css.sideBarError}>
                  <FormattedMessage id="BookingTimeForm.fetchLineItemsError" />
                </span>
              ) : null}

              <p className={css.smallPrint}>
                <FormattedMessage
                  id={
                    isOwnListing
                      ? 'BookingTimeForm.ownListing'
                      : 'BookingTimeForm.youWontBeChargedInfo'
                  }
                />
              </p>
              <div className={submitButtonClasses}>
                <PrimaryButton type="submit">
                  <FormattedMessage id="BookingTimeForm.requestToBook" />
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

BookingTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  price: null,
  isOwnListing: false,
  listingId: null,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  price: propTypes.money,
  isOwnListing: bool,
  listingId: propTypes.uuid,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,
  timeZone: string.isRequired,

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
};

const BookingTimeForm = compose(injectIntl)(BookingTimeFormComponent);
BookingTimeForm.displayName = 'BookingTimeForm';

export default BookingTimeForm;

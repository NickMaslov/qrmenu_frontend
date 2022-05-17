import React, { useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

import { createPaymentIntent } from '../apis';
import AuthContext from '../contexts/AuthContext';

const PaymentForm = ({ amount, items, onDone, color }) => {
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const auth = useContext(AuthContext);
  const params = useParams();

  const onSubmit = async (event) => {
    event.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (!error) {
      console.log('here', {
        payment_method: paymentMethod,
        amount,
        place: params.id,
        table: params.table,
        detail: items,
      });
      setLoading(true);
      const json = await createPaymentIntent(
        {
          payment_method: paymentMethod,
          amount,
          place: params.id,
          table: params.table,
          detail: items,
        },
        auth.token
      );

      console.log(json);

      if (json?.success) {
        toast(`Your order #${json.order} is processing`, { type: 'success' });
        onDone();
        setLoading(false);
      } else if (json?.error) {
        toast(json.error, { type: 'error' });
        setLoading(false);
      }
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <CardElement options={{ hidePostalCode: true }} />
      <Button
        variant='standard'
        style={{ backgroundColor: color }}
        className='mt-4'
        block
        type='submit'
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay'}
      </Button>
    </Form>
  );
};

const stripePromise = loadStripe(
  'pk_test_51L0JatC3pkDU7Lg0NIDcRrqfYwy7FfXdxBFRA5Msfj46AF9ESD85xbv9yf5C9MHtWke13UmM1TsG6JN814d116hP00CbbMxuv0'
);

const StripeContext = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);

export default StripeContext;

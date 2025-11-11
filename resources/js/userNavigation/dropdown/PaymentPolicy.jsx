// resources/js/userNavigation/PaymentPolicy.jsx
import React from "react";
import "../../../css/usernav/dropdown/PaymentPolicy.css";

export default function PaymentPolicy() {
  return (
    <div className="payment-policy-container">
      <h1 className="policy-title">Payment Policy</h1>
      <h3 className="policy-subtitle">Event Sound Pro</h3>
      <p className="last-updated">Last Updated: October 10, 2025</p>
      <hr />

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to the Event Sound Pro! This Payment Policy explains how payments are
          processed for event sound reservations. By using our System, you agree to the terms outlined below.
        </p>
      </section>

      <section>
        <h2>2. Accepted Payment Method</h2>
        <p>
          Our system currently accepts <strong>GCash payments</strong> for down payments only. The remaining balance is
          paid in <strong>cash on the day of your event</strong> directly to the sound team or event coordinator.
        </p>
      </section>

      <section>
        <h2>3. Reservation and Down Payment</h2>
        <p>
          To proceed with your booking, a <strong>40% down payment</strong> of the total service fee must first be paid via <strong>GCash</strong>. 
          You are required to upload your <strong>proof of payment</strong> before submitting a reservation request.
        </p>
        <ul>
          <li>Upload a clear screenshot or photo of your GCash receipt in the Payments section of your dashboard before confirming your reservation.</li>
          <li>Reservations without a verified down payment will <strong>not be processed</strong> or considered valid.</li>
          <li>Once your payment is verified by the administrator, your reservation will be officially confirmed and added to the schedule</li>
        </ul>
      </section>

      <section>
        <h2>4. Remaining Balance (Cash Payment)</h2>
        <ul>
          <li>The remaining 60% balance is payable in cash on the day of your event.</li>
          <li>Please hand the payment directly to the sound technician or authorized staff before the event begins.</li>
          <li>A receipt or confirmation will be issued once payment is received.</li>
          <li>Failure to settle the remaining balance may result in service disruption or cancellation of the event.</li>
        </ul>
      </section>

      <section>
        <h2>5. Proof of Payment Submission (Down Payment)</h2>
        <ol>
          <li>Take a clear screenshot or photo of your transaction receipt.</li>
          <li>Upload it in the reservation book and review section.</li>
          <li>You cannot proceed on submitting the reservation, if you will not upload the gcash receipt.</li>
          <li>Wait for an official confirmation of verification.</li>
        </ol>
      </section>

      <section>
        <h2>6. Cancellations and Refunds</h2>
        <ul>
          <li>Cancellations are only allowed while the reservation status is <strong>Pending</strong>. Once your booking is <strong>Approved</strong>, it can no longer be cancelled or refunded.</li>
          <li>If a cancellation request is made while the reservation is still pending, a <strong>50% refund</strong> of the down payment will be issued.</li>
          <li>Cancellations made after the booking has been approved are <strong>not eligible for any refund</strong>, as your slot and schedule are already secured.</li>
          <li>Refunds (if applicable) will be processed within <strong>1–2 business days</strong> through <strong>GCash</strong>, sent to the same account used for payment.</li>
        </ul>
      </section>

      <section>
        <h2>7. Policy Updates</h2>
        <p>
          This policy may be updated from time to time to improve our service. Updates will be posted within the System,
          and continued use means you accept the latest version.
        </p>
      </section>
    </div>
  );
}

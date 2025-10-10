// resources/js/userNavigation/PaymentPolicy.jsx
import React from "react";
import "../../../css/usernav/dropdown/PaymentPolicy.css";

export default function PaymentPolicy() {
  return (
    <div className="payment-policy-container">
      <h1 className="policy-title">Payment Policy</h1>
      <h3 className="policy-subtitle">Event Sound Scheduling and Reservation System</h3>
      <p className="last-updated">Last Updated: October 10, 2025</p>
      <hr />

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to the Event Sound Scheduling and Reservation System! This Payment Policy explains how payments are
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
          To secure your booking, a <strong>50% down payment</strong> of the total service fee must be made via GCash
          within <strong>48 hours</strong> after your reservation is approved.
        </p>
        <ul>
          <li>Proof of payment (screenshot or photo of the GCash receipt) must be uploaded in the Payments section of your dashboard or submitted to the administrator.</li>
          <li>If no proof of payment is received within 48 hours, your reservation will be automatically cancelled.</li>
          <li>Once verified, you will receive confirmation that your booking is officially secured.</li>
        </ul>
      </section>

      <section>
        <h2>4. Remaining Balance (Cash Payment)</h2>
        <ul>
          <li>The remaining 50% balance is payable in cash on the day of your event.</li>
          <li>Please hand the payment directly to the sound technician or authorized staff before the event begins.</li>
          <li>A receipt or confirmation will be issued once payment is received.</li>
          <li>Failure to settle the remaining balance may result in service disruption or cancellation of the event.</li>
        </ul>
      </section>

      <section>
        <h2>5. Proof of Payment Submission (Down Payment)</h2>
        <ol>
          <li>Take a clear screenshot or photo of your transaction receipt.</li>
          <li>Upload it in the Payment section of your user dashboard or send it directly to the administrator.</li>
          <li>Wait for an official confirmation of verification.</li>
        </ol>
      </section>

      <section>
        <h2>6. Cancellations and Refunds</h2>
        <ul>
          <li>Cancellations made at least 7 days before the event date are eligible for a 50% refund of the down payment.</li>
          <li>If the booking was made less than 7 days before the event, users may cancel within 24 hours of booking for a 50% refund.</li>
          <li>Cancellations made after this period are non-refundable.</li>
          <li>Refunds (if applicable) are processed within 1–2 business days through GCash using the same account number.</li>
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

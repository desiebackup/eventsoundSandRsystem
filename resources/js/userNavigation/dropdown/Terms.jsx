// resources/js/userNavigation/TermsAndConditions.jsx
import React from "react";
import "../../../css/usernav/dropdown/Terms.css";

export default function Terms() {
  return (
    <div className="terms-container">
      <h1 className="terms-title">Terms and Conditions</h1>
      <h3 className="terms-subtitle">
        Event Sound Pro
      </h3>
      <p className="last-updated">Last Updated: October 10, 2025</p>
      <hr />

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to the Event Sound Pro. By
          accessing or using this platform, you agree to comply with and be
          bound by these Terms and Conditions (“Terms”). If you do not agree with
          these Terms, you may not use or access the System.
        </p>
      </section>

      <section>
        <h2>2. User Accounts</h2>
        <ul>
          <li>
            Users are required to register an account to access reservation and
            scheduling services.
          </li>
          <li>
            You agree to provide accurate, current, and complete information
            during registration and to update such information as necessary.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities under your account.
          </li>
          <li>
            The Administrator reserves the right to suspend or terminate
            accounts found to be in violation of these Terms or engaged in
            fraudulent or unauthorized activities.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Reservation Policy</h2>
        <ul>
          <li>
            Reservations must be made through the System at least one (1) week
            before the event date.
          </li>
          <li>
            All bookings are subject to availability and approval by the
            Administrator.
          </li>
          <li>
            Users must provide accurate event information, including date, time,
            venue, and type of event.
          </li>
          <li>Cancellations are only allowed while the reservation status is <strong>Pending</strong>. 
          Once your booking is <strong>Approved</strong>, it can no longer be cancelled or refunded.</li>
        </ul>
      </section>

      <section>
        <h2>4. Usage Guidelines</h2>
        <ul>
          <li>Use the System only for lawful and authorized purposes.</li>
          <li>
            Refrain from tampering, hacking, or attempting to disrupt the
            System’s functionality.
          </li>
          <li>
            Handle all sound equipment responsibly and return it in proper
            working condition. Any damage or loss will incur charges.
          </li>
          <li>
            Follow all operational rules and instructions provided by the sound
            team or administrators.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Fees and Payments</h2>
        <ul>
          <li>
            Applicable service fees and deposits must be settled through
            authorized payment methods.
          </li>
          <li>
            Failure to complete payment within the specified time frame may
            result in automatic cancellation.
          </li>
          <li>
            Refunds will not be issued after the reservation deadline unless
            explicitly approved by the Administrator.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Cancellation and Refund Policy</h2>
        <ul>
          <li>Users may cancel reservations within the allowed timeframe.</li>
          <li>
            Approved refunds (if applicable) may take one (1) to two (2)
            business days to process.
          </li>
          <li>
            The Administrator reserves the right to decline reservations due to
            unforeseen circumstances such as equipment failure or technical
            issues.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Liability</h2>
        <ul>
          <li>
            The System serves as a management tool and does not guarantee event
            outcomes or sound quality.
          </li>
          <li>
            The Administrators are not liable for losses or damages from
            cancellations or misuse of the System.
          </li>
          <li>
            Users are responsible for any loss or damage to equipment during
            their event.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Privacy and Data Protection</h2>
        <ul>
          <li>
            User data is collected and processed solely for reservation
            management and service improvement.
          </li>
          <li>
            Personal data will not be shared with third parties without consent,
            except when required by law.
          </li>
        </ul>
      </section>

      <section>
        <h2>9. Policy Updates</h2>
        <p>
          These Terms may be updated periodically to reflect improvements or
          regulatory requirements. Continued use of the System constitutes
          acceptance of the latest Terms.
        </p>
      </section>
    </div>
  );
}

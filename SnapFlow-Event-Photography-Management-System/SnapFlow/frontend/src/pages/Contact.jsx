export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-dark-900 mb-6">Contact Us</h1>
      <div className="card space-y-4 text-dark-600">
        <p><strong className="text-dark-900">Address:</strong> Colombo, Sri Lanka</p>
        <p><strong className="text-dark-900">Email:</strong> info@lankamoments.lk</p>
        <p><strong className="text-dark-900">Phone:</strong> +94 11 234 5678</p>
        <p className="text-sm text-dark-500 pt-4 border-t border-dark-100">
          For booking inquiries, please create an account and submit a booking request through the platform,
          or contact our Customer Relations team.
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'What are peptides?',
      answer: 'Peptides are short chains of amino acids that play various roles in biological processes. They are used in research and have potential applications in health and wellness.'
    },
    {
      question: 'Are your products safe?',
      answer: 'All our products are manufactured in certified facilities and undergo rigorous quality control. However, our products are for research purposes only and not intended for human consumption unless approved by relevant authorities.'
    },
    {
      question: 'How do I store peptides?',
      answer: 'Most peptides should be stored in a freezer at -20°C. Always refer to the specific storage instructions provided with each product. Protect from light and moisture.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept payments through our secure B2BINPAY On-Ramp payment gateway, which supports various payment methods including credit cards and cryptocurrency.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Shipping times vary depending on your location. Typically, orders are processed within 1-2 business days, and shipping takes 3-7 business days for domestic orders.'
    },
    {
      question: 'Can I return or refund my order?',
      answer: 'We accept returns within 30 days of purchase for unopened products in their original packaging. Please contact our support team to initiate a return.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to many countries worldwide. Shipping costs and delivery times vary by location. Please check during checkout for available shipping options to your country.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your information with third parties except as necessary for order fulfillment.'
    },
    {
      question: 'Do I need an account to make a purchase?',
      answer: 'No, you can make purchases as a guest. However, creating an account allows you to track orders, save your information for faster checkout, and access order history.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package through the shipping carrier\'s website.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {faq.question}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Still have questions?</h2>
          <p className="text-gray-700 mb-4">
            If you couldn't find the answer you're looking for, please{' '}
            <a href="/contact" className="text-blue-600 hover:underline font-semibold">contact us</a>{' '}
            and we'll be happy to help!
          </p>
        </div>
      </div>
    </div>
  );
}


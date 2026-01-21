export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <p>
            Welcome to PeptideStore, your trusted source for premium peptide products. We are
            dedicated to providing high-quality peptides for research and wellness purposes,
            backed by rigorous quality control and customer satisfaction.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p>
            Our mission is to make high-quality peptide products accessible to researchers,
            healthcare professionals, and individuals who are committed to advancing their
            understanding of peptides and their potential benefits. We believe in transparency,
            quality, and customer service.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Quality Assurance</h2>
          <p>
            All our products undergo strict quality control measures to ensure purity and
            authenticity. We work with certified laboratories and follow industry best practices
            to guarantee that every product meets our high standards.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment</h2>
          <p>
            We are committed to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Providing products of the highest quality and purity</li>
            <li>Ensuring secure and reliable payment processing</li>
            <li>Maintaining transparent communication with our customers</li>
            <li>Offering excellent customer support</li>
            <li>Protecting customer privacy and data security</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
          <p>
            If you have any questions or concerns, please don't hesitate to{' '}
            <a href="/contact" className="text-blue-600 hover:underline">contact us</a>.
            We're here to help!
          </p>
        </div>
      </div>
    </div>
  );
}


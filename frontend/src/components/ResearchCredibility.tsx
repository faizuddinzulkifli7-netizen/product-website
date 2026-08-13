const credibilityPoints = [
  {
    title: 'Featured in Research Publications',
    description: 'Compounds referenced in peer-reviewed literature and independent research writeups.',
  },
  {
    title: 'Used by Academic Institutions',
    description: 'Trusted by university and private laboratories for controlled research settings.',
  },
  {
    title: 'Verified by Independent Labs',
    description: 'Every batch is verified by third-party laboratories, not just our own internal testing.',
  },
];

export default function ResearchCredibility() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Trusted for Research</h2>
      <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
        We hold our catalog to the standards research institutions expect.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {credibilityPoints.map((point) => (
          <div key={point.title} className="text-center px-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{point.title}</h3>
            <p className="text-sm text-gray-600">{point.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

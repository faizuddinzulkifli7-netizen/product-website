import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  titleClassName?: string;
}

export default function Section({
  children,
  title,
  className = '',
  titleClassName = '',
}: SectionProps) {
  return (
    <section className={className}>
      {title && (
        <h2 className={`text-2xl font-semibold text-gray-900 mb-6 ${titleClassName}`}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}


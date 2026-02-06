import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps): React.ReactElement {
  return (
    <div className="border-b border-gray-200 pb-6 pt-10">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-lg text-gray-600">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-4 flex md:ml-4 md:mt-0">
            {children}
        </div>
      )}
    </div>
  );
}

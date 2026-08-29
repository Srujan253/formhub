import React from 'react';

// Base shimmer block — the core building block
export const SkeletonBlock = ({ className = '', style = {} }) => (
  <div
    className={`skeleton-shimmer rounded-xl ${className}`}
    style={style}
  />
);

// Single form card skeleton
export const FormCardSkeleton = () => (
  <div className="card p-5 space-y-4">
    {/* Header row */}
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-5 w-3/4 rounded-lg" />
        <SkeletonBlock className="h-3.5 w-1/2 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-8 rounded-xl flex-shrink-0 ml-3" />
    </div>
    {/* Description lines */}
    <div className="space-y-1.5">
      <SkeletonBlock className="h-3 w-full rounded-md" />
      <SkeletonBlock className="h-3 w-5/6 rounded-md" />
    </div>
    {/* Footer row */}
    <div className="flex items-center justify-between pt-1">
      <SkeletonBlock className="h-6 w-20 rounded-full" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-8 w-8 rounded-xl" />
        <SkeletonBlock className="h-8 w-8 rounded-xl" />
        <SkeletonBlock className="h-8 w-8 rounded-xl" />
      </div>
    </div>
  </div>
);

// Grid of form card skeletons
export const FormGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <FormCardSkeleton key={i} />
    ))}
  </div>
);

// Response dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
    {/* Back + title */}
    <div className="flex items-center gap-4">
      <SkeletonBlock className="h-8 w-24 rounded-xl" />
      <SkeletonBlock className="h-8 w-56 rounded-xl" />
    </div>
    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <SkeletonBlock className="h-4 w-20 rounded-lg" />
          <SkeletonBlock className="h-8 w-12 rounded-xl" />
        </div>
      ))}
    </div>
    {/* Chart area */}
    <div className="card p-6 space-y-4">
      <SkeletonBlock className="h-5 w-40 rounded-lg" />
      <SkeletonBlock className="h-48 w-full rounded-2xl" />
    </div>
    {/* Question blocks */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="card p-6 space-y-4">
        <SkeletonBlock className="h-4 w-2/3 rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <SkeletonBlock className="h-3 rounded-full" style={{ width: `${Math.random() * 50 + 20}%` }} />
              <SkeletonBlock className="h-3 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// FormBuilder question list skeleton
export const FormBuilderSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
    {/* Title card */}
    <div className="card p-6 space-y-4">
      <SkeletonBlock className="h-7 w-40 rounded-xl" />
      <SkeletonBlock className="h-12 w-full rounded-xl" />
      <SkeletonBlock className="h-24 w-full rounded-xl" />
    </div>
    {/* Question cards */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="card p-5 border-l-4 border-gray-200 space-y-4">
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
          <SkeletonBlock className="h-10 w-32 rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-full rounded-xl" />
          <SkeletonBlock className="h-8 w-4/5 rounded-xl" />
          <SkeletonBlock className="h-8 w-3/5 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// Public form view skeleton
export const PublicFormSkeleton = () => (
  <div className="min-h-screen flex items-start justify-center pt-10 px-4">
    <div className="w-full max-w-2xl space-y-5">
      {/* Header */}
      <div className="card p-8 space-y-3">
        <SkeletonBlock className="h-8 w-3/4 rounded-xl" />
        <SkeletonBlock className="h-4 w-full rounded-lg" />
        <SkeletonBlock className="h-4 w-2/3 rounded-lg" />
      </div>
      {/* Questions */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-6 space-y-4">
          <SkeletonBlock className="h-5 w-3/4 rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <SkeletonBlock className="h-5 w-5 rounded-full flex-shrink-0" />
                <SkeletonBlock className="h-4 w-40 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Email groups page skeleton
export const EmailGroupsSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-8 w-48 rounded-xl" />
      <SkeletonBlock className="h-10 w-36 rounded-xl" />
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-36 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-24 rounded-md" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
            <SkeletonBlock className="h-8 w-8 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 4 }).map((_, j) => (
            <SkeletonBlock key={j} className="h-6 w-28 rounded-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Generic table skeleton (for AdminPanel)
export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="card overflow-hidden">
    {/* Header */}
    <div className="flex gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className="h-4 flex-1 rounded-md" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
        {Array.from({ length: cols }).map((_, j) => (
          <SkeletonBlock key={j} className="h-4 flex-1 rounded-md" style={{ opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    ))}
  </div>
);

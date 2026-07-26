import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800/60 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-gray-100 dark:border-white/[0.05]">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <Skeleton className="h-4 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export default Skeleton;

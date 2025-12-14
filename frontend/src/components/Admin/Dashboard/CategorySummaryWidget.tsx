"use client";
import React from "react";
import { BriefcaseIcon, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CategorySummary {
  id: string;
  name: string;
  jobsCount: number;
}

interface CategorySummaryWidgetProps {
  categories: CategorySummary[];
  onCreateCategory: () => void;
}

const CategorySummaryWidget: React.FC<CategorySummaryWidgetProps> = ({
  categories,
  onCreateCategory,
}) => {
  const router = useRouter();

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Top categories</h2>
          <p className="text-xs text-gray-500">Categories with the most jobs (up to 5)</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
          <BriefcaseIcon className="h-4 w-4 text-gray-700" />
        </div>
      </div>
      
      {categories.length === 0 ? (
        <p className="text-sm text-gray-600">No categories have been created yet.</p>
      ) : (
        <dl className="space-y-2 text-sm max-h-52 overflow-y-auto pr-1">
          {categories.slice(0, 5).map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <dt className="text-gray-900 truncate pr-2">{cat.name}</dt>
              <dd className="text-xs font-medium text-gray-700">
                {cat.jobsCount} job{cat.jobsCount === 1 ? "" : "s"}
              </dd>
            </div>
          ))}
        </dl>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/admin/categories")}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Manage categories
        </button>
        <button
          onClick={onCreateCategory}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Create category
        </button>
      </div>
    </div>
  );
};

export default CategorySummaryWidget;
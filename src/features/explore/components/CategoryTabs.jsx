export function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => onChange('For You')}
        className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-primary-500 text-white shadow-sm"
      >
        For You
      </button>
    </div>
  );
}

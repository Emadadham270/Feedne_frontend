export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-tertiary-50 dark:from-secondary-900 dark:via-[#0F1117] dark:to-tertiary-900/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-extrabold text-primary-500 tracking-tight">feedne</span>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm">
            Share your story with the world
          </p>
        </div>
        <div className="card p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-4",
};

const Spinner = ({ size = "md", className = "" }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`animate-spin rounded-full border-indigo-500 border-t-transparent ${sizeMap[size]} ${className}`}
  />
);

export default Spinner;

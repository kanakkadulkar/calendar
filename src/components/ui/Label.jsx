export const Label = ({ children, ...props }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1" {...props}>
      {children}
    </label>
  );
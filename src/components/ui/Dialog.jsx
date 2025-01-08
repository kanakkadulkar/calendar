export const Dialog = ({ open, onOpenChange, children }) => (
    open ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          {children}
        </div>
      </div>
    ) : null
  );
  
  export const DialogContent = ({ children }) => <div>{children}</div>;
  export const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
  export const DialogTitle = ({ children }) => <h2 className="text-xl font-bold mb-4">{children}</h2>;
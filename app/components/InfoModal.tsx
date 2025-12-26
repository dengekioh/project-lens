"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InfoModal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            ℹ️ {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl">
            &times;
          </button>
        </div>
        
        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto text-gray-300 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
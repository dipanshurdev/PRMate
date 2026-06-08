import { ClipLoader } from "react-spinners";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <ClipLoader size={50} color="#3b82f6" />
        <p className="text-lg font-medium text-gray-600">{message}</p>
      </div>
    </div>
  );
}

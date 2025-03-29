import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Our AI experts are crafting your perfect itineraries..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="relative w-16 h-16">
        <Loader2 className="animate-spin w-16 h-16 text-muted-foreground" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 bg-primary rounded-full"></span>
        </div>
      </div>
      <p className="text-muted-foreground max-w-md">
        {message}
      </p>
    </div>
  );
}
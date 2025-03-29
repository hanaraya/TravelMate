export default function LoadingState({ message = "Our AI experts are crafting your perfect itineraries..." }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex space-x-2">
        <div className="w-4 h-4 bg-primary rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
        <div className="w-4 h-4 bg-primary rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
        <div className="w-4 h-4 bg-primary rounded-full animate-[bounce_1s_infinite_0.3s]"></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

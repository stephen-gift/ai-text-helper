import { Card, CardContent } from "@/components/ui/card";

export function NotSupportedComponent() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          Your browser doesn&apos;t support the Translation API. Please try
          using Chrome or Edge.
        </div>
      </CardContent>
    </Card>
  );
}

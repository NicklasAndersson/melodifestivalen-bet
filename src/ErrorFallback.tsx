import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Ett fel har uppstått</AlertTitle>
          <AlertDescription>
            Något oväntat hände när applikationen skulle starta. Prova att ladda om sidan.
          </AlertDescription>
        </Alert>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Feldetaljer:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error?.message || 'Okänt fel'}
          </pre>
        </div>
        
        <Button 
          onClick={() => window.location.reload()} 
          className="w-full"
          variant="outline"
        >
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Ladda om sidan
        </Button>
      </div>
    </div>
  );
}

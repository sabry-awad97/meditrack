import { useAppUpdater } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ManualUpdateCheck() {
  const { update, checking, error, checkForUpdates } = useAppUpdater();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          التحديثات
        </CardTitle>
        <CardDescription>تحقق من وجود تحديثات جديدة للتطبيق</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!update && !error && !checking && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>التطبيق محدث إلى أحدث إصدار</AlertDescription>
          </Alert>
        )}

        {update && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              تحديث متاح: الإصدار {update.version}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={checkForUpdates}
            disabled={checking}
            variant="outline"
          >
            {checking && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {checking ? "جاري التحقق..." : "التحقق من التحديثات"}
          </Button>

          <p className="text-xs text-muted-foreground">
            الإصدار الحالي: {import.meta.env.VITE_APP_VERSION || "0.1.0"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

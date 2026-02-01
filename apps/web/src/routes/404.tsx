import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Home,
  ArrowRight,
  ArrowLeft,
  Search,
  FileQuestion,
} from "lucide-react";
import { useTranslation, useDirection } from "@meditrack/i18n";

import { Button } from "@/components/ui/button";
import { Page, PageContent } from "@/components/ui/page";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

export function NotFoundPage() {
  const { t } = useTranslation("common");
  const { isRTL } = useDirection();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Page>
      <PageContent className="flex items-center justify-center p-4 sm:p-6">
        <div className="text-center w-full max-w-2xl">
          {/* Icon and number */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <FileQuestion className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 mx-auto text-muted-foreground/40 mb-2 sm:mb-4" />
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-primary/10 select-none">
                404
              </h1>
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {t("notFound.title")}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto px-4">
              {t("notFound.description")}
            </p>
          </div>

          {/* Useful links */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto"
                nativeButton={false}
                render={(props) => <Link to="/" {...props} />}
              >
                <Home className="h-5 w-5" />
                {t("notFound.backToHome")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto"
                nativeButton={false}
                render={(props) => <Link to="/special-orders" {...props} />}
              >
                <Search className="h-5 w-5" />
                {t("navigation.orders")}
              </Button>
            </div>

            {/* Quick links */}
            <div className="pt-6 sm:pt-8 border-t border-dashed">
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                {t("notFound.goTo")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  nativeButton={false}
                  render={(props) => <Link to="/special-orders" {...props} />}
                >
                  {t("navigation.orders")}
                  <ArrowIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  nativeButton={false}
                  render={(props) => <Link to="/suppliers" {...props} />}
                >
                  {t("navigation.suppliers")}
                  <ArrowIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  nativeButton={false}
                  render={(props) => <Link to="/reports" {...props} />}
                >
                  {t("navigation.reports")}
                  <ArrowIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}

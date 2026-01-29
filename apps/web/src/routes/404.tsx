import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Home,
  ArrowRight,
  ArrowLeft,
  Search,
  FileQuestion,
} from "lucide-react";
import { useTranslation, useDirection } from "@medi-order/i18n";

import { Button } from "@/components/ui/button";
import { Page, PageContent, PageContentInner } from "@/components/ui/page";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const { t } = useTranslation("common");
  const { isRTL } = useDirection();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Page>
      <PageContent>
        <PageContentInner className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6 py-16">
            {/* Icon and number */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <FileQuestion className="h-32 w-32 mx-auto text-muted-foreground/40 mb-4" />
                <h1 className="text-9xl font-bold text-primary/10 select-none">
                  404
                </h1>
              </div>
            </div>

            {/* Title and description */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-bold">{t("notFound.title")}</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {t("notFound.description")}
              </p>
            </div>

            {/* Useful links */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  render={(props) => <Link to="/" {...props} />}
                >
                  <Home className="h-5 w-5" />
                  {t("notFound.backToHome")}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  render={(props) => <Link to="/special-orders" {...props} />}
                >
                  <Search className="h-5 w-5" />
                  {t("navigation.orders")}
                </Button>
              </div>

              {/* Quick links */}
              <div className="pt-8 border-t border-dashed">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("notFound.goTo")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    render={(props) => <Link to="/special-orders" {...props} />}
                  >
                    {t("navigation.orders")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    render={(props) => <Link to="/suppliers" {...props} />}
                  >
                    {t("navigation.suppliers")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    render={(props) => <Link to="/reports" {...props} />}
                  >
                    {t("navigation.reports")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PageContentInner>
      </PageContent>
    </Page>
  );
}

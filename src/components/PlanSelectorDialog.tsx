import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogProduct, CatalogPlan } from "@/lib/catalog";

interface PlanSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: CatalogProduct | null;
  onSelectPlan: (product: CatalogProduct, plan: CatalogPlan) => void;
}

const PlanSelectorDialog = ({ open, onOpenChange, product, onSelectPlan }: PlanSelectorDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Select a Plan
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 mb-4">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-foreground">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
        </div>
        <div className="space-y-2">
          {product.plans.map((plan) => (
            <button
              key={plan.key}
              onClick={() => onSelectPlan(product, plan)}
              className={cn(
                "w-full flex items-center justify-between rounded-lg border-2 border-border p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{plan.label}</span>
                  {plan.badge && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{plan.subLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-foreground">₹{plan.price}</span>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectorDialog;

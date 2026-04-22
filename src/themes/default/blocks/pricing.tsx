'use client';

import { useEffect, useState } from 'react';
import { Check, Lightbulb, Loader2, SendHorizonal, Zap } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SmartIcon } from '@/shared/blocks/common';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAppContext } from '@/shared/contexts/app';
import { getCookie } from '@/shared/lib/cookie';
import { cn } from '@/shared/lib/utils';
import { Subscription } from '@/shared/models/subscription';
import {
  PricingCurrency,
  PricingItem,
  Pricing as PricingType,
} from '@/shared/types/blocks/pricing';

// Helper function to get all available currencies from a pricing item
function getCurrenciesFromItem(item: PricingItem | null): PricingCurrency[] {
  if (!item) return [];

  // Always include the default currency first
  const defaultCurrency: PricingCurrency = {
    currency: item.currency,
    amount: item.amount,
    price: item.price || '',
    original_price: item.original_price || '',
  };

  // Add additional currencies if available
  if (item.currencies && item.currencies.length > 0) {
    return [defaultCurrency, ...item.currencies];
  }

  return [defaultCurrency];
}

// Helper function to select initial currency based on locale
function getInitialCurrency(
  currencies: PricingCurrency[],
  locale: string,
  defaultCurrency: string
): string {
  if (currencies.length === 0) return defaultCurrency;

  // Otherwise return default currency
  return defaultCurrency;
}

export function Pricing({
  pricing,
  className,
  currentSubscription,
}: {
  pricing: PricingType;
  className?: string;
  currentSubscription?: Subscription;
}) {
  const locale = useLocale();
  const t = useTranslations('pages.pricing.messages');
  const {
    user,
    isShowPaymentModal,
    setIsShowSignModal,
    setIsShowPaymentModal,
    configs,
  } = useAppContext();

  const [group, setGroup] = useState(() => {
    // find current pricing item
    const currentItem = pricing.items?.find(
      (i) => i.product_id === currentSubscription?.productId
    );

    // First look for a group with is_featured set to true
    const featuredGroup = pricing.groups?.find((g) => g.is_featured);
    // If no featured group exists, fall back to the first group
    return (
      currentItem?.group || featuredGroup?.name || pricing.groups?.[0]?.name
    );
  });

  // current pricing item
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  // Currency state management for each item
  // Store selected currency and displayed item for each product_id
  const [itemCurrencies, setItemCurrencies] = useState<
    Record<string, { selectedCurrency: string; displayedItem: PricingItem }>
  >({});

  // Initialize currency states for all items
  useEffect(() => {
    if (pricing.items && pricing.items.length > 0) {
      const initialCurrencyStates: Record<
        string,
        { selectedCurrency: string; displayedItem: PricingItem }
      > = {};

      pricing.items.forEach((item) => {
        const currencies = getCurrenciesFromItem(item);
        const selectedCurrency = getInitialCurrency(
          currencies,
          locale,
          item.currency
        );

        // Create displayed item with selected currency
        const currencyData = currencies.find(
          (c) => c.currency.toLowerCase() === selectedCurrency.toLowerCase()
        );

        const displayedItem = currencyData
          ? {
              ...item,
              currency: currencyData.currency,
              amount: currencyData.amount,
              price: currencyData.price,
              original_price: currencyData.original_price,
              // Override with currency-specific payment settings if available
              payment_product_id:
                currencyData.payment_product_id || item.payment_product_id,
              payment_providers:
                currencyData.payment_providers || item.payment_providers,
            }
          : item;

        initialCurrencyStates[item.product_id] = {
          selectedCurrency,
          displayedItem,
        };
      });

      setItemCurrencies(initialCurrencyStates);
    }
  }, [pricing.items, locale]);

  // Handler for currency change
  const handleCurrencyChange = (productId: string, currency: string) => {
    const item = pricing.items?.find((i) => i.product_id === productId);
    if (!item) return;

    const currencies = getCurrenciesFromItem(item);
    const currencyData = currencies.find(
      (c) => c.currency.toLowerCase() === currency.toLowerCase()
    );

    if (currencyData) {
      const displayedItem = {
        ...item,
        currency: currencyData.currency,
        amount: currencyData.amount,
        price: currencyData.price,
        original_price: currencyData.original_price,
        // Override with currency-specific payment settings if available
        payment_product_id:
          currencyData.payment_product_id || item.payment_product_id,
        payment_providers:
          currencyData.payment_providers || item.payment_providers,
      };

      setItemCurrencies((prev) => ({
        ...prev,
        [productId]: {
          selectedCurrency: currency,
          displayedItem,
        },
      }));
    }
  };

  const handlePayment = async (item: PricingItem) => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    // Use displayed item with selected currency
    const displayedItem =
      itemCurrencies[item.product_id]?.displayedItem || item;

    if (configs.select_payment_enabled === 'true') {
      setPricingItem(displayedItem);
      setIsShowPaymentModal(true);
    } else {
      handleCheckout(displayedItem, configs.default_payment_provider);
    }
  };

  const getAffiliateMetadata = ({
    paymentProvider,
  }: {
    paymentProvider: string;
  }) => {
    const affiliateMetadata: Record<string, string> = {};

    // get Affonso referral
    if (
      configs.affonso_enabled === 'true' &&
      ['stripe', 'creem'].includes(paymentProvider)
    ) {
      const affonsoReferral = getCookie('affonso_referral') || '';
      affiliateMetadata.affonso_referral = affonsoReferral;
    }

    // get PromoteKit referral
    if (
      configs.promotekit_enabled === 'true' &&
      ['stripe'].includes(paymentProvider)
    ) {
      const promotekitReferral =
        typeof window !== 'undefined' && (window as any).promotekit_referral
          ? (window as any).promotekit_referral
          : getCookie('promotekit_referral') || '';
      affiliateMetadata.promotekit_referral = promotekitReferral;
    }

    return affiliateMetadata;
  };

  const handleCheckout = async (
    item: PricingItem,
    paymentProvider?: string
  ) => {
    try {
      if (!user) {
        setIsShowSignModal(true);
        return;
      }

      const affiliateMetadata = getAffiliateMetadata({
        paymentProvider: paymentProvider || '',
      });

      const params = {
        product_id: item.product_id,
        currency: item.currency,
        locale: locale || 'en',
        payment_provider: paymentProvider || '',
        metadata: affiliateMetadata,
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setPricingItem(null);
        setIsShowSignModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`request failed with status ${response.status}`);
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        throw new Error(message);
      }

      const { checkoutUrl } = data;
      if (!checkoutUrl) {
        throw new Error('checkout url not found');
      }

      window.location.href = checkoutUrl;
    } catch (e: any) {
      console.log('checkout failed: ', e);
      toast.error('checkout failed: ' + e.message);

      setIsLoading(false);
      setProductId(null);
    }
  };

  useEffect(() => {
    if (pricing.items) {
      const featuredItem = pricing.items.find((i) => i.is_featured);
      setProductId(featuredItem?.product_id || pricing.items[0]?.product_id);
      setIsLoading(false);
    }
  }, [pricing.items]);

  return (
    <section
      id={pricing.id}
      className={cn('py-24 md:py-36', pricing.className, className)}
    >
      <div className="mx-auto mb-12 px-4 text-center md:px-8">
        {pricing.sr_only_title && (
          <h1 className="sr-only">{pricing.sr_only_title}</h1>
        )}
        <h2 className="mb-6 text-4xl font-serif font-extrabold tracking-tight text-pretty lg:text-6xl">
          {pricing.title}
        </h2>
        <p className="text-muted-foreground mx-auto mb-4 max-w-2xl lg:text-xl opacity-90 leading-relaxed">
          {pricing.description}
        </p>
      </div>

      <div className="container">
        {pricing.groups && pricing.groups.length > 0 && (
          <div className="mx-auto mt-8 mb-16 flex w-full justify-center px-4">
            <Tabs value={group} onValueChange={setGroup} className="w-full md:w-fit overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-fit min-w-full h-11 sm:h-10 p-1 items-center justify-start sm:justify-center">
                {pricing.groups.map((item, i) => {
                  return (
                    <TabsTrigger 
                      key={i} 
                      value={item.name || ''} 
                      className="px-4 py-1.5 text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {item.title}
                      {item.label && (
                        <Badge className="px-1.5 py-0 text-[10px] sm:text-xs font-medium bg-primary/10 text-primary border-primary/20 shrink-0">
                          {item.label}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div
          className="mx-auto mt-0 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {pricing.items?.map((item: PricingItem, idx) => {
            if (item.group && item.group !== group) {
              return null;
            }

            let isCurrentPlan = false;
            if (
              currentSubscription &&
              currentSubscription.productId === item.product_id
            ) {
              isCurrentPlan = true;
            }

            // Get currency state for this item
            const currencyState = itemCurrencies[item.product_id];
            const displayedItem = currencyState?.displayedItem || item;
            const selectedCurrency =
              currencyState?.selectedCurrency || item.currency;
            const currencies = getCurrenciesFromItem(item);

            return (
              <Card key={idx} className={cn(
                "relative mx-auto transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-primary/5 bg-background",
                item.is_featured ? "border-primary/20 shadow-xl shadow-primary/5 ring-2 ring-primary/30" : ""
              )}>
                {item.label && (
                   <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 shadow-xl z-10 font-bold tracking-tight">
                    {item.label}
                  </Badge>
                )}

                <CardHeader className="pt-8 px-8 flex flex-col gap-0 pb-0">
                  <CardTitle>
                    <h3 className="text-xl font-bold tracking-tight mb-2">{item.title}</h3>
                  </CardTitle>

                  <div className="my-4 flex items-center justify-between gap-2 min-h-[50px]">
                    <div className="flex items-baseline text-5xl font-extrabold tracking-tighter">
                      <span className="text-primary drop-shadow-sm">
                        <NumberFlow
                          value={Number(displayedItem.price?.replace(/[^0-9.-]+/g, '') || 0)}
                          format={{
                            style: 'currency',
                            currency: displayedItem.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }}
                        />
                      </span>{' '}
                      {displayedItem.unit && (
                        <span className="text-muted-foreground ml-1 text-sm font-medium opacity-60 uppercase tracking-widest">
                          / {displayedItem.unit}
                        </span>
                      )}
                    </div>

                    {currencies.length > 1 && (
                      <Select
                        value={selectedCurrency}
                        onValueChange={(currency) =>
                          handleCurrencyChange(item.product_id, currency)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="border-primary/20 bg-primary/5 h-8 min-w-[70px] px-3 text-xs font-bold rounded-full"
                        >
                          <SelectValue placeholder="USD" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-primary/10">
                          {currencies.map((currency) => (
                            <SelectItem
                              key={currency.currency}
                              value={currency.currency}
                              className="text-xs font-medium"
                            >
                              {currency.currency.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {displayedItem.original_price && (
                    <p className="text-muted-foreground -mt-2 mb-4 text-sm line-through opacity-50">
                      {displayedItem.original_price}
                    </p>
                  )}

                  <CardDescription className="text-base leading-relaxed opacity-80 min-h-[4.5rem]">
                    {item.description}
                  </CardDescription>

                  <div className="mt-8 mb-8">
                    {isCurrentPlan ? (
                      <Button
                        disabled
                        size="lg"
                        className="w-full rounded-[var(--radius)] font-bold opacity-50 h-12"
                      >
                        {t('current_plan')}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePayment(item)}
                        disabled={isLoading}
                        size="lg"
                        variant={item.is_featured ? 'default' : 'outline'}
                        className={cn(
                          "w-full rounded-[var(--radius)] font-bold transition-all hover:scale-[1.02] h-12 text-base",
                          item.is_featured ? "shadow-lg shadow-primary/30" : "hover:bg-primary/5"
                        )}
                      >
                        {isLoading && item.product_id === productId ? (
                          <>
                            <Loader2 className="mr-2 size-5 animate-spin" />
                            <span>{t('processing')}</span>
                          </>
                        ) : (
                          <>
                            <Zap className={cn("mr-2 size-5", item.is_featured ? "fill-current" : "")} />
                            <span>{item.button?.title}</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pb-10 px-8">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

                  {item.features_title && (
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50">{item.features_title}</p>
                  )}
                  <ul className="space-y-4 text-sm">
                    {item.features?.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 group/item">
                        <div className="bg-primary/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors group-hover/item:bg-primary/20">
                          <Check className="text-primary size-3 stroke-[3px]" />
                        </div>
                        <span className="opacity-80 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <PaymentModal
        isLoading={isLoading}
        pricingItem={pricingItem}
        onCheckout={(item, paymentProvider) =>
          handleCheckout(item, paymentProvider)
        }
      />
    </section>
  );
}

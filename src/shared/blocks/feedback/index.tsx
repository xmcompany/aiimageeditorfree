
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";

export default function Feedback() {
  const t = useTranslations("common.feedback");
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error(t("error_empty"));
      return;
    }

    try {
      setLoading(true);
      const resp = await fetch("/api/feedback/add", {
        method: "POST",
        body: JSON.stringify({ content: feedback, rating }),
      });

      const data = await resp.json();
      
      if (resp.status === 401 || data.code === 401 || data.message === 'no auth') {
         toast.error(t("error_sign_in"));
         window.location.href = '/sign-in'; 
         return;
      }

      if (data.code !== 0) {
        toast.error(data.message || t("error_failed"));
        return;
      }

      toast.success(t("success"));
      setFeedback("");
      setRating(10);
      setOpen(false);
    } catch (error) {
      toast.error(t("error_failed"));
    } finally {
      setLoading(false);
    }
  };

  const ratings = [
    { emoji: "😞", value: 1 },
    { emoji: "😐", value: 5 },
    { emoji: "😊", value: 10 },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 text-foreground">
            <Textarea
              placeholder={t("placeholder")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[150px] text-base resize-none"
            />
          </div>

          <div className="mt-4 flex flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              {t("rating_label")}
            </p>
            <div className="flex flex-row gap-2">
              {ratings.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setRating(item.value)}
                  className={`p-2 text-2xl rounded-lg hover:bg-secondary transition-colors ${
                    rating === item.value ? "bg-secondary" : ""
                  }`}
                  type="button"
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
             <Button onClick={handleSubmit} disabled={loading}>
                {loading ? t("submitting") : t("submit")}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

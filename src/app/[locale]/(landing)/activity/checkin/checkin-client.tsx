'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Gift, Users, Copy, Check, Flame, Coins } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface ReferralItem {
  id: string;
  status: string;
  rewardCredits: number;
  rewardedAt: string | null;
  createdAt: string;
  referee: { name: string | null; email: string | null } | null;
}

interface CheckinClientProps {
  checkedInToday: boolean;
  streak: number;
  history: { date: string; credits: number; streak: number }[];
  config: {
    week1Credits: number;
    week2Credits: number;
    week3Credits: number;
    maxCredits: number;
    referralRewardRate: number;
    referralMaxCredits: number;
    referralRewardDays: number;
  };
  referralCode: string;
  referralUrl: string;
  referrals?: ReferralItem[];
}

export default function CheckinClient({
  checkedInToday: initialCheckedIn,
  streak: initialStreak,
  history,
  config,
  referralCode,
  referralUrl,
  referrals = [],
}: CheckinClientProps) {
  const [checkedInToday, setCheckedInToday] = useState(initialCheckedIn);
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build calendar for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const checkedDates = new Set(history.map(h => h.date));

  const handleCheckin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkin', { method: 'POST' });
      const data = await res.json();
      if (data.code === 0) {
        setCheckedInToday(true);
        setStreak(data.data.streak);
        toast.success(`+${data.data.credits} credits! Day ${data.data.streak} streak 🔥`);
      } else {
        toast.error(data.message || 'Check-in failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  const getCreditsForDay = (day: number) => {
    if (day <= 7) return config.week1Credits;
    if (day <= 14) return config.week2Credits;
    return config.week3Credits;
  };

  const monthName = today.toLocaleString('en', { month: 'long', year: 'numeric' });

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Daily Check-in</h1>
        <p className="text-muted-foreground mt-1">Check in every day to earn free credits. Resets daily at midnight PT (Pacific Time).</p>
      </div>

      {/* Check-in card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Today's Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current streak</p>
                <p className="text-3xl font-bold">{streak} <span className="text-base font-normal text-muted-foreground">days</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Today's reward</p>
                <p className="text-3xl font-bold text-primary">+{getCreditsForDay(streak + (checkedInToday ? 0 : 1))}</p>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckin}
              disabled={checkedInToday || loading}
            >
              <Gift className="mr-2 h-4 w-4" />
              {checkedInToday ? '✓ Checked in today' : loading ? 'Checking in...' : 'Check In Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Reward schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reward Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Week 1 (Day 1–7)', credits: config.week1Credits, active: streak < 7 },
                { label: 'Week 2 (Day 8–14)', credits: config.week2Credits, active: streak >= 7 && streak < 14 },
                { label: 'Week 3+ (Day 15+)', credits: config.week3Credits, active: streak >= 14 },
              ].map((row) => (
                <div key={row.label} className={`flex items-center justify-between rounded-lg px-3 py-2 ${row.active ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                  <span className="text-sm font-medium">{row.label}</span>
                  <Badge variant={row.active ? 'default' : 'secondary'}>+{row.credits} credits/day</Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">Max {config.maxCredits} credits total from check-ins. Streak resets if you miss a day.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>{monthName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-xs text-muted-foreground py-1 font-medium">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = day === today.getDate();
              const isChecked = checkedDates.has(dateStr);
              const isFuture = day > today.getDate();
              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors
                    ${isChecked ? 'bg-primary text-primary-foreground' : ''}
                    ${isToday && !isChecked ? 'border-2 border-primary text-primary' : ''}
                    ${isFuture ? 'text-muted-foreground/40' : ''}
                    ${!isChecked && !isToday && !isFuture ? 'text-foreground' : ''}
                  `}
                >
                  {isChecked ? '✓' : day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Referral section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Refer Friends & Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share your referral link. When a friend makes their first purchase, you earn{' '}
            <strong>{Math.round(config.referralRewardRate * 100)}%</strong> of their credits (up to{' '}
            <strong>{config.referralMaxCredits}</strong> credits), credited within{' '}
            <strong>{config.referralRewardDays} days</strong>.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
              {referralUrl}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Your referral code: <code className="bg-muted px-1 rounded">{referralCode}</code></p>
        </CardContent>
      </Card>

      {/* Referral list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Referrals
            </span>
            <span className="text-sm font-normal text-muted-foreground">{referrals.length} total</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No referrals yet. Share your link to start earning!
            </p>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[1fr_80px_100px_90px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                <span>User</span>
                <span>Status</span>
                <span>Reward</span>
                <span>Joined</span>
              </div>
              {referrals.map(r => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_80px_100px_90px] gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/50 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.referee?.name || 'Anonymous'}</p>
                    {r.referee?.email && (
                      <p className="text-xs text-muted-foreground truncate">{r.referee.email}</p>
                    )}
                  </div>
                  <div>
                    <Badge
                      variant={r.status === 'rewarded' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {r.status === 'rewarded' ? 'Paid' : 'Registered'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {r.status === 'rewarded' ? (
                      <>
                        <Coins className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium text-primary">+{r.rewardCredits}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">Pending</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {/* Summary */}
              {referrals.some(r => r.status === 'rewarded') && (
                <div className="flex items-center justify-between pt-3 mt-2 border-t text-sm">
                  <span className="text-muted-foreground">Total earned</span>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <Coins className="h-4 w-4" />
                    {referrals.filter(r => r.status === 'rewarded').reduce((sum, r) => sum + r.rewardCredits, 0)} credits
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import { getTranslations, setRequestLocale } from 'next-intl/server';
import DataCards from "@/shared/components/admin/dashboard/data-cards";
import DataCharts from "@/shared/components/admin/dashboard/data-charts";
import { getPaidOrdersTotal, getOrdersCountByDate, OrderStatus } from "@/shared/models/order";
import { getUsersTotal, getUsersCountByDate } from "@/shared/models/user";
import { getPostsCount } from "@/shared/models/post";
import { getFeedbacksTotal } from "@/shared/models/feedback";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.dashboard');

  const totalPaidOrders = await getPaidOrdersTotal();
  const totalUsers = await getUsersTotal();
  const totalFeedbacks = await getFeedbacksTotal(); 
  const totalPosts = await getPostsCount();

  const dataCards = [
    {
      title: t('cards.total_users.title'),
      value: (totalUsers || 0).toString(),
      description: t('cards.total_users.description'),
    },
    {
      title: t('cards.paid_orders.title'),
      value: (totalPaidOrders || 0).toString(),
      description: t('cards.paid_orders.description'),
    },
    {
      title: t('cards.system_posts.title'),
      value: (totalPosts || 0).toString(),
      description: t('cards.system_posts.description'),
    },
    {
      title: t('cards.user_feedbacks.title'),
      value: (totalFeedbacks || 0).toString(),
      description: t('cards.user_feedbacks.description'),
    },
  ];

  // Get data for the last 90 days
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 90);
  
  const orders = await getOrdersCountByDate(startTime, OrderStatus.PAID); 
  const users = await getUsersCountByDate(startTime);

  // Merge the data
  const allDates = new Set([
    ...(orders ? Array.from(orders.keys()) : []),
    ...(users ? Array.from(users.keys()) : []),
  ]);

  const data = Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      users: users?.get(date) || 0,
      orders: orders?.get(date) || 0,
    }));

  const fields = [
    { key: "users", label: t('charts.overview.fields.users'), color: "#8884d8" }, 
    { key: "orders", label: t('charts.overview.fields.orders'), color: "#82ca9d" }, 
  ];

  return (
    <div className="flex flex-col gap-6 m-6">
       <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <DataCards dataCards={dataCards} />
      <DataCharts
        data={data}
        fields={fields}
        title={t('charts.overview.title')}
        description={t('charts.overview.description')}
        defaultTimeRange="90d"
        timeRangeLabels={{
          '90d': t('charts.overview.time_range.90d'),
          '30d': t('charts.overview.time_range.30d'),
          '7d': t('charts.overview.time_range.7d'),
        }}
      />
    </div>
  );
}

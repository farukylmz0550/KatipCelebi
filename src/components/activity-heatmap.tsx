"use client";

interface ActivityHeatmapProps {
  activities: { date: string; count: number; pagesRead: number }[];
}

const WEEK_DAYS = ["Pzt", "", "Çar", "", "Cum", "", "Paz"];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-muted/50";
  if (count === 1) return "bg-green-300/60 dark:bg-green-900/60";
  if (count === 2) return "bg-green-400/70 dark:bg-green-800/70";
  if (count <= 4) return "bg-green-500/80 dark:bg-green-700/80";
  return "bg-green-600 dark:bg-green-600";
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function buildGrid(activities: { date: string; count: number }[]) {
  const activityMap = new Map(activities.map((a) => [a.date, a.count]));

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 52 * 7);

  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToMonday);

  const weeks: { date: Date; count: number }[][] = [];
  let currentWeek: { date: Date; count: number }[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = formatDate(current);
    const count = activityMap.get(dateStr) ?? 0;
    currentWeek.push({ date: new Date(current), count });

    if (current.getDay() === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    current.setDate(current.getDate() + 1);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
}

function getMonthLabels(weeks: { date: Date }[][]) {
  const labels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, i) => {
    const firstDay = week[0]?.date;
    if (!firstDay) return;
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      labels.push({ month: MONTHS[month], weekIndex: i });
      lastMonth = month;
    }
  });

  return labels;
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const weeks = buildGrid(activities);
  const monthLabels = getMonthLabels(weeks);
  const totalActivities = activities.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="gnome-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-medium text-foreground">
          Yıllık Aktivite
        </p>
        <p className="text-xs text-muted-foreground">
          {totalActivities} etkinlik
        </p>
      </div>

      <div className="mb-1 flex pl-8">
        {monthLabels.map((label, i) => (
          <div
            key={`${label.month}-${i}`}
            className="text-[9px] text-muted-foreground"
            style={{
              position: "relative",
              left: `${(label.weekIndex / weeks.length) * 100}%`,
              width: 0,
            }}
          >
            {label.month}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        <div className="flex flex-col gap-0.5 pr-1">
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className="h-[10px] w-6 text-[9px] leading-[10px] text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`h-[10px] w-[10px] rounded-sm ${getIntensityClass(day.count)} transition-colors`}
                  title={`${day.date.toLocaleDateString("tr-TR")} — ${day.count} etkinlik`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1">
        <span className="text-[9px] text-muted-foreground">Az</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <div
            key={n}
            className={`h-[10px] w-[10px] rounded-sm ${getIntensityClass(n)}`}
          />
        ))}
        <span className="text-[9px] text-muted-foreground">Çok</span>
      </div>
    </div>
  );
}

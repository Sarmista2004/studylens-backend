import { Flame, Calendar, BookOpen, Sun, Sunrise, Sunset, Moon } from "lucide-react";
import useStudyData from "../../hooks/useStudyData";
import StatCard from "../../components/dashboard/StatCard";
import GoalRing from "../../components/dashboard/GoalRing";
import Coach from "../../components/dashboard/Coach";
import TodayPlanner from "../../components/dashboard/TodayPlanner";
import RecentActivity from "../../components/dashboard/RecentActivity";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return { text: "Good night", Icon: Moon, cls: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300" };
  if (hour < 12) return { text: "Good morning", Icon: Sunrise, cls: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300" };
  if (hour < 17) return { text: "Good afternoon", Icon: Sun, cls: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300" };
  if (hour < 21) return { text: "Good evening", Icon: Sunset, cls: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300" };
  return { text: "Good night", Icon: Moon, cls: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300" };
}

function Dashboard() {
  const {
    subjects,
    todayMinutes,
    todayGoalPercentage,
    dailyGoalMinutes,
    streak,
    todayEvents,
    activity,
    subjectStatus,
    settings,
    loading,
  } = useStudyData(); 

  const needsAttention = subjectStatus.find((s) => s.status === "Needs attention");
  const coachMessage = needsAttention
    ? `${needsAttention.name} needs attention — ${needsAttention.reason.toLowerCase()}.`
    : subjects.length === 0
    ? "Add a subject on the Study page to get personalized insights."
    : "You're on track across your subjects. Keep it up.";

  const { text: greeting, Icon: GreetingIcon, cls: greetingCls } = getGreeting();

  return (
    <div className="bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white p-5 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${greetingCls} flex items-center justify-center shrink-0`}>
          <GreetingIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-tight">
            {greeting}{settings.name ? `, ${settings.name}` : ""} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Keep going! You're doing great.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <StatCard
          icon={<Flame size={18} className="text-orange-500" />}
          title="Current streak"
          value={`${streak} ${streak === 1 ? "day" : "days"}`}
        />
        <StatCard
          icon={<Calendar size={18} className="text-purple-600" />}
          title="Events today"
          value={todayEvents.length}
          link={{ to: "/planner", label: "View schedule" }}
        />
        <StatCard
          icon={<BookOpen size={18} className="text-emerald-600" />}
          title="Subjects tracked"
          value={subjects.length}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <GoalRing
          percentage={todayGoalPercentage}
          completedMin={todayMinutes}
          goalMin={dailyGoalMinutes}
        />
        <Coach
          message={coachMessage}
          focusSubject={needsAttention?.name || subjects[0]?.name}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <TodayPlanner events={todayEvents} />
        <RecentActivity activity={activity} />
      </div>
    </div>
  );
}

export default Dashboard;
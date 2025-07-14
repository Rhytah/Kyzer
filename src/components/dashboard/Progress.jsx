import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Filter,
  Download,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuthStore } from "../../store/authStore";

const Progress = () => {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [progressData, setProgressData] = useState(null);

  const timeRanges = [
    { id: "7days", name: "Last 7 Days" },
    { id: "30days", name: "Last 30 Days" },
    { id: "90days", name: "Last 90 Days" },
    { id: "year", name: "This Year" },
    { id: "all", name: "All Time" },
  ];

  useEffect(() => {
    const loadProgressData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProgressData({
        overview: {
          totalHours: 156,
          coursesCompleted: 12,
          coursesInProgress: 3,
          certificates: 8,
          currentStreak: 14,
          longestStreak: 28,
          averageScore: 87,
          rank: "Advanced Learner",
        },
        weeklyActivity: [
          { day: "Mon", hours: 2.5, courses: 1 },
          { day: "Tue", hours: 1.8, courses: 0 },
          { day: "Wed", hours: 3.2, courses: 2 },
          { day: "Thu", hours: 2.1, courses: 1 },
          { day: "Fri", hours: 4.0, courses: 1 },
          { day: "Sat", hours: 1.5, courses: 0 },
          { day: "Sun", hours: 2.8, courses: 1 },
        ],
        monthlyProgress: [
          { month: "Aug", completed: 2, hours: 24 },
          { month: "Sep", completed: 3, hours: 31 },
          { month: "Oct", completed: 2, hours: 28 },
          { month: "Nov", completed: 4, hours: 42 },
          { month: "Dec", completed: 1, hours: 18 },
          { month: "Jan", completed: 0, hours: 13 },
        ],
        skillProgress: [
          { skill: "React Development", level: 85, courses: 4, hours: 32 },
          { skill: "JavaScript", level: 92, courses: 3, hours: 28 },
          { skill: "UI/UX Design", level: 68, courses: 2, hours: 24 },
          { skill: "Node.js", level: 45, courses: 1, hours: 16 },
          { skill: "Data Analysis", level: 30, courses: 1, hours: 12 },
          { skill: "Project Management", level: 75, courses: 1, hours: 18 },
        ],
        recentActivity: [
          {
            type: "completion",
            title: 'Completed "Advanced React Hooks"',
            date: "2024-01-20",
            points: 150,
          },
          {
            type: "certificate",
            title: "Earned JavaScript Fundamentals Certificate",
            date: "2024-01-18",
            points: 200,
          },
          {
            type: "milestone",
            title: "Reached 100 hours of learning",
            date: "2024-01-15",
            points: 500,
          },
          {
            type: "streak",
            title: "14-day learning streak",
            date: "2024-01-14",
            points: 100,
          },
        ],
        goals: [
          {
            id: 1,
            title: "Complete React Mastery Path",
            target: 8,
            current: 6,
            deadline: "2024-03-01",
            type: "courses",
          },
          {
            id: 2,
            title: "Study 200 hours this year",
            target: 200,
            current: 156,
            deadline: "2024-12-31",
            type: "hours",
          },
          {
            id: 3,
            title: "Earn 10 certificates",
            target: 10,
            current: 8,
            deadline: "2024-06-30",
            type: "certificates",
          },
        ],
      });

      setLoading(false);
    };

    loadProgressData();
  }, [timeRange]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "completion":
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case "certificate":
        return <Award className="h-4 w-4 text-yellow-600" />;
      case "milestone":
        return <Target className="h-4 w-4 text-purple-600" />;
      case "streak":
        return <Zap className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSkillColor = (level) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 60) return "bg-blue-500";
    if (level >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSkillLabel = (level) => {
    if (level >= 80) return "Expert";
    if (level >= 60) return "Intermediate";
    if (level >= 40) return "Beginner";
    return "Learning";
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Learning Progress
          </h1>
          <p className="text-text-medium">
            Track your learning journey and celebrate your achievements
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input w-auto"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.name}
              </option>
            ))}
          </select>
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Total Hours</p>
              <p className="text-2xl font-semibold text-text-dark">
                {progressData.overview.totalHours}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Courses Completed</p>
              <p className="text-2xl font-semibold text-text-dark">
                {progressData.overview.coursesCompleted}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Certificates</p>
              <p className="text-2xl font-semibold text-text-dark">
                {progressData.overview.certificates}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Average Score</p>
              <p className="text-2xl font-semibold text-text-dark">
                {progressData.overview.averageScore}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-dark">
                Weekly Activity
              </h2>
              <div className="flex items-center space-x-4 text-sm text-text-medium">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded mr-2" />
                  <span>Hours</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-light rounded mr-2" />
                  <span>Courses</span>
                </div>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between space-x-2">
              {progressData.weeklyActivity.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full max-w-16 space-y-1 mb-2">
                    <div
                      className="bg-primary rounded-t"
                      style={{
                        height: `${(day.hours / 4) * 200}px`,
                        minHeight: "4px",
                      }}
                    />
                    <div
                      className="bg-primary-light rounded-t"
                      style={{
                        height: `${(day.courses / 2) * 100}px`,
                        minHeight: day.courses > 0 ? "8px" : "2px",
                      }}
                    />
                  </div>
                  <div className="text-xs text-text-medium">{day.day}</div>
                  <div className="text-xs text-text-light">{day.hours}h</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">
              Monthly Progress
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-background-dark">
                    <th className="text-left py-2">Month</th>
                    <th className="text-left py-2">Courses Completed</th>
                    <th className="text-left py-2">Hours Studied</th>
                    <th className="text-left py-2">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.monthlyProgress.map((month, index) => (
                    <tr
                      key={index}
                      className="border-b border-background-light"
                    >
                      <td className="py-3 font-medium text-text-dark">
                        {month.month}
                      </td>
                      <td className="py-3 text-text-medium">
                        {month.completed}
                      </td>
                      <td className="py-3 text-text-medium">{month.hours}h</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="progress-bar w-20 mr-2">
                            <div
                              className="progress-fill"
                              style={{ width: `${(month.hours / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-text-medium">
                            {month.hours}h
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skill Progress */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-dark mb-6">
              Skill Development
            </h2>
            <div className="space-y-4">
              {progressData.skillProgress.map((skill, index) => (
                <div
                  key={index}
                  className="border border-background-dark rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-text-dark">
                      {skill.skill}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getSkillColor(skill.level)}`}
                      >
                        {getSkillLabel(skill.level)}
                      </span>
                      <span className="text-sm font-medium text-text-dark">
                        {skill.level}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar mb-2">
                    <div
                      className="progress-fill"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-light">
                    <span>{skill.courses} courses completed</span>
                    <span>{skill.hours} hours practiced</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Streak */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Learning Streak
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {progressData.overview.currentStreak}
              </div>
              <p className="text-sm text-text-medium mb-4">Days in a row</p>
              <div className="flex justify-center">
                <Zap className="h-12 w-12 text-yellow-500" />
              </div>
              <p className="text-xs text-text-light mt-2">
                Longest streak: {progressData.overview.longestStreak} days
              </p>
            </div>
          </div>

          {/* Learning Goals */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Learning Goals
            </h3>
            <div className="space-y-4">
              {progressData.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="border border-background-dark rounded-lg p-3"
                >
                  <h4 className="font-medium text-text-dark text-sm mb-2">
                    {goal.title}
                  </h4>
                  <div className="flex justify-between text-xs text-text-medium mb-1">
                    <span>
                      {goal.current} of {goal.target} {goal.type}
                    </span>
                    <span>Due {formatDate(goal.deadline)}</span>
                  </div>
                  <div className="progress-bar h-1">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(goal.current / goal.target) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/goals" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Manage Goals
              </Button>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {progressData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-2 hover:bg-background-light rounded-lg transition-colors"
                >
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-dark">{activity.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-text-light">
                        {formatDate(activity.date)}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        +{activity.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learner Rank */}
          <div className="card bg-gradient-to-br from-primary-light to-background-medium">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-text-dark mb-2">
                {progressData.overview.rank}
              </h3>
              <p className="text-sm text-text-medium mb-3">
                You're in the top 15% of learners
              </p>
              <Button size="sm" variant="primary">
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;

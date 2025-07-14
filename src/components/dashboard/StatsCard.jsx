// src/components/dashboard/StatsCard.jsx
import { TrendingUp, TrendingDown } from "lucide-react";

const colorClasses = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-100",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-100",
    text: "text-green-600",
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-100",
    text: "text-purple-600",
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-100",
    text: "text-orange-600",
  },
  red: {
    bg: "bg-red-500",
    light: "bg-red-100",
    text: "text-red-600",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend = null,
  subtitle = null,
  loading = false,
}) {
  const colors = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-background-dark p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-background-medium rounded-lg"></div>
            <div className="w-16 h-4 bg-background-medium rounded"></div>
          </div>
          <div className="w-20 h-8 bg-background-medium rounded mb-2"></div>
          <div className="w-24 h-4 bg-background-medium rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-background-dark p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colors.light} rounded-lg p-3`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium ${
              trend.direction === "up"
                ? "text-green-600"
                : trend.direction === "down"
                  ? "text-red-600"
                  : "text-text-light"
            }`}
          >
            {trend.direction === "up" && (
              <TrendingUp className="w-3 h-3 mr-1" />
            )}
            {trend.direction === "down" && (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend.value}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-text-dark mb-1">{value}</p>
        <p className="text-sm text-text-light">{title}</p>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

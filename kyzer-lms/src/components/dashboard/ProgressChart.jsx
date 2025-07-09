// src/components/dashboard/ProgressChart.jsx
import { useState } from 'react'
import { TrendingUp, Calendar, BarChart } from 'lucide-react'

export default function ProgressChart({ data = null }) {
  const [timeFrame, setTimeFrame] = useState('7d') // 7d, 30d, 90d

  // Mock data for demonstration
  const mockData = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      learningHours: [2, 1.5, 3, 0, 2.5, 4, 1],
      coursesCompleted: [0, 0, 1, 0, 0, 1, 0],
      totalHours: 14,
      avgDaily: 2,
      trend: '+12%'
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      learningHours: [14, 18, 12, 16],
      coursesCompleted: [2, 3, 1, 2],
      totalHours: 60,
      avgDaily: 2,
      trend: '+8%'
    },
    '90d': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      learningHours: [45, 38, 52],
      coursesCompleted: [4, 3, 5],
      totalHours: 135,
      avgDaily: 1.5,
      trend: '+15%'
    }
  }

  const chartData = data || mockData[timeFrame]
  const maxHours = Math.max(...chartData.learningHours)

  return (
    <div className="space-y-6">
      {/* Header with Time Frame Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-dark">Learning Progress</h3>
          <p className="text-sm text-text-light">Track your learning activity over time</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFrame(period)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                timeFrame === period
                  ? 'bg-primary text-white'
                  : 'bg-background-medium text-text-light hover:bg-background-dark'
              }`}
            >
              {period === '7d' ? 'Week' : period === '30d' ? 'Month' : 'Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background-light rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-text-light">Total Hours</span>
          </div>
          <p className="text-lg font-bold text-text-dark">{chartData.totalHours}h</p>
        </div>
        
        <div className="bg-background-light rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <BarChart className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-text-light">Daily Avg</span>
          </div>
          <p className="text-lg font-bold text-text-dark">{chartData.avgDaily}h</p>
        </div>
        
        <div className="bg-background-light rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-text-light">Growth</span>
          </div>
          <p className="text-lg font-bold text-green-600">{chartData.trend}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex items-end justify-between space-x-2 h-40 px-2">
          {chartData.labels.map((label, index) => {
            const hours = chartData.learningHours[index]
            const completed = chartData.coursesCompleted[index]
            const heightPercentage = maxHours > 0 ? (hours / maxHours) * 100 : 0
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col justify-end h-32 mb-2">
                  {/* Learning Hours Bar */}
                  <div 
                    className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary-dark cursor-pointer group relative"
                    style={{ height: `${heightPercentage}%`, minHeight: hours > 0 ? '4px' : '0' }}
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-text-dark text-white text-xs rounded whitespace-nowrap transition-opacity">
                      {hours}h learning
                      {completed > 0 && `, ${completed} completed`}
                    </div>
                  </div>
                  
                  {/* Completed Courses Indicator */}
                  {completed > 0 && (
                    <div className="w-full h-1 bg-green-500 rounded-b-sm"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className="text-xs text-text-light font-medium">{label}</span>
              </div>
            )
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-32 flex flex-col justify-between text-xs text-text-light">
          <span>{maxHours}h</span>
          <span>{Math.round(maxHours / 2)}h</span>
          <span>0h</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span className="text-text-light">Learning Hours</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-text-light">Courses Completed</span>
        </div>
      </div>

      {/* Insights */}
      {chartData.totalHours > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Learning Insights</h4>
              <p className="text-xs text-blue-700">
                {chartData.trend.startsWith('+') 
                  ? `Great progress! You're learning ${chartData.trend} more than last period. Keep up the momentum!`
                  : `You've been consistent with your learning. Try to increase your daily study time to accelerate progress.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
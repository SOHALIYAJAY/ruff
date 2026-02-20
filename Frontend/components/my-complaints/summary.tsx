'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'

interface StatCard {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
}

function AnimatedCounter({ targetValue }: { targetValue: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = targetValue
    const duration = 1500
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [targetValue])

  return <>{count.toLocaleString()}</>
}

export default function ComplaintsSummary() {
  const stats: StatCard[] = [
    {
      label: 'Total Complaints',
      value: 24,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Resolved',
      value: 18,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Pending',
      value: 4,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'In Progress',
      value: 2,
      icon: <Zap className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`glass-effect rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bgColor} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
              <div className={stat.color}>{stat.icon}</div>
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
          <div className="text-3xl sm:text-4xl font-bold text-primary">
            <AnimatedCounter targetValue={stat.value} />
          </div>
        </div>
      ))}
    </div>
  )
}

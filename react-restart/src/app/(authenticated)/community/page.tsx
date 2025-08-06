'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Users, 
  Calendar,
  TrendingUp,
  Heart,
  Share2,
  MessageSquare,
  UserPlus,
  Bell
} from 'lucide-react'

// Mock community data
const communityStats = [
  {
    label: 'Active Members',
    value: '2,847',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    label: 'Discussions',
    value: '1,294',
    icon: MessageCircle,
    color: 'text-green-600'
  },
  {
    label: 'Events This Month',
    value: '23',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    label: 'Posts This Week',
    value: '186',
    icon: TrendingUp,
    color: 'text-orange-600'
  }
]

const recentPosts = [
  {
    author: 'Coach Miller',
    avatar: 'CM',
    role: 'Head Coach',
    time: '2 hours ago',
    content: 'Great practice today! The team\'s passing accuracy has improved 20% since last week. Keep up the excellent work!',
    likes: 12,
    comments: 5,
    category: 'Training Update'
  },
  {
    author: 'Sarah Johnson',
    avatar: 'SJ',
    role: 'Player',
    time: '4 hours ago',
    content: 'Just completed my Skills Academy workout! 🏆 Earned the "Shooting Specialist" badge. The new dodge drill is challenging but really effective.',
    likes: 24,
    comments: 8,
    category: 'Achievement'
  },
  {
    author: 'Mike Thompson',
    avatar: 'MT',
    role: 'Parent',
    time: '6 hours ago',
    content: 'Thank you to all the coaches for organizing such a fantastic tournament. The kids had an amazing experience!',
    likes: 18,
    comments: 12,
    category: 'Appreciation'
  },
  {
    author: 'Coach Davis',
    avatar: 'CD',
    role: 'Assistant Coach',
    time: '1 day ago',
    content: 'New defensive strategy video is now available in the Resources section. Check it out before Thursday\'s practice!',
    likes: 31,
    comments: 7,
    category: 'Announcement'
  }
]

const upcomingEvents = [
  {
    title: 'Team Parents Meeting',
    date: '2025-01-18',
    time: '7:00 PM',
    location: 'Community Center',
    attendees: 24
  },
  {
    title: 'Skills Academy Workshop',
    date: '2025-01-20',
    time: '10:00 AM',
    location: 'Main Field',
    attendees: 18
  },
  {
    title: 'Coach Training Session',
    date: '2025-01-22',
    time: '6:00 PM',
    location: 'Online',
    attendees: 12
  }
]

export default function CommunityPage() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training Update': return 'bg-blue-100 text-blue-800'
      case 'Achievement': return 'bg-green-100 text-green-800'
      case 'Appreciation': return 'bg-purple-100 text-purple-800'
      case 'Announcement': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Community
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with coaches, players, and families in the POWLAX community
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {communityStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentPosts.map((post, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {post.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{post.author}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {post.role}
                          </Badge>
                          <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </Badge>
                          <span className="text-sm text-gray-500">{post.time}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="flex items-center hover:text-red-600 transition-colors">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </button>
                          <button className="flex items-center hover:text-blue-600 transition-colors">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </button>
                          <button className="flex items-center hover:text-green-600 transition-colors">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                    <div className="flex items-center mt-2">
                      <Users className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{event.attendees} attending</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Friends
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Join Discussion
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#SpringTraining</span>
                  <Badge variant="secondary" className="text-xs">42</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#SkillsAcademy</span>
                  <Badge variant="secondary" className="text-xs">38</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#TeamBuilding</span>
                  <Badge variant="secondary" className="text-xs">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#GameStrategy</span>
                  <Badge variant="secondary" className="text-xs">19</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
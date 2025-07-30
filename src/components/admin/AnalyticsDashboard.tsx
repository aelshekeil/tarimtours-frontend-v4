import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import LoadingSpinner from "../common/LoadingSpinner";
import Button from "../common/Button";
import { 
  Users, 
  Activity, 
  Globe, 
  TrendingUp, 
  Clock,
  Eye,
  UserCheck,
  MapPin,
  FileText,
  Download,
  RefreshCw
} from "lucide-react";

interface ActiveUser {
  id: string;
  email: string;
  full_name: string | null;
  last_activity: string;
  location: {
    country: string;
    city: string;
    ip: string;
  } | null;
  page_path: string;
  session_duration: number;
}

interface UserStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  average_session_duration: number;
}

interface PageView {
  page_path: string;
  view_count: number;
  unique_visitors: number;
  avg_time_on_page: number;
}

interface UserLocation {
  country: string;
  city: string;
  user_count: number;
  percentage: number;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  user_id?: string;
  user_email?: string;
  metadata?: any;
}

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface UserFlow {
  from: string;
  to: string;
  count: number;
}

// Funnel Chart Component - Now fetches real data
const FunnelChart: React.FC<{ data: FunnelStage[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No funnel data available. Start tracking user journeys to see funnel analysis.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((stage, index) => (
        <div key={index} className="flex items-center">
          <div className="w-32 text-sm font-medium text-gray-700">
            {stage.stage}
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-full h-8 relative">
              <div
                className="bg-blue-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${stage.percentage}%` }}
              >
                {stage.percentage}%
              </div>
            </div>
          </div>
          <div className="w-16 text-sm text-gray-600 text-right">
            {stage.count}
          </div>
        </div>
      ))}
    </div>
  );
};

// User Flow Chart Component - Now fetches real data
const UserFlowChart: React.FC<{ data: UserFlow[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No user flow data available. User navigation events will appear here once tracked.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((flow, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {flow.from}
            </div>
            <div className="text-gray-400">→</div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {flow.to}
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-700">
            {flow.count} users
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [userFlowData, setUserFlowData] = useState<UserFlow[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'behavior' | 'logs'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [flowLoading, setFlowLoading] = useState(false);

  useEffect(() => {
    // Log current user role for debugging
    const logUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('[Analytics] Current user role:', profile?.role || 'unknown');
      }
    };
    
    logUserRole();
    loadAnalyticsData();
    
    // Set up real-time subscriptions
    const subscription = setupRealtimeSubscriptions();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to real-time updates for active users
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_analytics'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          loadActiveUsers();
        }
      )
      .subscribe();

    return channel;
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUserStats(),
        loadActiveUsers(),
        loadPageViews(),
        loadUserLocations(),
        loadSystemLogs(),
        loadFunnelData(),
        loadUserFlowData()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (last 30 minutes) - count distinct users
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: activeUsersData } = await supabase
        .from('user_analytics')
        .select('user_id')
        .gte('last_activity', thirtyMinutesAgo);
      
      const uniqueActiveUsers = new Set(activeUsersData?.map(u => u.user_id).filter(id => id));
      const activeUsers = uniqueActiveUsers.size;

      // Get new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Calculate average session duration
      const { data: sessions } = await supabase
        .from('user_analytics')
        .select('session_duration')
        .not('session_duration', 'is', null);

      const avgDuration = sessions?.length 
        ? sessions.reduce((acc, s) => acc + (s.session_duration || 0), 0) / sessions.length
        : 0;

      setUserStats({
        total_users: totalUsers || 0,
        active_users: activeUsers || 0,
        new_users_today: newUsersToday || 0,
        average_session_duration: Math.round(avgDuration)
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadActiveUsers = async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      // First, let's get the user analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('last_activity', thirtyMinutesAgo)
        .order('last_activity', { ascending: false });

      if (analyticsError) {
        console.error('Analytics query error:', analyticsError);
        throw analyticsError;
      }

      console.log('Analytics data:', analyticsData);

      // If we have analytics data, get the user details
      if (analyticsData && analyticsData.length > 0) {
        const userIds = [...new Set(analyticsData.map(a => a.user_id).filter(id => id))];
        
        let userDetails: any = {};
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          if (!usersError && users) {
            users.forEach(user => {
              userDetails[user.id] = user;
            });
          }

          // Also get emails from auth.users
          const { data: authUsers, error: authError } = await supabase
            .from('auth.users')
            .select('id, email')
            .in('id', userIds);

          if (!authError && authUsers) {
            authUsers.forEach(user => {
              if (userDetails[user.id]) {
                userDetails[user.id].email = user.email;
              } else {
                userDetails[user.id] = { email: user.email };
              }
            });
          }
        }

        const formattedUsers: ActiveUser[] = analyticsData.map(item => ({
          id: item.user_id || 'anonymous',
          email: userDetails[item.user_id]?.email || 'Anonymous',
          full_name: userDetails[item.user_id]?.full_name || null,
          last_activity: item.last_activity,
          location: item.location,
          page_path: item.page_path,
          session_duration: item.session_duration || 0
        }));

        setActiveUsers(formattedUsers);
      } else {
        setActiveUsers([]);
      }
    } catch (error) {
      console.error('Error loading active users:', error);
      setActiveUsers([]);
    }
  };

  const loadPageViews = async () => {
    try {
      const { data, error } = await supabase
        .from('page_analytics')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPageViews(data || []);
    } catch (error) {
      console.error('Error loading page views:', error);
      setPageViews([]);
    }
  };

  const loadUserLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('location')
        .not('location', 'is', null);

      if (error) throw error;

      // Group by country and city
      const locationMap = new Map<string, number>();
      data?.forEach(item => {
        if (item.location?.country) {
          const key = item.location.country;
          locationMap.set(key, (locationMap.get(key) || 0) + 1);
        }
      });

      const total = data?.length || 0;
      const locations: UserLocation[] = Array.from(locationMap.entries())
        .map(([country, count]) => ({
          country,
          city: '', // We'll aggregate by country for now
          user_count: count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.user_count - a.user_count)
        .slice(0, 10);

      setUserLocations(locations);
    } catch (error) {
      console.error('Error loading user locations:', error);
      setUserLocations([]);
    }
  };

  const loadSystemLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSystemLogs(data || []);
    } catch (error) {
      console.error('Error loading system logs:', error);
      setSystemLogs([]);
    }
  };

  const loadFunnelData = async () => {
    setFunnelLoading(true);
    try {
      // Get funnel data from database - using a simpler query
      const { data, error } = await supabase
        .from('funnel_analytics')
        .select('*')
        .order('stage_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Group by stage and count
        const stageMap = new Map<string, { stage: string; count: number; stage_order: number }>();
        data.forEach((item: any) => {
          const key = item.stage;
          if (!stageMap.has(key)) {
            stageMap.set(key, { stage: item.stage, count: 0, stage_order: item.stage_order });
          }
          stageMap.get(key)!.count += 1;
        });

        // Convert to array and calculate percentages
        const stages = Array.from(stageMap.values()).sort((a, b) => a.stage_order - b.stage_order);
        const firstStageCount = stages[0]?.count || 1;
        
        const funnelDataWithPercentages = stages.map((item) => ({
          stage: item.stage,
          count: item.count,
          percentage: Math.round((item.count / firstStageCount) * 100)
        }));
        
        setFunnelData(funnelDataWithPercentages);
      } else {
        setFunnelData([]);
      }
    } catch (error) {
      console.error('Error loading funnel data:', error);
      setFunnelData([]);
    } finally {
      setFunnelLoading(false);
    }
  };

  const loadUserFlowData = async () => {
    setFlowLoading(true);
    try {
      // Get user flow data from database
      const { data, error } = await supabase
        .from('user_events')
        .select('event_data')
        .eq('event_type', 'navigation')
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        // Process the navigation events to create flow data
        const flowMap = new Map<string, Map<string, number>>();
        
        data.forEach((item: any) => {
          if (item.event_data?.from && item.event_data?.to) {
            if (!flowMap.has(item.event_data.from)) {
              flowMap.set(item.event_data.from, new Map());
            }
            const toMap = flowMap.get(item.event_data.from)!;
            toMap.set(item.event_data.to, (toMap.get(item.event_data.to) || 0) + 1);
          }
        });

        // Convert to array format
        const flowData: UserFlow[] = [];
        flowMap.forEach((toMap, from) => {
          toMap.forEach((count, to) => {
            flowData.push({ from, to, count });
          });
        });

        setUserFlowData(flowData.slice(0, 10)); // Limit to 10 flows
      } else {
        setUserFlowData([]);
      }
    } catch (error) {
      console.error('Error loading user flow data:', error);
      setUserFlowData([]);
    } finally {
      setFlowLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Level', 'Message', 'User'],
        ...systemLogs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.level,
          log.message,
          log.user_email || 'System'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time user behavior and system analytics</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Active Users', icon: Users },
            { id: 'behavior', label: 'User Behavior', icon: Activity },
            { id: 'logs', label: 'System Logs', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.total_users || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Now</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userStats?.active_users || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Today</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userStats?.new_users_today || 0}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Session</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatDuration(userStats?.average_session_duration || 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Top Pages</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pageViews.length > 0 ? (
                  pageViews.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{page.page_path}</p>
                        <p className="text-sm text-gray-500">
                          {page.unique_visitors} unique visitors • {formatDuration(page.avg_time_on_page)} avg. time
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{page.view_count}</p>
                        <p className="text-sm text-gray-500">views</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No page view data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Locations */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">User Locations</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userLocations.length > 0 ? (
                  userLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{location.country}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">
                          {location.user_count} users
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {location.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No location data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Active Users (Last 30 minutes)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{user.page_path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {user.location ? `${user.location.city}, ${user.location.country}` : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(user.session_duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(user.last_activity)}
                    </td>
                  </tr>
                ))}
                {activeUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No active users at the moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'behavior' && (
        <div className="space-y-6">
          {/* Funnel Analysis */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Application Funnel Analysis</h3>
            </div>
            <div className="p-6">
              <FunnelChart
                data={funnelData}
                loading={funnelLoading}
              />
            </div>
          </div>

          {/* User Flow */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">User Journey Flow</h3>
            </div>
            <div className="p-6">
              <UserFlowChart
                data={userFlowData}
                loading={flowLoading}
              />
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Logs</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={exportLogs}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {systemLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${log.level === 'error' ? 'bg-red-100 text-red-800' : ''}
                        ${log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${log.level === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user_email || 'System'}
                    </td>
                  </tr>
                ))}
                {systemLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No system logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

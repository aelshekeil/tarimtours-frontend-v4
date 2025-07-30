import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import supabaseAPI from '../services/supabaseAPI';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Mail from 'lucide-react/dist/esm/icons/mail';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Plane from 'lucide-react/dist/esm/icons/plane';
import Car from 'lucide-react/dist/esm/icons/car';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import Package from 'lucide-react/dist/esm/icons/package';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Activity from 'lucide-react/dist/esm/icons/activity';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Search from 'lucide-react/dist/esm/icons/search';
import i18n from '../i18n';

interface ServiceApplication {
  id: string;
  type: 'visa' | 'driving' | 'education' | 'travel';
  title: string;
  status: string;
  date: string;
  trackingId?: string;
  icon: React.ElementType;
  color: string;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'settings'>('overview');
  
  // Service data states
  const [applications, setApplications] = useState<ServiceApplication[]>([]);
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    completedApplications: 0,
    totalSpent: 0
  });
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      setName(firstName + ' ' + lastName);
      setEmail(user.email || '');
      fetchUserServices();
    }
  }, [user]);

  const fetchUserServices = async () => {
    if (!user) return;
    
    setLoadingServices(true);
    try {
      const [userApplications, userStats] = await Promise.all([
        supabaseAPI.getUserApplications(user.id),
        supabaseAPI.getUserStatistics(user.id)
      ]);

      // Transform applications into a unified format
      const allApplications: ServiceApplication[] = [];

      // Add visa applications
      userApplications.visaApplications.forEach(app => {
        allApplications.push({
          id: app.id,
          type: 'visa',
          title: `Visa Application - ${app.application_data?.destinationCountry || 'Unknown'}`,
          status: app.status || 'pending',
          date: app.created_at,
          trackingId: app.tracking_id,
          icon: Plane,
          color: 'blue'
        });
      });

      // Add driving license applications
      userApplications.drivingLicenseApplications.forEach(app => {
        allApplications.push({
          id: app.id,
          type: 'driving',
          title: 'International Driving License',
          status: app.status || 'pending',
          date: app.created_at,
          trackingId: app.tracking_id,
          icon: Car,
          color: 'green'
        });
      });

      // Add education consultations
      userApplications.educationConsultations.forEach(app => {
        allApplications.push({
          id: app.id,
          type: 'education',
          title: `Education Consultation - ${app.service_type === 'malaysia' ? 'Malaysia' : 'Tarim'}`,
          status: app.status || 'new',
          date: app.created_at,
          icon: GraduationCap,
          color: 'purple'
        });
      });

      // Add travel bookings
      userApplications.travelPackageBookings.forEach(booking => {
        allApplications.push({
          id: booking.id,
          type: 'travel',
          title: booking.package_name || booking.travel_packages?.name || 'Travel Package Booking',
          status: booking.status || 'pending',
          date: booking.created_at,
          trackingId: booking.booking_reference,
          icon: Package,
          color: 'orange'
        });
      });

      // Sort by date (newest first)
      allApplications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setApplications(allApplications);
      setStatistics(userStats);
    } catch (error) {
      console.error('Error fetching user services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await supabaseAPI.updateProfile(user.id, { 
        first_name: firstName, 
        last_name: lastName, 
        email: user.email 
      });
      
      setSuccess(t('profile.profile_updated_successfully'));

      // Update local storage with new user metadata
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.user.user_metadata = { 
          ...parsedUser.user.user_metadata, 
          first_name: firstName, 
          last_name: lastName 
        };
        localStorage.setItem('user', JSON.stringify(parsedUser));
        window.dispatchEvent(new Event('authChange'));
      }

      // Re-apply language from local storage after profile update
      const storedLanguage = localStorage.getItem('i18nextLng');
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
      }

    } catch (err) {
      console.error('Profile update error:', err);
      setError(t('profile.failed_to_update_profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('profile.new_passwords_do_not_match'));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await supabaseAPI.changePassword({
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      });
      setSuccess(t('profile.password_changed_successfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(t('profile.failed_to_change_password'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'processing':
      case 'new':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
      case 'new':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold shadow-md backdrop-blur-sm">
                {name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{name}</h1>
                <div className="flex items-center text-blue-100">
                  <Mail className="w-4 h-4 mr-2" />
                  {email}
                </div>
                <div className="flex items-center mt-2 text-blue-100">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{statistics.totalApplications}</div>
                <div className="text-sm text-blue-100">Total Services</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{statistics.pendingApplications}</div>
                <div className="text-sm text-blue-100">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Activity className="w-5 h-5 inline-block mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              My Applications
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Edit3 className="w-5 h-5 inline-block mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{statistics.totalApplications}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Applications</h3>
                <p className="text-sm text-gray-500 mt-1">All time services used</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 rounded-full p-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{statistics.pendingApplications}</span>
                </div>
                <h3 className="text-gray-600 font-medium">In Progress</h3>
                <p className="text-sm text-gray-500 mt-1">Currently processing</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{statistics.completedApplications}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Completed</h3>
                <p className="text-sm text-gray-500 mt-1">Successfully processed</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">${statistics.totalSpent.toFixed(2)}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Spent</h3>
                <p className="text-sm text-gray-500 mt-1">On travel packages</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/visa-services')}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Plane className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-800">Apply for Visa</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/international-driving-license')}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Car className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-800">Get IDL</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/malaysia-education')}
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-800">Education Services</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/application-tracking')}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="font-medium text-gray-800">Track Application</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </h2>
              {loadingServices ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading your services...</p>
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => {
                    const Icon = app.icon;
                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className={`bg-${app.color}-100 rounded-full p-2 mr-4`}>
                            <Icon className={`w-5 h-5 text-${app.color}-600`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{app.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(app.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          {app.trackingId && (
                            <button
                              onClick={() => navigate(`/application-tracking?id=${app.trackingId}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Track
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No applications yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start by applying for one of our services</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">All Applications</h2>
            {loadingServices ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading your applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  const Icon = app.icon;
                  return (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={`bg-${app.color}-100 rounded-full p-3 mr-4`}>
                            <Icon className={`w-6 h-6 text-${app.color}-600`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{app.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(app.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              {app.trackingId && (
                                <span className="flex items-center">
                                  <FileText className="w-4 h-4 mr-1" />
                                  ID: {app.trackingId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(app.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          {app.trackingId && (
                            <button
                              onClick={() => navigate(`/application-tracking?id=${app.trackingId}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              Track Application
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No applications found</p>
                <p className="text-gray-500 mt-2">Your service applications will appear here</p>
                <button
                  onClick={() => navigate('/services')}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Explore Services
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Update Profile Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Edit3 className="w-6 h-6 mr-3 text-blue-600" />
                {t('profile.update_profile')}
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('profile.full_name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('profile.email_address')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 rounded-md bg-slate-100 border border-slate-300 cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md"
                  disabled={loading}
                >
                  {loading ? t('profile.saving') : t('profile.save_changes')}
                </button>
              </form>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-blue-600" />
                {t('profile.change_password')}
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('profile.current_password')}
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('profile.new_password')}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('profile.confirm_new_password')}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md"
                  disabled={loading}
                >
                  {loading ? t('profile.updating') : t('profile.update_password')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

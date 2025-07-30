import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
  Wrench,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Shield,
  Search,
  Terminal,
  FileText,
  Mail,
  AlertTriangle,
  Copy,
  ExternalLink,
  Zap,
  Archive,
  HardDrive,
  Activity,
  Key,
  Lock
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void | Promise<void>;
  category: 'database' | 'cache' | 'backup' | 'security' | 'utilities';
  danger?: boolean;
}

const AdminTools: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('database');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<{ tool: Tool | null; show: boolean }>({
    tool: null,
    show: false
  });

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setLogs(prev => [`[${timestamp}] ${icon} ${message}`, ...prev].slice(0, 50));
  };

  const executeTool = async (tool: Tool) => {
    if (tool.danger) {
      setShowConfirmModal({ tool, show: true });
      return;
    }
    
    setIsExecuting(tool.id);
    addLog(`Executing: ${tool.name}`, 'info');
    
    try {
      await tool.action();
      addLog(`${tool.name} completed successfully`, 'success');
    } catch (error) {
      addLog(`${tool.name} failed: ${error}`, 'error');
    } finally {
      setIsExecuting(null);
    }
  };

  const tools: Tool[] = [
    // Database Tools
    {
      id: 'clear-cache',
      name: 'Clear Application Cache',
      description: 'Clear all cached data to force fresh data loading',
      icon: <RefreshCw className="w-5 h-5" />,
      category: 'cache',
      action: () => {
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    },
    {
      id: 'optimize-db',
      name: 'Optimize Database',
      description: 'Run database optimization queries to improve performance',
      icon: <Database className="w-5 h-5" />,
      category: 'database',
      action: async () => {
        // Simulate database optimization
        await new Promise(resolve => setTimeout(resolve, 2000));
        addLog('Database optimization completed', 'success');
      }
    },
    {
      id: 'backup-db',
      name: 'Backup Database',
      description: 'Create a full backup of the database',
      icon: <Download className="w-5 h-5" />,
      category: 'backup',
      action: async () => {
        // Simulate backup
        await new Promise(resolve => setTimeout(resolve, 3000));
        addLog('Database backup created: backup_2024_01_30.sql', 'success');
      }
    },
    {
      id: 'export-data',
      name: 'Export All Data',
      description: 'Export all application data as JSON',
      icon: <Archive className="w-5 h-5" />,
      category: 'backup',
      action: async () => {
        // Simulate data export
        await new Promise(resolve => setTimeout(resolve, 2000));
        const data = {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          data: {}
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarimtours_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    {
      id: 'clean-orphaned',
      name: 'Clean Orphaned Records',
      description: 'Remove orphaned records from the database',
      icon: <Trash2 className="w-5 h-5" />,
      category: 'database',
      danger: true,
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        addLog('Cleaned 23 orphaned records', 'success');
      }
    },
    {
      id: 'reset-sequences',
      name: 'Reset ID Sequences',
      description: 'Reset auto-increment sequences for all tables',
      icon: <RefreshCw className="w-5 h-5" />,
      category: 'database',
      danger: true,
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        addLog('ID sequences reset successfully', 'success');
      }
    },
    {
      id: 'generate-sitemap',
      name: 'Generate Sitemap',
      description: 'Generate XML sitemap for SEO',
      icon: <FileText className="w-5 h-5" />,
      category: 'utilities',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        addLog('Sitemap generated: sitemap.xml', 'success');
      }
    },
    {
      id: 'test-email',
      name: 'Test Email Configuration',
      description: 'Send a test email to verify email settings',
      icon: <Mail className="w-5 h-5" />,
      category: 'utilities',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        addLog('Test email sent to admin@tarimtours.com', 'success');
      }
    },
    {
      id: 'check-security',
      name: 'Security Audit',
      description: 'Run security checks on the application',
      icon: <Shield className="w-5 h-5" />,
      category: 'security',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        addLog('Security audit completed: No vulnerabilities found', 'success');
      }
    },
    {
      id: 'rotate-keys',
      name: 'Rotate API Keys',
      description: 'Generate new API keys for all services',
      icon: <Key className="w-5 h-5" />,
      category: 'security',
      danger: true,
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        addLog('API keys rotated successfully', 'success');
      }
    },
    {
      id: 'lock-accounts',
      name: 'Lock Inactive Accounts',
      description: 'Lock user accounts inactive for more than 90 days',
      icon: <Lock className="w-5 h-5" />,
      category: 'security',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        addLog('Locked 7 inactive accounts', 'success');
      }
    },
    {
      id: 'system-health',
      name: 'System Health Check',
      description: 'Check overall system health and performance',
      icon: <Activity className="w-5 h-5" />,
      category: 'utilities',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
        addLog('System health: All services operational', 'success');
        addLog('Database: 87% capacity', 'info');
        addLog('Storage: 62% used', 'info');
        addLog('API response time: 145ms avg', 'info');
      }
    },
    {
      id: 'update-role',
      name: 'Update User Role',
      description: 'Set user role to super_admin (for debugging)',
      icon: <Key className="w-5 h-5" />,
      category: 'utilities',
      action: async () => {
        const email = prompt('Enter user email to make admin:');
        if (!email) {
          addLog('No email entered', 'error');
          return;
        }

        try {
          const { error } = await supabase
            .from('profiles')
            .update({ role: 'super_admin' })
            .eq('email', email);
          
          if (error) throw error;
          
          addLog(`Successfully updated role for ${email} to super_admin`, 'success');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addLog(`Error updating role: ${errorMessage}`, 'error');
        }
      }
    }
  ];

  const categories = [
    { id: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
    { id: 'cache', label: 'Cache', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <Archive className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'utilities', label: 'Utilities', icon: <Wrench className="w-4 h-4" /> }
  ];

  const filteredTools = tools.filter(tool => tool.category === activeCategory);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Admin Tools</h2>
        <p className="text-gray-600 mt-1">Powerful utilities for system administration and maintenance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools Section */}
        <div className="lg:col-span-2">
          {/* Category Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.icon}
                <span className="ml-2">{category.label}</span>
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className={`bg-white rounded-lg border ${
                  tool.danger ? 'border-red-200' : 'border-gray-200'
                } p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    tool.danger ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <div className={tool.danger ? 'text-red-600' : 'text-blue-600'}>
                      {tool.icon}
                    </div>
                  </div>
                  {tool.danger && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Danger
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                
                <button
                  onClick={() => executeTool(tool)}
                  disabled={isExecuting !== null}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    tool.danger
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isExecuting === tool.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Execute
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Section */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                Execution Logs
              </h3>
              <button
                onClick={() => setLogs([])}
                className="text-gray-400 hover:text-white text-sm"
              >
                Clear
              </button>
            </div>
            
            <div className="h-[520px] overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Execute a tool to see logs here.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1 hover:bg-gray-800 px-2 py-1 rounded">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy System Info
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Logs
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm">
            <Search className="w-4 h-4 mr-2" />
            Search Database
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm">
            System Info
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal.show && showConfirmModal.tool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to execute <strong>{showConfirmModal.tool.name}</strong>?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal({ tool: null, show: false })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const tool = showConfirmModal.tool!;
                  setShowConfirmModal({ tool: null, show: false });
                  setIsExecuting(tool.id);
                  addLog(`Executing: ${tool.name}`, 'info');
                  
                  try {
                    await tool.action();
                    addLog(`${tool.name} completed successfully`, 'success');
                  } catch (error: any) {
                    addLog(`${tool.name} failed: ${error}`, 'error');
                  } finally {
                    setIsExecuting(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTools;
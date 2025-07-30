import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Layout } from 'lucide-react';
import cmsAPI, { Page, Post, ContentBlock } from '../../services/cmsAPI';
import AddPageModal from './AddPageModal';
import EditPageModal from './EditPageModal';
import AddPostModal from './AddPostModal';
import EditPostModal from './EditPostModal';
import AddContentBlockModal from './AddContentBlockModal';
import EditContentBlockModal from './EditContentBlockModal';

type CMSTab = 'pages' | 'posts' | 'blocks';

const CMSManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CMSTab>('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showEditBlockModal, setShowEditBlockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'pages':
          const pagesFilters: any = {};
          if (statusFilter !== 'all') pagesFilters.status = statusFilter;
          if (typeFilter !== 'all') pagesFilters.page_type = typeFilter;
          const pagesData = await cmsAPI.getPages(pagesFilters);
          setPages(pagesData);
          break;
        case 'posts':
          const postsFilters: any = {};
          if (statusFilter !== 'all') postsFilters.status = statusFilter;
          const postsData = await cmsAPI.getPosts(postsFilters);
          setPosts(postsData);
          break;
        case 'blocks':
          const blocksFilters: any = {};
          if (typeFilter !== 'all') blocksFilters.type = typeFilter;
          const blocksData = await cmsAPI.getContentBlocks(blocksFilters);
          setContentBlocks(blocksData);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number, type: CMSTab) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'pages':
          await cmsAPI.deletePage(id as string);
          break;
        case 'posts':
          await cmsAPI.deletePost(id as number);
          break;
        case 'blocks':
          await cmsAPI.deleteContentBlock(id as string);
          break;
      }
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    switch (activeTab) {
      case 'pages':
        setShowEditPageModal(true);
        break;
      case 'posts':
        setShowEditPostModal(true);
        break;
      case 'blocks':
        setShowEditBlockModal(true);
        break;
    }
  };

  const getStatusBadge = (status: string, published?: boolean) => {
    const statusToUse = status || (published ? 'published' : 'draft');
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusToUse as keyof typeof colors] || colors.draft}`}>
        {statusToUse.charAt(0).toUpperCase() + statusToUse.slice(1)}
      </span>
    );
  };

  const filteredData = () => {
    let data: any[] = [];
    switch (activeTab) {
      case 'pages':
        data = pages;
        break;
      case 'posts':
        data = posts;
        break;
      case 'blocks':
        data = contentBlocks;
        break;
    }

    if (searchTerm) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  };

  const tabs = [
    { key: 'pages', label: 'Pages', icon: FileText, count: pages.length },
    { key: 'posts', label: 'Posts', icon: Edit, count: posts.length },
    { key: 'blocks', label: 'Content Blocks', icon: Layout, count: contentBlocks.length }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage pages, posts, and content blocks</p>
        </div>
        <button
          onClick={() => {
            switch (activeTab) {
              case 'pages':
                setShowAddPageModal(true);
                break;
              case 'posts':
                setShowAddPostModal(true);
                break;
              case 'blocks':
                setShowAddBlockModal(true);
                break;
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as CMSTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        {(activeTab === 'pages' || activeTab === 'blocks') && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {activeTab === 'pages' && (
              <>
                <option value="study_malaysia">Study in Malaysia</option>
                <option value="travel_packages">Travel Packages</option>
                <option value="faqs">FAQs</option>
                <option value="travel_accessories">Travel Accessories</option>
                <option value="esim">eSIM</option>
                <option value="visa_services">Visa Services</option>
                <option value="education">Education</option>
                <option value="general">General</option>
              </>
            )}
            {activeTab === 'blocks' && (
              <>
                <option value="hero">Hero Section</option>
                <option value="text">Text Block</option>
                <option value="image">Image</option>
                <option value="gallery">Gallery</option>
                <option value="faq">FAQ</option>
                <option value="features">Features</option>
                <option value="testimonials">Testimonials</option>
                <option value="cta">Call to Action</option>
              </>
            )}
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'blocks' ? 'Name' : 'Title'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'pages' ? 'Page Type' : activeTab === 'posts' ? 'Category' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData().map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.title || item.name}
                          </div>
                          {item.slug && (
                            <div className="text-sm text-gray-500">/{item.slug}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.page_type || item.category || item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status, item.published)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, activeTab)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddPageModal && (
        <AddPageModal
          onClose={() => setShowAddPageModal(false)}
          onSuccess={() => {
            setShowAddPageModal(false);
            loadData();
          }}
        />
      )}

      {showEditPageModal && selectedItem && (
        <EditPageModal
          page={selectedItem}
          onClose={() => {
            setShowEditPageModal(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowEditPageModal(false);
            setSelectedItem(null);
            loadData();
          }}
        />
      )}

      {showAddPostModal && (
        <AddPostModal
          onClose={() => setShowAddPostModal(false)}
          onSuccess={() => {
            setShowAddPostModal(false);
            loadData();
          }}
        />
      )}

      {showEditPostModal && selectedItem && (
        <EditPostModal
          post={selectedItem}
          onClose={() => {
            setShowEditPostModal(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowEditPostModal(false);
            setSelectedItem(null);
            loadData();
          }}
        />
      )}

      {showAddBlockModal && (
        <AddContentBlockModal
          onClose={() => setShowAddBlockModal(false)}
          onSuccess={() => {
            setShowAddBlockModal(false);
            loadData();
          }}
        />
      )}

      {showEditBlockModal && selectedItem && (
        <EditContentBlockModal
          contentBlock={selectedItem}
          onClose={() => {
            setShowEditBlockModal(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowEditBlockModal(false);
            setSelectedItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default CMSManager;
import React, { useState } from 'react';
import { Plus, Trash2, Eye, Code } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface ContentSection {
  type: string;
  title?: string;
  content?: string;
  image?: string;
  items?: string[];
  [key: string]: any;
}

interface ContentEditorProps {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onChange }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [sections, setSections] = useState<ContentSection[]>(
    content.sections || []
  );

  const updateContent = (newSections: ContentSection[]) => {
    setSections(newSections);
    onChange({ ...content, sections: newSections });
  };

  const addSection = (type: string) => {
    const newSection: ContentSection = { type };
    
    switch (type) {
      case 'hero':
        newSection.title = 'Hero Title';
        newSection.content = 'Hero description text';
        newSection.image = 'https://example.com/hero-image.jpg';
        break;
      case 'text':
        newSection.title = 'Section Title';
        newSection.content = 'Your content here...';
        break;
      case 'image':
        newSection.title = 'Image Section';
        newSection.image = 'https://example.com/image.jpg';
        newSection.content = 'Image caption';
        break;
      case 'features':
        newSection.title = 'Features';
        newSection.items = ['Feature 1', 'Feature 2', 'Feature 3'];
        break;
      case 'faq':
        newSection.title = 'Frequently Asked Questions';
        newSection.items = [
          'Q: Question 1?|A: Answer 1',
          'Q: Question 2?|A: Answer 2'
        ];
        break;
    }
    
    updateContent([...sections, newSection]);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    updateContent(newSections);
  };

  const removeSection = (index: number) => {
    updateContent(sections.filter((_, i) => i !== index));
  };

  const addListItem = (sectionIndex: number) => {
    const newSections = [...sections];
    if (!newSections[sectionIndex].items) {
      newSections[sectionIndex].items = [];
    }
    newSections[sectionIndex].items!.push('New item');
    updateContent(newSections);
  };

  const updateListItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].items![itemIndex] = value;
    updateContent(newSections);
  };

  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items!.filter((_, i) => i !== itemIndex);
    updateContent(newSections);
  };

  if (viewMode === 'json') {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Page Content (JSON)</h3>
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Visual Editor
          </button>
        </div>
        <textarea
          value={JSON.stringify({ sections }, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setSections(parsed.sections || []);
              onChange(parsed);
            } catch (error) {
              // Invalid JSON, ignore
            }
          }}
          rows={15}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder='{"sections": [{"type": "hero", "title": "Welcome", "content": "Page content here"}]}'
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Page Content</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('json')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            JSON View
          </button>
        </div>
      </div>

      {/* Add Section Buttons */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">Add content sections:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'hero', label: 'Hero Section' },
            { type: 'text', label: 'Text Block' },
            { type: 'image', label: 'Image' },
            { type: 'features', label: 'Features List' },
            { type: 'faq', label: 'FAQ' }
          ].map((sectionType) => (
            <button
              key={sectionType.type}
              type="button"
              onClick={() => addSection(sectionType.type)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              {sectionType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase">
                {section.type} Section
              </span>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Title field for most sections */}
            {section.type !== 'image' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={section.title || ''}
                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Content field for text-based sections */}
            {(section.type === 'hero' || section.type === 'text' || section.type === 'image') && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {section.type === 'image' ? 'Caption' : 'Content'}
                </label>
                <textarea
                  value={section.content || ''}
                  onChange={(e) => updateSection(index, 'content', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Image field for hero and image sections */}
            {(section.type === 'hero' || section.type === 'image') && (
              <div className="mb-3">
                <ImageUploader
                  value={section.image || ''}
                  onChange={(url) => updateSection(index, 'image', url)}
                  label="Image"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            {/* List items for features and FAQ */}
            {(section.type === 'features' || section.type === 'faq') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {section.type === 'faq' ? 'Questions & Answers' : 'Items'}
                  </label>
                  <button
                    type="button"
                    onClick={() => addListItem(index)}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    Add {section.type === 'faq' ? 'Q&A' : 'Item'}
                  </button>
                </div>
                <div className="space-y-2">
                  {(section.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem(index, itemIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={
                          section.type === 'faq' 
                            ? 'Q: Your question?|A: Your answer' 
                            : 'List item'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(index, itemIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {section.type === 'faq' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Q: Your question?|A: Your answer
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No content sections yet. Add your first section above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;
import React from 'react';

interface NewBlogFormProps {
  // Add any necessary props here
}

const NewBlogForm: React.FC<NewBlogFormProps> = () => {
  // Add state and handler functions here

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Blog</h2>

      <div className="mb-4">
        <label htmlFor="blogTopic" className="block text-sm font-medium text-gray-700 mb-2">Blog Topic</label>
        <input
          type="text"
          id="blogTopic"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Future of Remote Work"
        />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Target Audience</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md">Casual</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Medium</button>
          <button className="px-4 py-2 border border-gray-300 rounded-md">Madium</button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Blog Length</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md">Short</button>
          <button className="px-4 py-2 border border-gray-300 rounded-md">Medium</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Long</button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Outline</h3>
        <ul className="border border-gray-300 rounded-md p-4">
          <li className="flex justify-between items-center mb-2">
            1. Emerging Trends in Remote Work
            <button className="ml-2 text-gray-500 hover:text-gray-700">&times;</button>
          </li>
          <li className="flex justify-between items-center mb-2">
            2. Technological Advancements Enabling Remote Work
            <button className="ml-2 text-gray-500 hover:text-gray-700">&times;</button>
          </li>
          <li className="flex justify-between items-center mb-2">
            3. Challenges and Opportunities Ahead
            <button className="ml-2 text-gray-500 hover:text-gray-700">&times;</button>
          </li>
          <li className="flex justify-between items-center">
            4. The Role of Remote Work in the New Normal
            <button className="ml-2 text-gray-500 hover:text-gray-700">&times;</button>
          </li>
        </ul>
      </div>

      {/* Placeholder for Create Blog section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Create Blog</h3>
        <div className="p-4 bg-gray-100 rounded-md">
          <h4 className="font-semibold">The Future of Remote Work</h4>
          <p className="text-sm text-gray-700">Emerging shirttly rise to recentures the winer es working, and consequences</p>
        </div>
      </div>


      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Create Blog</button>
    </div>
  );
};

export default NewBlogForm;
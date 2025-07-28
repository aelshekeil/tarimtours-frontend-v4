import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Eye } from 'lucide-react';

const SubmissionsManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: visaData, error: visaError } = await supabase
          .from("visa_applications")
          .select("*");

        if (visaError) throw visaError;

        const { data: licenseData, error: licenseError } = await supabase
          .from("international_driving_license_applications")
          .select("*");

        if (licenseError) throw licenseError;

        const combinedData = [
          ...visaData.map((item) => ({ ...item, type: "Visa" })),
          ...licenseData.map((item) => ({ ...item, type: "Driving License" })),
        ];

        setSubmissions(combinedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleStatusChange = async (submission: any, newStatus: string) => {
    const tableName = submission.type === 'Visa' ? 'visa_applications' : 'international_driving_license_applications';
    const { error } = await supabase
      .from(tableName)
      .update({ status: newStatus })
      .eq('id', submission.id);

    if (error) {
      setError(error.message);
    } else {
      setSubmissions(
        submissions.map((s) =>
          s.id === submission.id ? { ...s, status: newStatus } : s
        )
      );
    }
  };

  const handlePaymentStatusChange = async (submission: any, newStatus: string) => {
    const tableName = submission.type === 'Visa' ? 'visa_applications' : 'international_driving_license_applications';
    const { error } = await supabase
      .from(tableName)
      .update({ payment_status: newStatus })
      .eq('id', submission.id);

    if (error) {
      setError(error.message);
    } else {
      setSubmissions(
        submissions.map((s) =>
          s.id === submission.id ? { ...s, payment_status: newStatus } : s
        )
      );
    }
  };

  const renderValue = (value: any) => {
    if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
      return <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a>;
    }
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <div key={index}>{renderValue(item)}</div>
      ));
    }
    return value;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">Submissions</h2>
      <p className="text-gray-600 mb-4">
        View all submitted visa and driving license application forms.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{submission.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.tracking_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(submission.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={submission.payment_status || 'Pending'}
                    onChange={(e) => handlePaymentStatusChange(submission, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={submission.status || 'Submitted'}
                    onChange={(e) => handleStatusChange(submission, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setSelectedSubmission(submission)} className="text-indigo-600 hover:text-indigo-900">
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={() => setSelectedSubmission(null)}>
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedSubmission.type} Application Details</h3>
              <div className="mt-2 px-7 py-3">
                <div className="text-sm text-gray-500">
                  {Object.entries(selectedSubmission).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b">
                      <dt className="font-semibold text-gray-700 capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd>{renderValue(value)}</dd>
                    </div>
                  ))}
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsManager;

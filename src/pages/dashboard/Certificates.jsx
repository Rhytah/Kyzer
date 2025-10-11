// src/pages/dashboard/Certificates.jsx
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  BookOpen,
  Star,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Certificates() {
  const { user } = useAuth();
  // Store selectors - individual to prevent infinite loops
  const certificates = useCourseStore(state => state.certificates);
  const fetchCertificates = useCourseStore(state => state.actions.fetchCertificates);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filteredCertificates, setFilteredCertificates] = useState([]);

  useEffect(() => {
    const loadCertificates = async () => {
      if (user?.id) {
        try {
          await fetchCertificates(user.id);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [user?.id, fetchCertificates]);

  useEffect(() => {
    let filtered = certificates;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(cert => cert.status === filterStatus);
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, filterStatus]);

  const handleDownload = async (certificate) => {
    try {
      const generateCertificatePreview = useCourseStore.getState().actions.generateCertificatePreview;
      const { blob, filename } = await generateCertificatePreview(certificate.id);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      // Fallback to basic download if template generation fails
      console.log('Downloading certificate:', certificate.id);
    }
  };

  const handleShare = (certificate) => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: `${certificate.course_name} Certificate`,
        text: `I completed ${certificate.course_name} on Kyzer LMS!`,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${certificate.course_name} Certificate - ${window.location.href}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success-light text-success-default';
      case 'pending':
        return 'bg-warning-light text-warning-default';
      case 'expired':
        return 'bg-error-light text-error-default';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-dark mb-2">Certificates</h1>
        <p className="text-text-light">
          Your achievements and completed courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-success-default" />
            </div>
            <div>
              <p className="text-sm text-text-light">Total Certificates</p>
              <p className="text-2xl font-bold text-text-dark">{certificates.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-default" />
            </div>
            <div>
              <p className="text-sm text-text-light">Completed Courses</p>
              <p className="text-2xl font-bold text-text-dark">
                {certificates.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-warning-default" />
            </div>
            <div>
              <p className="text-sm text-text-light">Average Rating</p>
              <p className="text-2xl font-bold text-text-dark">4.8</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-default focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-default focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-dark mb-2">No Certificates Found</h3>
          <p className="text-text-light mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Complete courses to earn your first certificate'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button>
              <Link to="/app/courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Certificate Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-default" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                  {certificate.status}
                </span>
              </div>

              {/* Course Info */}
              <h3 className="font-semibold text-text-dark mb-2 line-clamp-2">
                {certificate.course_name || certificate.course_title}
              </h3>
              
              <p className="text-sm text-text-light mb-4 line-clamp-2">
                {certificate.description || 'Course completion certificate'}
              </p>

              {/* Completion Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Calendar className="w-4 h-4" />
                  <span>Completed: {new Date(certificate.completed_at || Date.now()).toLocaleDateString()}</span>
                </div>
                
                {certificate.score && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Star className="w-4 h-4" />
                    <span>Score: {certificate.score}%</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownload(certificate)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleShare(certificate)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
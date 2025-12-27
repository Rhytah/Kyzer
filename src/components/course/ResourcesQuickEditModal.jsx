// src/components/course/ResourcesQuickEditModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ResourcesManager from './ResourcesManager';
import { useCourseStore } from '@/store/courseStore';
import { useToast } from '@/components/ui';

export default function ResourcesQuickEditModal({ isOpen, onClose, course }) {
  const { success, error: showError } = useToast();
  const updateCourse = useCourseStore(state => state.actions.updateCourse);

  const [resources, setResources] = useState([]);
  const [saving, setSaving] = useState(false);

  // Initialize resources from course
  useEffect(() => {
    if (course?.resources) {
      setResources(course.resources);
    } else {
      setResources([]);
    }
  }, [course]);

  const handleSave = async () => {
    if (!course?.id) return;

    setSaving(true);
    try {
      await updateCourse(course.id, { resources });
      success('Resources updated successfully!');
      onClose();
    } catch (error) {
      showError(error.message || 'Failed to update resources');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset to original resources on cancel
    if (course?.resources) {
      setResources(course.resources);
    } else {
      setResources([]);
    }
    onClose();
  };

  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div>
          <h2 className="text-xl font-semibold text-text-dark">Manage Course Resources</h2>
          <p className="text-sm text-text-light mt-1">{course.title}</p>
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> These resources will be displayed to learners at the end of the course in the "Resources" tab.
          </p>
        </div>

        <ResourcesManager
          resources={resources}
          onChange={setResources}
          courseId={course.id}
          label="Course Resources"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Resources'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

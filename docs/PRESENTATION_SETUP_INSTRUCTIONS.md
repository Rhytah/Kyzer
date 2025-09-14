# Presentation Feature Setup Instructions

## Database Setup Required

Before using the presentation feature, you need to run the database schema to create the required tables.

### Step 1: Run Database Schema

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `lesson_curation_schema.sql`
4. Run the SQL script

### Step 2: Verify Tables Created

After running the schema, verify these tables exist:
- `lesson_presentations`
- `presentation_slides`

### Step 3: Test the Feature

1. Create a new lesson with content type "Presentation (Multi-format)"
2. Go to Course Management
3. Find your presentation lesson (it will have a blue settings icon)
4. Click the "Manage Presentation" button
5. Create your first presentation with slides

## Troubleshooting

### "Lesson not found" Error

This usually means:
1. The lesson ID in the URL doesn't exist in the database
2. The database tables haven't been created yet
3. There's a permission issue

### Debug Information

The presentation management page now shows:
- Course ID
- Lesson ID
- Better error messages

### Common Issues

1. **Database Tables Missing**: Run the `lesson_curation_schema.sql` script
2. **Permission Issues**: Make sure you're logged in and have course creation permissions
3. **Invalid Lesson ID**: Check that the lesson exists and has content_type 'presentation'

## File Structure

Make sure these files exist:
- `src/pages/courses/PresentationManagement.jsx`
- `src/components/course/LessonCurationForm.jsx`
- `src/components/course/SlideEditor.jsx`
- `src/components/course/PresentationViewer.jsx`
- `lesson_curation_schema.sql`

## Next Steps

Once the database is set up:
1. Create a presentation lesson
2. Access presentation management
3. Add slides with different content types
4. Test the presentation viewer


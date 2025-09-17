import { supabase } from '../lib/supabase';
import { fixMalformedSplitData, isSplitDataMalformed } from './fixSplitData';

/**
 * Fixes all malformed split data in the database
 * This should be run once to fix existing data
 */
export async function fixAllMalformedSplitData() {
  try {
    console.log('Starting to fix malformed split data...');
    
    // Get all lessons with content_type 'pdf' that have content_text
    const { data: lessons, error: fetchError } = await supabase
      .from('lessons')
      .select('id, title, content_text, course_id')
      .eq('content_type', 'pdf')
      .not('content_text', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch lessons: ${fetchError.message}`);
    }

    console.log(`Found ${lessons.length} lessons with PDF content type`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const lesson of lessons) {
      try {
        // Parse the content_text to check if it's malformed split data
        const splitData = JSON.parse(lesson.content_text);
        
        if (isSplitDataMalformed(splitData)) {
          console.log(`Fixing malformed data for lesson: ${lesson.title} (${lesson.id})`);
          
          // Fix the malformed data
          const fixedData = fixMalformedSplitData(splitData, lesson.course_id);
          
          // Update the lesson with fixed data and correct content type
          const { error: updateError } = await supabase
            .from('lessons')
            .update({
              content_type: 'presentation', // Change from 'pdf' to 'presentation'
              content_text: JSON.stringify(fixedData)
            })
            .eq('id', lesson.id);

          if (updateError) {
            console.error(`Failed to update lesson ${lesson.id}:`, updateError.message);
            errorCount++;
          } else {
            console.log(`Successfully fixed lesson: ${lesson.title}`);
            fixedCount++;
          }
        }
      } catch (parseError) {
        console.warn(`Failed to parse content_text for lesson ${lesson.id}:`, parseError.message);
        errorCount++;
      }
    }

    console.log(`\nFix completed:`);
    console.log(`- Fixed: ${fixedCount} lessons`);
    console.log(`- Errors: ${errorCount} lessons`);
    console.log(`- Total processed: ${lessons.length} lessons`);

    return { fixedCount, errorCount, totalProcessed: lessons.length };
  } catch (error) {
    console.error('Failed to fix malformed split data:', error.message);
    throw error;
  }
}

/**
 * Fixes malformed split data for a specific lesson
 * @param {string} lessonId - The lesson ID to fix
 * @returns {boolean} - True if the lesson was fixed
 */
export async function fixLessonSplitData(lessonId) {
  try {
    // Get the specific lesson
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, title, content_text, course_id, content_type')
      .eq('id', lessonId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch lesson: ${fetchError.message}`);
    }

    if (!lesson.content_text) {
      console.log('Lesson has no content_text, nothing to fix');
      return false;
    }

    // Parse the content_text to check if it's malformed split data
    const splitData = JSON.parse(lesson.content_text);
    
    if (!isSplitDataMalformed(splitData)) {
      console.log('Lesson data is not malformed, nothing to fix');
      return false;
    }

    console.log(`Fixing malformed data for lesson: ${lesson.title} (${lesson.id})`);
    
    // Fix the malformed data
    const fixedData = fixMalformedSplitData(splitData, lesson.course_id);
    
    // Update the lesson with fixed data and correct content type
    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        content_type: 'presentation', // Change from 'pdf' to 'presentation'
        content_text: JSON.stringify(fixedData)
      })
      .eq('id', lesson.id);

    if (updateError) {
      throw new Error(`Failed to update lesson: ${updateError.message}`);
    }

    console.log(`Successfully fixed lesson: ${lesson.title}`);
    return true;
  } catch (error) {
    console.error('Failed to fix lesson split data:', error.message);
    throw error;
  }
}

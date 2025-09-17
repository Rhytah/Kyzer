/**
 * Debug utility for Supabase query errors
 * Helps identify which query is causing PGRST116 errors
 */

export function logQueryError(operation, table, filters, error) {
  console.group(`🔍 Query Error Debug: ${operation}`);
  console.error('Error:', error);
  console.log('Table:', table);
  console.log('Filters:', filters);
  console.log('Error Code:', error.code);
  console.log('Error Message:', error.message);
  console.log('Error Details:', error.details);
  console.groupEnd();
}

export function createSafeSingleQuery(supabase, table, filters, operation = 'query') {
  return async () => {
    try {
      console.log(`🔍 Executing ${operation} on ${table}:`, filters);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(filters)
        .single();
      
      if (error) {
        logQueryError(operation, table, filters, error);
        
        // If it's a "no rows" error, try without .single() to see what exists
        if (error.code === 'PGRST116') {
          console.log(`🔍 No rows found for ${operation}. Checking what exists...`);
          const { data: allData, error: allError } = await supabase
            .from(table)
            .select('*')
            .match(filters);
          
          console.log(`🔍 Found ${allData?.length || 0} rows without .single():`, allData);
          if (allError) {
            console.error('Error checking all rows:', allError);
          }
        }
        
        throw error;
      }
      
      console.log(`✅ ${operation} successful:`, data);
      return { data, error: null };
    } catch (error) {
      logQueryError(operation, table, filters, error);
      throw error;
    }
  };
}

export function createSafeMaybeSingleQuery(supabase, table, filters, operation = 'query') {
  return async () => {
    try {
      console.log(`🔍 Executing ${operation} on ${table}:`, filters);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(filters)
        .maybeSingle();
      
      if (error) {
        logQueryError(operation, table, filters, error);
        throw error;
      }
      
      console.log(`✅ ${operation} successful:`, data);
      return { data, error: null };
    } catch (error) {
      logQueryError(operation, table, filters, error);
      throw error;
    }
  };
}

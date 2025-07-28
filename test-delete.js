// Simple test script to verify visa offer deletion functionality
// This script will test the deleteVisaOffer function directly

import { supabase } from './src/services/supabaseClient.js';

async function testDeleteFunction() {
  try {
    console.log('Testing visa offer deletion...');
    
    // First, let's get the current visa offers
    const { data: offers, error: fetchError } = await supabase
      .from('visa_offers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (fetchError) {
      console.error('Error fetching offers:', fetchError);
      return;
    }
    
    console.log('Current visa offers:', offers.length);
    offers.forEach(offer => {
      console.log(`- ${offer.id}: ${offer.country} (${offer.visa_type})`);
    });
    
    if (offers.length === 0) {
      console.log('No offers to delete');
      return;
    }
    
    // Try to delete the first offer
    const offerToDelete = offers[0];
    console.log(`\nAttempting to delete: ${offerToDelete.id} - ${offerToDelete.country}`);
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return;
    }
    console.log('Authenticated user:', user.id);
    
    // Attempt deletion
    const { error: deleteError, count } = await supabase
      .from('visa_offers')
      .delete({ count: 'exact' })
      .eq('id', offerToDelete.id);
      
    if (deleteError) {
      console.error('Delete error:', deleteError);
      console.error('Error code:', deleteError.code);
      console.error('Error details:', deleteError.details);
      console.error('Error hint:', deleteError.hint);
    } else {
      console.log('Delete successful! Rows affected:', count);
    }
    
    // Check if the record still exists
    const { data: checkData, error: checkError } = await supabase
      .from('visa_offers')
      .select('*')
      .eq('id', offerToDelete.id);
      
    if (checkError) {
      console.error('Error checking record:', checkError);
    } else {
      console.log('Records found after deletion:', checkData.length);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDeleteFunction();
import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

// GET /api/shora/listings - Get all listings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createTypedServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('shora_listings')
      .select(`
        *,
        companies (*),
        ipo_applications (
          application_number,
          submission_date,
          approved_at
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('listing_status', status);
    }

    const { data: listings, error } = await query as any;

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listings: listings || [] });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

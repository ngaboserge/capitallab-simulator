import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

// POST /api/cma/applications/[id]/approve - Approve application for listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createTypedServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single() as any;

    // Only CMA regulators can approve
    if (profile?.role !== 'CMA_REGULATOR' && profile?.role !== 'CMA_ADMIN') {
      return NextResponse.json({ error: 'Only CMA regulators can approve applications' }, { status: 403 });
    }

    const body = await request.json();
    const { comments } = body;

    // Get the application
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('*, companies(*)')
      .eq('id', id)
      .single() as any;

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application status to APPROVED
    const { data: updated, error: updateError } = (await supabase
      .from('ipo_applications')
      .update({
        status: 'CMA_APPROVED',
        current_phase: 'APPROVED',
        approved_at: new Date().toISOString(),
        cma_approval_comments: comments,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single()) as any;

    if (updateError) {
      console.error('Error approving application:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create a listing record in shora_listings table
    const { data: listing, error: listingError } = (await supabase
      .from('shora_listings')
      .insert({
        company_id: application.company_id,
        application_id: id,
        ticker_symbol: application.companies?.trading_name || application.companies?.legal_name?.substring(0, 5).toUpperCase(),
        company_name: application.companies?.legal_name,
        listing_status: 'PENDING_LISTING',
        listing_date: null, // Will be set when actually listed
        shares_offered: application.shares_offered,
        offer_price: application.share_price,
        total_value: application.target_amount,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .select()
      .single()) as any;

    if (listingError) {
      console.error('Error creating listing:', listingError);
      // Don't fail the approval if listing creation fails
      // The listing can be created manually later
    }

    // Log the approval action
    await supabase
      .from('application_activity_log')
      .insert({
        application_id: id,
        user_id: user.id,
        action: 'CMA_APPROVED',
        details: {
          comments,
          approved_by: profile?.full_name,
          listing_id: listing?.id
        },
        created_at: new Date().toISOString()
      } as any);

    return NextResponse.json({
      success: true,
      application: updated,
      listing: listing,
      message: 'Application approved successfully'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

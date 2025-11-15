import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

// PATCH /api/shora/listings/[id] - Update listing status and details
export async function PATCH(
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
      .select('role')
      .eq('id', user.id)
      .single() as any;

    // Only Shora Exchange users can update listings
    if (!['SHORA_EXCHANGE', 'SHORA_ADMIN', 'SHORA_OPERATOR'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Only Shora Exchange operators can update listings' }, { status: 403 });
    }

    const body = await request.json();

    // Update listing
    const { data: updated, error: updateError } = (await supabase
      .from('shora_listings')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single()) as any;

    if (updateError) {
      console.error('Error updating listing:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listing: updated,
      message: 'Listing updated successfully'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// POST /api/cma/applications/[id]/recalculate-completion - Recalculate completion percentage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all sections for this application
    const { data: sections, error: sectionsError } = await supabase
      .from('application_sections')
      .select('status, completion_percentage')
      .eq('application_id', params.id) as any

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError.message }, { status: 500 })
    }

    if (!sections || sections.length === 0) {
      return NextResponse.json({ completion_percentage: 0 })
    }

    // Calculate average completion across all sections
    const totalCompletion = sections.reduce((sum: number, section: any) => {
      return sum + (section.completion_percentage || 0)
    }, 0)

    const percentage = Math.round(totalCompletion / sections.length)

    // Update application with new percentage
    const { error: updateError } = await supabase
      .from('ipo_applications')
      .update({ 
        completion_percentage: percentage,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ completion_percentage: percentage })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

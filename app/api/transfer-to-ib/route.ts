import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ibAdvisorId, applicationData, companyName, transferKey } = body;

    if (!ibAdvisorId || !applicationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the transfer for debugging (localStorage mode)
    console.log('Application transferred (localStorage mode):', {
      transferKey,
      ibAdvisorId,
      companyName,
      sectionsCount: Object.keys(applicationData.sections || {}).length,
      transferDate: applicationData.metadata?.transferDate
    });

    // In localStorage mode, we just log the transfer
    // The actual data is stored in localStorage and accessed by the IB Advisor page
    
    // TODO: When ready to integrate with database:
    // 1. Verify IB Advisor exists in database
    // 2. Update application record with assigned_ib_advisor
    // 3. Change status to 'IB_REVIEW'
    // 4. Create notification records
    // 5. Send email notifications

    return NextResponse.json({
      success: true,
      transferKey,
      message: 'Application successfully transferred to IB Advisor (localStorage mode)',
      ibAdvisor: {
        id: ibAdvisorId,
        name: 'IB Advisor' // In real mode, fetch from database
      }
    });

  } catch (error) {
    console.error('Transfer API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

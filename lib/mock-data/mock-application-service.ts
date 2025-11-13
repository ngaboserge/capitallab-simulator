// Mock application service that mimics the real ApplicationService
import { USE_MOCK_DATA, MOCK_APPLICATIONS, MOCK_SECTIONS, MOCK_DOCUMENTS, MOCK_COMMENTS } from './mock-toggle';

export class MockApplicationService {
  async getAllApplications() {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: MOCK_APPLICATIONS,
      error: null
    };
  }

  async getApplicationById(id: string) {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const application = MOCK_APPLICATIONS.find(app => app.id === id);
    
    return {
      data: application || null,
      error: application ? null : { message: 'Application not found' }
    };
  }

  async updateApplicationStatus(id: string, status: string, comment?: string) {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    // In a real implementation, this would update the database
    // For mock, we just simulate success
    console.log(`Mock: Updated application ${id} to status ${status}`, comment);

    return {
      data: { success: true },
      error: null
    };
  }

  async getApplicationSections(applicationId: string) {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const sections = MOCK_SECTIONS.filter(section => section.application_id === applicationId);
    
    return {
      data: sections,
      error: null
    };
  }

  async getApplicationDocuments(applicationId: string) {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const documents = MOCK_DOCUMENTS.filter(doc => doc.application_id === applicationId);
    
    return {
      data: documents,
      error: null
    };
  }

  async getApplicationComments(applicationId: string) {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const comments = MOCK_COMMENTS.filter(comment => comment.application_id === applicationId);
    
    return {
      data: comments,
      error: null
    };
  }

  async addComment(applicationId: string, content: string, commentType: string = 'GENERAL') {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    // Simulate adding a comment
    console.log(`Mock: Added comment to application ${applicationId}:`, content);

    return {
      data: { success: true },
      error: null
    };
  }
}
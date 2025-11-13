import { IBAdvisorSignup } from '@/components/auth/ib-advisor-signup';

export default function IBAdvisorSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Register as Investment Bank Advisor
          </h1>
          <p className="text-gray-600 mt-2">
            Join CapitalLab as a professional IB Advisor to review and guide IPO applications
          </p>
        </div>
        <IBAdvisorSignup />
      </div>
    </div>
  );
}
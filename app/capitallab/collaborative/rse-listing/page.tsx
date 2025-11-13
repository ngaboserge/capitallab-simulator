'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Building2,
  FileText,
  Send,
  Eye,
  BarChart3,
  Shield,
  RefreshCw,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';

interface ListingApplication {
  id: string;
  company_name: string;
  ticker_symbol?: string;
  application_number: string;
  cma_approval_date: string;
  target_amount: number;
  shares_offered: number;
  offer_price?: number;
  listing_status: 'PENDING_LISTING' | 'LISTING_APPROVED' | 'LISTED' | 'REJECTED';
  listing_date?: string;
  isin_code?: string;
  sector?: string;
  market_segment?: 'MAIN_BOARD' | 'ALTERNATIVE_BOARD';
}

function SHORAListingPageContent() {
  console.log('🚀 SHORA Listing Page Loaded - Version 2.0');
  
  const { profile } = useSimpleAuth();
  const [applications, setApplications] = useState<ListingApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ListingApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Listing form state
  const [tickerSymbol, setTickerSymbol] = useState('');
  const [isinCode, setIsinCode] = useState('');
  const [listingDate, setListingDate] = useState('');
  const [openingPrice, setOpeningPrice] = useState('');
  const [marketSegment, setMarketSegment] = useState<'MAIN_BOARD' | 'ALTERNATIVE_BOARD'>('MAIN_BOARD');
  const [listingNotes, setListingNotes] = useState('');

  useEffect(() => {
    loadApplications();
    
    // Reload data when window regains focus (e.g., after login)
    const handleFocus = () => {
      loadApplications();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadApplications = () => {
    try {
      setLoading(true);
      
      // Load CMA-approved applications from localStorage
      const allKeys = Object.keys(localStorage);
      const cmaSubmissionKeys = allKeys.filter(key => key.startsWith('cma_submission_'));
      const listingKeys = allKeys.filter(key => key.startsWith('listing_'));
      
      const loadedApplications: ListingApplication[] = [];
      const processedIds = new Set<string>();

      // First, load all CMA-approved applications
      cmaSubmissionKeys.forEach((key, index) => {
        try {
          const submissionData = localStorage.getItem(key);
          if (submissionData) {
            const submission = JSON.parse(submissionData);
            
            // Only include CMA-approved applications
            if (submission.status === 'APPROVED') {
              // Check if already listed
              const listingKey = `listing_${key}`;
              const listingData = localStorage.getItem(listingKey);
              const listing = listingData ? JSON.parse(listingData) : null;
              
              const application: ListingApplication = {
                id: key,
                company_name: submission.companyName || 'Unknown Company',
                application_number: `CMA-2024-${String(index + 1).padStart(3, '0')}`,
                cma_approval_date: submission.cmaDecisionDate || new Date().toISOString(),
                target_amount: submission.dealStructure?.totalAmount || 0,
                shares_offered: submission.dealStructure?.totalShares || 0,
                offer_price: submission.dealStructure?.offerPrice || 0,
                listing_status: listing?.status || 'PENDING_LISTING',
                ticker_symbol: listing?.tickerSymbol,
                isin_code: listing?.isinCode,
                listing_date: listing?.listingDate,
                sector: listing?.sector || 'Technology',
                market_segment: listing?.marketSegment || 'MAIN_BOARD'
              };
              
              console.log(`Loaded application ${submission.companyName}:`, {
                listingKey,
                hasListing: !!listing,
                status: listing?.status,
                listing_status: application.listing_status
              });
              
              loadedApplications.push(application);
              processedIds.add(key);
            }
          }
        } catch (e) {
          console.error(`Error loading ${key}:`, e);
        }
      });

      // Also load any listings that don't have a CMA submission (e.g., demo data)
      listingKeys.forEach((listingKey) => {
        try {
          const applicationId = listingKey.replace('listing_', '');
          
          // Skip if already processed
          if (processedIds.has(applicationId)) {
            return;
          }
          
          const listingData = localStorage.getItem(listingKey);
          if (listingData) {
            const listing = JSON.parse(listingData);
            
            const application: ListingApplication = {
              id: applicationId,
              company_name: listing.companyName || 'Unknown Company',
              application_number: `DEMO-${applicationId}`,
              cma_approval_date: listing.approvalDate || new Date().toISOString(),
              target_amount: listing.marketCap || 0,
              shares_offered: listing.sharesOffered || 0,
              offer_price: listing.openingPrice || 0,
              listing_status: listing.status || 'PENDING_LISTING',
              ticker_symbol: listing.tickerSymbol,
              isin_code: listing.isinCode,
              listing_date: listing.listingDate,
              sector: listing.sector || 'Technology',
              market_segment: listing.marketSegment || 'MAIN_BOARD'
            };
            
            console.log(`Loaded listing-only application ${listing.companyName}:`, {
              listingKey,
              status: listing.status,
              listing_status: application.listing_status
            });
            
            loadedApplications.push(application);
            processedIds.add(applicationId);
          }
        } catch (e) {
          console.error(`Error loading ${listingKey}:`, e);
        }
      });

      console.log('📊 Loaded applications summary:', {
        total: loadedApplications.length,
        pending: loadedApplications.filter(a => a.listing_status === 'PENDING_LISTING').length,
        approved: loadedApplications.filter(a => a.listing_status === 'LISTING_APPROVED').length,
        listed: loadedApplications.filter(a => a.listing_status === 'LISTED').length
      });

      // Only show real CMA-approved applications (no demo data)
      console.log('✅ Setting applications:', loadedApplications);
      setApplications(loadedApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTickerSymbol = (companyName: string): string => {
    // Generate ticker from company name (first 4 letters)
    const words = companyName.split(' ');
    let ticker = '';
    
    if (words.length >= 2) {
      ticker = words[0].substring(0, 2) + words[1].substring(0, 2);
    } else {
      ticker = companyName.substring(0, 4);
    }
    
    return ticker.toUpperCase();
  };

  const generateISIN = (ticker: string): string => {
    // Generate ISIN code (RW + 10 alphanumeric)
    const randomPart = Math.random().toString(36).substring(2, 12).toUpperCase();
    return `RW${randomPart}`;
  };

  const handleApproveListing = () => {
    console.log('🔵 handleApproveListing called', { 
      selectedApplication, 
      tickerSymbol, 
      isinCode, 
      listingDate, 
      openingPrice 
    });
    
    if (!selectedApplication) {
      console.log('❌ No selected application');
      return;
    }
    
    if (!tickerSymbol || !isinCode || !listingDate || !openingPrice) {
      console.log('❌ Missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create listing record
      const listingKey = `listing_${selectedApplication.id}`;
      const listingData = {
        applicationId: selectedApplication.id,
        companyName: selectedApplication.company_name,
        tickerSymbol: tickerSymbol.toUpperCase(),
        isinCode: isinCode.toUpperCase(),
        listingDate: listingDate,
        openingPrice: parseFloat(openingPrice),
        sharesOffered: selectedApplication.shares_offered,
        marketCap: selectedApplication.shares_offered * parseFloat(openingPrice),
        sector: selectedApplication.sector,
        marketSegment: marketSegment,
        status: 'LISTING_APPROVED',
        approvalDate: new Date().toISOString(),
        notes: listingNotes
      };
      
      localStorage.setItem(listingKey, JSON.stringify(listingData));
      console.log('✅ Saved listing approval:', { listingKey, status: listingData.status, listingData });
      
      // Verify it was saved
      const savedData = localStorage.getItem(listingKey);
      console.log('✅ Verified saved data:', savedData ? JSON.parse(savedData) : 'NOT FOUND');
      
      // Reset form
      setTickerSymbol('');
      setIsinCode('');
      setListingDate('');
      setOpeningPrice('');
      setListingNotes('');
      setSelectedApplication(null);
      
      console.log('🔄 Calling loadApplications...');
      // Reload applications from localStorage to update the dashboard
      loadApplications();
      
      console.log('🔄 Switching to approved tab...');
      // Switch to the "Listing Approved" tab to show the result
      setActiveTab('approved');
      
      console.log('✅ All done, showing alert');
      alert(`✅ Listing Approved!\n\nTicker: ${tickerSymbol.toUpperCase()}\nISIN: ${isinCode.toUpperCase()}\nListing Date: ${listingDate}`);
    } catch (error) {
      console.error('Error approving listing:', error);
      alert('Error approving listing');
    }
  };

  const handleMarkAsListed = (application: ListingApplication) => {
    try {
      const listingKey = `listing_${application.id}`;
      const listingData = localStorage.getItem(listingKey);
      
      if (listingData) {
        const listing = JSON.parse(listingData);
        listing.status = 'LISTED';
        listing.listedDate = new Date().toISOString();
        localStorage.setItem(listingKey, JSON.stringify(listing));
        
        // Reload applications from localStorage to update the dashboard
        loadApplications();
        
        // Switch to the "Listed Companies" tab to show the result
        setActiveTab('listed');
        
        alert(`🎉 ${application.company_name} is now LISTED on SHORA Exchange!\n\nTrading begins: ${application.listing_date}`);
      }
    } catch (error) {
      console.error('Error marking as listed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_LISTING':
        return 'bg-yellow-100 text-yellow-800';
      case 'LISTING_APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'LISTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_LISTING':
        return <Clock className="h-4 w-4" />;
      case 'LISTING_APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'LISTED':
        return <TrendingUp className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const pendingApplications = applications.filter(a => a.listing_status === 'PENDING_LISTING');
  const approvedApplications = applications.filter(a => a.listing_status === 'LISTING_APPROVED');
  const listedCompanies = applications.filter(a => a.listing_status === 'LISTED');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/capitallab/collaborative">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Hub
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">SHORA Exchange</h1>
                  <p className="text-sm text-gray-600">Listing Committee & Market Operations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadApplications}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Award className="h-3 w-3 mr-1" />
                Exchange
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Link href="/auth/shora-exchange-logout">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Listing</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingApplications.length}</p>
                  <p className="text-xs text-yellow-500">CMA Approved</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Listing Approved</p>
                  <p className="text-2xl font-bold text-blue-900">{approvedApplications.length}</p>
                  <p className="text-xs text-blue-500">Awaiting Listing Day</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Listed Companies</p>
                  <p className="text-2xl font-bold text-green-900">{listedCompanies.length}</p>
                  <p className="text-xs text-green-500">Trading Active</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Market Cap</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {listedCompanies.reduce((sum, app) => 
                      sum + (app.shares_offered * (app.offer_price || 0)), 0
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-500">RWF</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending Listing ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Listing Approved ({approvedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="listed">
              Listed Companies ({listedCompanies.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Listing Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications List */}
              <Card>
                <CardHeader>
                  <CardTitle>CMA-Approved Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : pendingApplications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Pending Listing</h3>
                      <p className="text-gray-600 mb-4">
                        Waiting for CMA-approved companies to be submitted for exchange listing.
                      </p>
                      <div className="text-sm text-gray-500 max-w-md mx-auto">
                        <p className="mb-2">To list a company:</p>
                        <ol className="list-decimal list-inside space-y-1 text-left">
                          <li>Company submits IPO application to CMA</li>
                          <li>CMA Regulator reviews and approves</li>
                          <li>Approved companies appear here automatically</li>
                          <li>SHORA Exchange Committee approves listing</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingApplications.map((application) => (
                        <div
                          key={application.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedApplication?.id === application.id
                              ? 'border-purple-500 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedApplication(application)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{application.company_name}</h3>
                              <p className="text-sm text-gray-500">{application.application_number}</p>
                            </div>
                            <Badge className={getStatusColor(application.listing_status)}>
                              {getStatusIcon(application.listing_status)}
                              <span className="ml-1">Pending</span>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">CMA Approved:</span>
                              <p className="font-medium">
                                {new Date(application.cma_approval_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Target Amount:</span>
                              <p className="font-medium">RWF {application.target_amount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Listing Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedApplication ? `List: ${selectedApplication.company_name}` : 'Select Application'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedApplication ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Select an application to begin listing process</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Company Info */}
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">Company Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-purple-600">Shares Offered:</span>
                            <p className="font-medium">{selectedApplication.shares_offered.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-purple-600">Offer Price:</span>
                            <p className="font-medium">RWF {selectedApplication.offer_price}</p>
                          </div>
                        </div>
                      </div>

                      {/* Ticker Symbol */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Ticker Symbol <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            value={tickerSymbol}
                            onChange={(e) => setTickerSymbol(e.target.value.toUpperCase())}
                            placeholder="e.g., RTSL"
                            maxLength={5}
                            className="uppercase"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setTickerSymbol(generateTickerSymbol(selectedApplication.company_name))}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>

                      {/* ISIN Code */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          ISIN Code <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            value={isinCode}
                            onChange={(e) => setIsinCode(e.target.value.toUpperCase())}
                            placeholder="e.g., RW0000000001"
                            maxLength={12}
                            className="uppercase"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setIsinCode(generateISIN(tickerSymbol))}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>

                      {/* Listing Date */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Listing Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={listingDate}
                          onChange={(e) => setListingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Opening Price */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Opening Price (RWF) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          value={openingPrice}
                          onChange={(e) => setOpeningPrice(e.target.value)}
                          placeholder={`Suggested: ${selectedApplication.offer_price}`}
                        />
                      </div>

                      {/* Market Segment */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Market Segment</label>
                        <select
                          value={marketSegment}
                          onChange={(e) => setMarketSegment(e.target.value as any)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="MAIN_BOARD">Main Board</option>
                          <option value="ALTERNATIVE_BOARD">Alternative Board (SME)</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Listing Notes</label>
                        <Textarea
                          value={listingNotes}
                          onChange={(e) => setListingNotes(e.target.value)}
                          placeholder="Any special notes or conditions..."
                          rows={3}
                        />
                      </div>

                      {/* Approve Button */}
                      <Button
                        onClick={handleApproveListing}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={!tickerSymbol || !isinCode || !listingDate || !openingPrice}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve for Listing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listing Approved Tab */}
          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approved for Listing - Awaiting Listing Day</CardTitle>
              </CardHeader>
              <CardContent>
                {approvedApplications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No companies approved for listing yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedApplications.map((application) => (
                      <div key={application.id} className="p-6 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{application.company_name}</h3>
                            <p className="text-sm text-gray-600">{application.ticker_symbol} • {application.isin_code}</p>
                          </div>
                          <Badge className="bg-blue-600 text-white">
                            <Calendar className="h-3 w-3 mr-1" />
                            Listing: {application.listing_date ? new Date(application.listing_date).toLocaleDateString() : 'TBD'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Ticker</p>
                            <p className="font-semibold">{application.ticker_symbol}</p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">ISIN</p>
                            <p className="font-semibold text-xs">{application.isin_code}</p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Opening Price</p>
                            <p className="font-semibold">RWF {application.offer_price}</p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Market Segment</p>
                            <p className="font-semibold text-xs">{application.market_segment}</p>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleMarkAsListed(application)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Mark as Listed - Begin Trading
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listed Companies Tab */}
          <TabsContent value="listed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listed Companies - Active Trading</CardTitle>
              </CardHeader>
              <CardContent>
                {listedCompanies.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No companies listed yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listedCompanies.map((application) => (
                      <div key={application.id} className="p-6 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{application.company_name}</h3>
                            <p className="text-sm text-gray-600">{application.ticker_symbol} • {application.isin_code}</p>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            LISTED
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-4">
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Ticker</p>
                            <p className="font-semibold">{application.ticker_symbol}</p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Listed Date</p>
                            <p className="font-semibold text-xs">
                              {application.listing_date ? new Date(application.listing_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Last Price</p>
                            <p className="font-semibold">RWF {application.offer_price}</p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Market Cap</p>
                            <p className="font-semibold text-xs">
                              RWF {((application.shares_offered * (application.offer_price || 0)) / 1000000).toFixed(1)}M
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <p className="text-xs text-gray-500">Sector</p>
                            <p className="font-semibold text-xs">{application.sector}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


export default function SHORAListingPage() {
  return (
    <SimpleProtectedRoute 
      allowedRoles={['SHORA_EXCHANGE']}
      redirectTo="/auth/shora-exchange-login"
    >
      <SHORAListingPageContent />
    </SimpleProtectedRoute>
  );
}

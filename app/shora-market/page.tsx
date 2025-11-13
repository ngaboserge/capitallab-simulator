'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown,
  Search,
  BarChart3,
  Clock,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Building2,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface ListedCompany {
  ticker: string;
  company_name: string;
  isin: string;
  sector: string;
  last_price: number;
  open_price: number;
  high_price: number;
  low_price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  listed_date: string;
}

export default function SHORAMarketDashboard() {
  const [companies, setCompanies] = useState<ListedCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<ListedCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fix hydration error by only showing time after mount
  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      updatePrices();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchQuery, selectedSector]);

  const loadMarketData = () => {
    try {
      setLoading(true);
      
      // Load all listed companies from localStorage
      const allKeys = Object.keys(localStorage);
      const listingKeys = allKeys.filter(key => key.startsWith('listing_'));
      
      const loadedCompanies: ListedCompany[] = [];

      listingKeys.forEach(key => {
        try {
          const listingData = localStorage.getItem(key);
          if (listingData) {
            const listing = JSON.parse(listingData);
            
            // Only include LISTED companies
            if (listing.status === 'LISTED') {
              // Simulate market data
              const openPrice = listing.openingPrice || 500;
              const randomChange = (Math.random() - 0.5) * 20; // -10 to +10
              const lastPrice = openPrice + randomChange;
              const changePercent = (randomChange / openPrice) * 100;
              
              const company: ListedCompany = {
                ticker: listing.tickerSymbol,
                company_name: listing.companyName,
                isin: listing.isinCode,
                sector: listing.sector || 'Technology',
                last_price: Math.round(lastPrice * 100) / 100,
                open_price: openPrice,
                high_price: Math.round((openPrice + Math.abs(randomChange) + 5) * 100) / 100,
                low_price: Math.round((openPrice - Math.abs(randomChange) - 5) * 100) / 100,
                change: Math.round(randomChange * 100) / 100,
                change_percent: Math.round(changePercent * 100) / 100,
                volume: Math.floor(Math.random() * 1000000) + 100000,
                market_cap: listing.marketCap || (listing.sharesOffered * openPrice),
                listed_date: listing.listingDate
              };
              
              loadedCompanies.push(company);
            }
          }
        } catch (e) {
          console.error(`Error loading ${key}:`, e);
        }
      });

      // Only show real listed companies (no mock data)
      setCompanies(loadedCompanies);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = () => {
    setCompanies(prev => prev.map(company => {
      // Simulate small price changes
      const priceChange = (Math.random() - 0.5) * 2; // -1 to +1
      const newPrice = Math.max(company.last_price + priceChange, 1);
      const totalChange = newPrice - company.open_price;
      const changePercent = (totalChange / company.open_price) * 100;
      
      return {
        ...company,
        last_price: Math.round(newPrice * 100) / 100,
        high_price: Math.max(company.high_price, newPrice),
        low_price: Math.min(company.low_price, newPrice),
        change: Math.round(totalChange * 100) / 100,
        change_percent: Math.round(changePercent * 100) / 100,
        volume: company.volume + Math.floor(Math.random() * 1000)
      };
    }));
    
    setLastUpdate(new Date());
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by sector
    if (selectedSector !== 'ALL') {
      filtered = filtered.filter(company => company.sector === selectedSector);
    }

    setFilteredCompanies(filtered);
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Calculate market statistics
  const totalMarketCap = companies.reduce((sum, c) => sum + c.market_cap, 0);
  const totalVolume = companies.reduce((sum, c) => sum + c.volume, 0);
  const advancers = companies.filter(c => c.change > 0).length;
  const decliners = companies.filter(c => c.change < 0).length;
  const unchanged = companies.filter(c => c.change === 0).length;

  // Get unique sectors
  const sectors = ['ALL', ...Array.from(new Set(companies.map(c => c.sector)))];

  // Top gainers and losers
  const topGainers = [...companies].sort((a, b) => b.change_percent - a.change_percent).slice(0, 3);
  const topLosers = [...companies].sort((a, b) => a.change_percent - b.change_percent).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SHORA Exchange</h1>
                <p className="text-purple-100">Stock and Holdings Registry of Africa</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 text-purple-100 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Last Update: {mounted && lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMarketData}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Listed Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-2xl font-bold text-gray-900">
                {(totalMarketCap / 1000000000).toFixed(2)}B
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                {(totalVolume / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Advancers</p>
              <p className="text-2xl font-bold text-green-600">{advancers}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Decliners</p>
              <p className="text-2xl font-bold text-red-600">{decliners}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticker or company name..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {sectors.map(sector => (
                  <Button
                    key={sector}
                    variant={selectedSector === sector ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSector(sector)}
                    className="whitespace-nowrap"
                  >
                    {sector}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Market Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 animate-pulse mx-auto mb-4 text-gray-400" />
                    <p>Loading market data...</p>
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listed Companies</h3>
                    <p className="text-gray-600 mb-4">
                      {companies.length === 0 
                        ? "No companies have been listed on SHORA Exchange yet." 
                        : "No companies match your search criteria."
                      }
                    </p>
                    {companies.length === 0 && (
                      <div className="text-sm text-gray-500 max-w-md mx-auto">
                        <p className="mb-2">To list a company:</p>
                        <ol className="list-decimal list-inside space-y-1 text-left">
                          <li>Company gets CMA approval</li>
                          <li>SHORA Exchange Committee approves listing</li>
                          <li>Company appears here with live trading data</li>
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mkt Cap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredCompanies.map((company) => (
                          <tr key={company.ticker} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-blue-600">{company.ticker}</div>
                              <div className="text-xs text-gray-500">{company.sector}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 text-sm">{company.company_name}</div>
                              <div className="text-xs text-gray-500">{company.isin}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-semibold">{company.last_price.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                H: {company.high_price.toFixed(2)} L: {company.low_price.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className={`flex items-center justify-end ${
                                company.change > 0 ? 'text-green-600' :
                                company.change < 0 ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {getPriceChangeIcon(company.change)}
                                <span className="ml-1 font-medium">{company.change.toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Badge className={getPriceChangeColor(company.change)}>
                                {company.change_percent > 0 ? '+' : ''}{company.change_percent.toFixed(2)}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {(company.volume / 1000).toFixed(0)}K
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {(company.market_cap / 1000000).toFixed(1)}M
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Gainers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGainers.map((company) => (
                    <div key={company.ticker} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <div className="font-bold text-sm">{company.ticker}</div>
                        <div className="text-xs text-gray-600">{company.last_price.toFixed(2)}</div>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        +{company.change_percent.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLosers.map((company) => (
                    <div key={company.ticker} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <div className="font-bold text-sm">{company.ticker}</div>
                        <div className="text-xs text-gray-600">{company.last_price.toFixed(2)}</div>
                      </div>
                      <Badge className="bg-red-600 text-white">
                        {company.change_percent.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Market Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trading Session:</span>
                    <Badge className="bg-green-600 text-white">OPEN</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Time:</span>
                    <span className="font-medium">09:00 - 15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settlement:</span>
                    <span className="font-medium">T+2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">RWF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/capitallab/collaborative">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    CapitalLab Hub
                  </Button>
                </Link>
                <Link href="/capitallab/collaborative/rse-listing">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Listing Committee
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

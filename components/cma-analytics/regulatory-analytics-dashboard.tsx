'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Users,
    Target,
    Activity,
    Filter,
    Download
} from 'lucide-react';

interface AnalyticsData {
    totalApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    pendingApplications: number;
    averageProcessingTime: number;
    totalCapitalRaised: number;
    complianceScore: number;
    monthlyTrends: MonthlyTrend[];
    applicationsByStatus: StatusBreakdown[];
    processingTimeByStage: ProcessingStage[];
    topPerformingIssuers: IssuerPerformance[];
}

interface MonthlyTrend {
    month: string;
    applications: number;
    approvals: number;
    rejections: number;
    avgProcessingTime: number;
}

interface StatusBreakdown {
    status: string;
    count: number;
    percentage: number;
    color: string;
}

interface ProcessingStage {
    stage: string;
    avgDays: number;
    minDays: number;
    maxDays: number;
}

interface IssuerPerformance {
    issuerName: string;
    applications: number;
    approvalRate: number;
    avgProcessingTime: number;
    totalCapital: number;
}

export function RegulatoryAnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [activeView, setActiveView] = useState<'overview' | 'trends' | 'performance' | 'compliance'>('overview');

    // Mock analytics data
    const analyticsData: AnalyticsData = {
        totalApplications: 156,
        approvedApplications: 142,
        rejectedApplications: 8,
        pendingApplications: 6,
        averageProcessingTime: 42,
        totalCapitalRaised: 45600000000, // RWF 45.6B
        complianceScore: 94,
        monthlyTrends: [
            { month: 'Jan', applications: 12, approvals: 11, rejections: 1, avgProcessingTime: 38 },
            { month: 'Feb', applications: 15, approvals: 14, rejections: 1, avgProcessingTime: 41 },
            { month: 'Mar', applications: 18, approvals: 16, rejections: 2, avgProcessingTime: 45 },
            { month: 'Apr', applications: 22, approvals: 20, rejections: 1, avgProcessingTime: 39 },
            { month: 'May', applications: 19, approvals: 18, rejections: 1, avgProcessingTime: 44 },
            { month: 'Jun', applications: 25, approvals: 23, rejections: 2, avgProcessingTime: 42 }
        ],
        applicationsByStatus: [
            { status: 'Approved', count: 142, percentage: 91, color: 'bg-green-500' },
            { status: 'Under Review', count: 6, percentage: 4, color: 'bg-yellow-500' },
            { status: 'Rejected', count: 8, percentage: 5, color: 'bg-red-500' }
        ],
        processingTimeByStage: [
            { stage: 'Initial Review', avgDays: 7, minDays: 3, maxDays: 14 },
            { stage: 'Document Verification', avgDays: 12, minDays: 8, maxDays: 18 },
            { stage: 'Compliance Assessment', avgDays: 15, minDays: 10, maxDays: 25 },
            { stage: 'Final Decision', avgDays: 8, minDays: 5, maxDays: 12 }
        ],
        topPerformingIssuers: [
            { issuerName: 'Rwanda Tech Solutions Ltd', applications: 3, approvalRate: 100, avgProcessingTime: 35, totalCapital: 1500000000 },
            { issuerName: 'Green Energy Rwanda PLC', applications: 2, approvalRate: 100, avgProcessingTime: 38, totalCapital: 2200000000 },
            { issuerName: 'East Africa Mining Corp', applications: 4, approvalRate: 75, avgProcessingTime: 45, totalCapital: 3800000000 },
            { issuerName: 'Rwanda Financial Services', applications: 2, approvalRate: 100, avgProcessingTime: 32, totalCapital: 1800000000 }
        ]
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000000) {
            return `RWF ${(amount / 1000000000).toFixed(1)}B`;
        } else if (amount >= 1000000) {
            return `RWF ${(amount / 1000000).toFixed(0)}M`;
        }
        return `RWF ${amount.toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Regulatory Analytics</h2>
                    <p className="text-gray-600">CMA Rwanda - Capital Markets Performance Dashboard</p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Time Range Selector */}
                    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                        {[
                            { id: '7d', label: '7D' },
                            { id: '30d', label: '30D' },
                            { id: '90d', label: '90D' },
                            { id: '1y', label: '1Y' }
                        ].map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id as any)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeRange === range.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'trends', label: 'Trends', icon: TrendingUp },
                    { id: 'performance', label: 'Performance', icon: Target },
                    { id: 'compliance', label: 'Compliance', icon: CheckCircle }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeView === 'overview' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Total Applications</p>
                                        <p className="text-3xl font-bold text-blue-900">{analyticsData.totalApplications}</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-sm text-green-600">+12% vs last period</span>
                                        </div>
                                    </div>
                                    <FileText className="h-12 w-12 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Approval Rate</p>
                                        <p className="text-3xl font-bold text-green-900">
                                            {Math.round((analyticsData.approvedApplications / analyticsData.totalApplications) * 100)}%
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-sm text-green-600">+2% vs last period</span>
                                        </div>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Avg Processing Time</p>
                                        <p className="text-3xl font-bold text-purple-900">{analyticsData.averageProcessingTime}</p>
                                        <p className="text-sm text-purple-600">days</p>
                                        <div className="flex items-center mt-2">
                                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-sm text-green-600">-5 days improved</span>
                                        </div>
                                    </div>
                                    <Clock className="h-12 w-12 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Capital Raised</p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            {formatCurrency(analyticsData.totalCapitalRaised)}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-sm text-green-600">+18% vs last period</span>
                                        </div>
                                    </div>
                                    <Target className="h-12 w-12 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <PieChart className="h-5 w-5 text-blue-600" />
                                    <span>Application Status Distribution</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.applicationsByStatus.map((status, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded ${status.color}`}></div>
                                                <span className="font-medium text-gray-700">{status.status}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-500">{status.count} applications</span>
                                                <Badge variant="outline">{status.percentage}%</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Visual representation */}
                                <div className="mt-6">
                                    <div className="flex rounded-lg overflow-hidden h-4">
                                        {analyticsData.applicationsByStatus.map((status, index) => (
                                            <div
                                                key={index}
                                                className={status.color}
                                                style={{ width: `${status.percentage}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5 text-green-600" />
                                    <span>Processing Time by Stage</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.processingTimeByStage.map((stage, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">{stage.stage}</span>
                                                <span className="text-sm font-bold text-blue-600">{stage.avgDays} days</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span>Min: {stage.minDays}d</span>
                                                <span>•</span>
                                                <span>Max: {stage.maxDays}d</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${(stage.avgDays / stage.maxDays) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Trends Tab */}
            {activeView === 'trends' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span>Monthly Application Trends</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Chart placeholder - in real implementation, use a charting library */}
                                <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-lg border flex items-end justify-around p-4">
                                    {analyticsData.monthlyTrends.map((trend, index) => (
                                        <div key={index} className="flex flex-col items-center space-y-2">
                                            <div className="flex space-x-1">
                                                <div
                                                    className="bg-blue-500 rounded-t"
                                                    style={{
                                                        height: `${(trend.applications / 25) * 120}px`,
                                                        width: '12px'
                                                    }}
                                                ></div>
                                                <div
                                                    className="bg-green-500 rounded-t"
                                                    style={{
                                                        height: `${(trend.approvals / 25) * 120}px`,
                                                        width: '12px'
                                                    }}
                                                ></div>
                                                <div
                                                    className="bg-red-500 rounded-t"
                                                    style={{
                                                        height: `${(trend.rejections / 25) * 120}px`,
                                                        width: '12px'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">{trend.month}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center justify-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                        <span className="text-sm text-gray-600">Applications</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-sm text-gray-600">Approvals</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                                        <span className="text-sm text-gray-600">Rejections</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Processing Time Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-purple-600" />
                                <span>Processing Time Trends</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 bg-gradient-to-t from-purple-50 to-white rounded-lg border flex items-end justify-around p-4">
                                {analyticsData.monthlyTrends.map((trend, index) => (
                                    <div key={index} className="flex flex-col items-center space-y-2">
                                        <div
                                            className="bg-purple-500 rounded-t"
                                            style={{
                                                height: `${(trend.avgProcessingTime / 50) * 120}px`,
                                                width: '20px'
                                            }}
                                        ></div>
                                        <span className="text-xs font-medium text-gray-600">{trend.month}</span>
                                        <span className="text-xs text-purple-600">{trend.avgProcessingTime}d</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Performance Tab */}
            {activeView === 'performance' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-green-600" />
                                <span>Top Performing Issuers</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.topPerformingIssuers.map((issuer, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{issuer.issuerName}</h4>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                <span>{issuer.applications} applications</span>
                                                <span>•</span>
                                                <span>{issuer.approvalRate}% approval rate</span>
                                                <span>•</span>
                                                <span>{issuer.avgProcessingTime} days avg</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">{formatCurrency(issuer.totalCapital)}</p>
                                            <p className="text-xs text-gray-500">Total Capital</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">SLA Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                                    <p className="text-sm text-gray-600">Applications processed within SLA</p>
                                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quality Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
                                    <p className="text-sm text-gray-600">Average compliance score</p>
                                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Efficiency Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">A+</div>
                                    <p className="text-sm text-gray-600">Regulatory efficiency grade</p>
                                    <div className="mt-4 flex justify-center">
                                        <Badge className="bg-purple-100 text-purple-800">Excellent</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Compliance Tab */}
            {activeView === 'compliance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span>Compliance Categories</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { category: 'Financial Requirements', score: 96, trend: 'up' },
                                        { category: 'Legal Documentation', score: 94, trend: 'up' },
                                        { category: 'Governance Standards', score: 91, trend: 'stable' },
                                        { category: 'Disclosure Requirements', score: 97, trend: 'up' },
                                        { category: 'Risk Management', score: 89, trend: 'down' }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-700">{item.category}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-gray-900">{item.score}%</span>
                                                        {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                        {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                                        {item.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full"></div>}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${item.score >= 95 ? 'bg-green-500' :
                                                            item.score >= 90 ? 'bg-blue-500' :
                                                                item.score >= 85 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                            }`}
                                                        style={{ width: `${item.score}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <span>Common Issues</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { issue: 'Incomplete board resolutions', frequency: 23, severity: 'medium' },
                                        { issue: 'Missing independent director CVs', frequency: 18, severity: 'high' },
                                        { issue: 'Unclear use of proceeds', frequency: 15, severity: 'medium' },
                                        { issue: 'Insufficient financial projections', frequency: 12, severity: 'high' },
                                        { issue: 'Outdated auditor opinions', frequency: 8, severity: 'low' }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm">{item.issue}</p>
                                                <p className="text-xs text-gray-500">{item.frequency} occurrences</p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${item.severity === 'high' ? 'border-red-300 text-red-700' :
                                                    item.severity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                                        'border-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                {item.severity}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Regulatory Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                <span>Regulatory Recommendations</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Process Improvements</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span>Implement pre-submission consultation sessions</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span>Create standardized document templates</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span>Enhance digital submission platform</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span>Automate initial compliance checks</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Training Initiatives</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start space-x-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Issuer education workshops</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Legal advisor certification programs</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Best practices documentation</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Regular stakeholder feedback sessions</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
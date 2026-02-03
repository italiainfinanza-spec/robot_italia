'use client';

import React, { useState, useCallback } from 'react';
import { Send, TestTube, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Newsletter Sender Component
 * 
 * Best Practices Applied:
 * - Controlled inputs with validation
 * - Loading states for async operations
 * - Error boundaries (via try/catch)
 * - Accessibility: ARIA labels, keyboard navigation
 * - Responsive design with Tailwind
 * - TypeScript strict typing
 */

interface SendResult {
  success: boolean;
  data?: {
    recipientsCount: number;
    successfulCount: number;
    failedCount: number;
    errors: Array<{ email: string; error: string }>;
    campaignId?: string;
    segment: string;
  };
  error?: string;
}

export function NewsletterSender() {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [testEmails, setTestEmails] = useState('');
  const [segment, setSegment] = useState<'test' | 'free' | 'premium' | 'all'>('test');
  const [campaignId, setCampaignId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = useCallback((): boolean => {
    const errs: string[] = [];
    
    if (!subject.trim()) errs.push('Subject is required');
    if (subject.length > 200) errs.push('Subject must be under 200 characters');
    if (!htmlContent.trim()) errs.push('HTML content is required');
    
    if (segment === 'test') {
      const emails = testEmails.split(',').map(e => e.trim()).filter(Boolean);
      if (emails.length === 0) errs.push('At least one test email is required for test mode');
      if (emails.length > 10) errs.push('Maximum 10 test emails allowed');
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(e => !emailRegex.test(e));
      if (invalidEmails.length > 0) errs.push(`Invalid email format: ${invalidEmails.join(', ')}`);
    }
    
    setErrors(errs);
    return errs.length === 0;
  }, [subject, htmlContent, testEmails, segment]);

  const handleSend = useCallback(async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const payload: Record<string, unknown> = {
        subject: subject.trim(),
        html: htmlContent.trim(),
        text: textContent.trim() || undefined,
        segment,
        campaignId: campaignId.trim() || undefined,
      };
      
      if (segment === 'test') {
        payload.testEmails = testEmails.split(',').map(e => e.trim()).filter(Boolean);
      }
      
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || 'Failed to send newsletter'
        });
      } else {
        setResult({
          success: true,
          data: data.data
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  }, [validate, subject, htmlContent, textContent, segment, campaignId, testEmails]);

  const loadTemplate = useCallback((templateName: string) => {
    const templates: Record<string, { subject: string; html: string }> = {
      'premium-001': {
        subject: 'Figure AI: The $39B Robot Unicorn 🚀',
        html: '<h1>Welcome to Robotica Weekly</h1><p>Your premium robotics intelligence briefing.</p>'
      },
      'premium-002': {
        subject: 'NVIDIA\'s "ChatGPT Moment" for Robots 🚀',
        html: '<h1>NVIDIA Cosmos: The Android of Robotics</h1><p>Breaking down the Physical AI platform.</p>'
      }
    };
    
    const template = templates[templateName];
    if (template) {
      setSubject(template.subject);
      setHtmlContent(template.html);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" />
            Send Newsletter
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Compose and send newsletters to your subscribers
          </p>
        </div>
        
        {/* Quick Templates */}
        <div className="flex gap-2">
          <span className="text-slate-500 text-sm self-center mr-2">Load template:</span>
          <button
            onClick={() => loadTemplate('premium-001')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Premium #001
          </button>
          <button
            onClick={() => loadTemplate('premium-002')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Premium #002
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-red-400 font-medium text-sm">Please fix the following errors:</h3>
              <ul className="text-red-300 text-sm list-disc list-inside">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className={`rounded-lg p-4 ${result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`font-medium text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? 'Newsletter Sent Successfully' : 'Failed to Send Newsletter'}
              </h3>
              {result.success && result.data ? (
                <div className="mt-2 text-green-300 text-sm space-y-1">
                  <p>✓ Sent to {result.data.successfulCount} of {result.data.recipientsCount} recipients</p>
                  {result.data.failedCount > 0 && (
                    <p className="text-yellow-300">
                      ⚠ {result.data.failedCount} failed ({result.data.errors.length} errors)
                    </p>
                  )}
                  <p className="text-xs text-green-400/60 mt-2">
                    Campaign ID: {result.data.campaignId || 'N/A'} | Segment: {result.data.segment}
                  </p>
                </div>
              ) : (
                <p className="text-red-300 text-sm mt-1">{result.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Settings */}
        <div className="space-y-4">
          {/* Segment Selection */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <label className="text-slate-300 font-medium text-sm mb-3 block flex items-center gap-2">
              <Users className="w-4 h-4" />
              Target Segment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'test', label: 'Test Mode', icon: TestTube },
                { value: 'free', label: 'Free Subscribers', icon: Users },
                { value: 'premium', label: 'Premium', icon: Users },
                { value: 'all', label: 'All Subscribers', icon: Users },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSegment(option.value as typeof segment)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    segment === option.value
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">
              {segment === 'test' 
                ? 'Test mode: Send to specific email addresses (max 10)' 
                : segment === 'all'
                ? 'Send to all active subscribers'
                : `Send to ${segment} tier subscribers only`}
            </p>
          </div>

          {/* Test Emails (only in test mode) */}
          {segment === 'test' && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <label htmlFor="testEmails" className="text-slate-300 font-medium text-sm mb-2 block">
                Test Email Addresses
              </label>
              <textarea
                id="testEmails"
                value={testEmails}
                onChange={(e) => setTestEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
              />
              <p className="text-slate-500 text-xs mt-1.5">
                Comma-separated email addresses (max 10 for testing)
              </p>
            </div>
          )}

          {/* Subject */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <label htmlFor="subject" className="text-slate-300 font-medium text-sm mb-2 block">
              Subject Line <span className="text-slate-500">({subject.length}/200)</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject..."
              maxLength={200}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Campaign ID */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <label htmlFor="campaignId" className="text-slate-300 font-medium text-sm mb-2 block">
              Campaign ID <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="campaignId"
              type="text"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="e.g., newsletter-2026-02-001"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
            <p className="text-slate-500 text-xs mt-1.5">
              Used for tracking and analytics
            </p>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="space-y-4">
          {/* HTML Content */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <label htmlFor="htmlContent" className="text-slate-300 font-medium text-sm mb-2 block">
              HTML Content
            </label>
            <textarea
              id="htmlContent"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<h1>Your newsletter content...</h1>"
              rows={10}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            />
            <p className="text-slate-500 text-xs mt-1.5">
              Full HTML email content. Inline CSS recommended for email clients.
            </p>
          </div>

          {/* Text Content */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <label htmlFor="textContent" className="text-slate-300 font-medium text-sm mb-2 block">
              Plain Text Version <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="textContent"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Plain text version for email clients that don't support HTML..."
              rows={5}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            />
            <p className="text-slate-500 text-xs mt-1.5">
              Auto-generated from HTML if left empty
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            setSubject('');
            setHtmlContent('');
            setTextContent('');
            setTestEmails('');
            setCampaignId('');
            setErrors([]);
            setResult(null);
          }}
          disabled={isLoading}
          className="px-4 py-2 text-slate-400 hover:text-slate-300 font-medium text-sm transition-colors disabled:opacity-50"
        >
          Clear Form
        </button>
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {segment === 'test' ? 'Send Test' : 'Send Newsletter'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Globe, Search, Download, Trash2, Clock, CheckCircle, XCircle, Eye, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ScrapingResult {
  id: string;
  url: string;
  title: string;
  content: string;
  metadata: {
    description?: string;
    keywords?: string[];
    author?: string;
    publishDate?: string;
    wordCount: number;
    images: string[];
    links: string[];
  };
  scrapedAt: string;
  status: 'success' | 'failed';
  error?: string;
}

interface ScrapingJob {
  id: string;
  urls: string[];
  options: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: ScrapingResult[];
  createdAt: string;
  completedAt?: string;
  progress: number;
}

export function WebScrapingPanel() {
  const [activeTab, setActiveTab] = useState('scrape');
  const [urls, setUrls] = useState('');
  const [singleUrl, setSingleUrl] = useState('');
  const [scrapingOptions, setScrapingOptions] = useState({
    useHeadlessBrowser: false,
    waitForDynamicContent: false,
    extractImages: false,
    extractLinks: true,
    timeout: 30000,
    customSelectors: {
      title: '',
      content: '',
      description: ''
    }
  });
  const [selectedJob, setSelectedJob] = useState<ScrapingJob | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all scraping jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['admin', 'webscraping', 'jobs'],
    queryFn: () => apiRequest('/api/admin/webscraping/jobs'),
    refetchInterval: 2000 // Refresh every 2 seconds for real-time updates
  });

  // Create batch scraping job
  const createJobMutation = useMutation({
    mutationFn: (data: { urls: string[], options: any }) => 
      apiRequest('/api/admin/webscraping/jobs', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (data) => {
      toast({
        title: "Scraping Job Created",
        description: `Job created successfully for ${urls.split('\n').filter(Boolean).length} URLs`,
      });
      setUrls('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'webscraping', 'jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Job",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Quick scrape single URL
  const [quickScrapeResult, setQuickScrapeResult] = useState<ScrapingResult | null>(null);
  const quickScrapeMutation = useMutation({
    mutationFn: (data: { url: string, options: any }) => 
      apiRequest('/api/admin/webscraping/scrape', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (data) => {
      setQuickScrapeResult(data);
      toast({
        title: "Quick Scrape Complete",
        description: `Scraped content from ${data.url}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quick Scrape Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete job
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => 
      apiRequest(`/api/admin/webscraping/jobs/${jobId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "Job Deleted",
        description: "Scraping job deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'webscraping', 'jobs'] });
    }
  });

  const handleCreateJob = () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    if (urlList.length === 0) {
      toast({
        title: "No URLs Provided",
        description: "Please enter at least one URL",
        variant: "destructive"
      });
      return;
    }

    createJobMutation.mutate({
      urls: urlList,
      options: scrapingOptions
    });
  };

  const handleQuickScrape = () => {
    if (!singleUrl.trim()) {
      toast({
        title: "No URL Provided",
        description: "Please enter a URL to scrape",
        variant: "destructive"
      });
      return;
    }

    quickScrapeMutation.mutate({
      url: singleUrl.trim(),
      options: scrapingOptions
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
          <Globe className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Web Scraping Center</h2>
          <p className="text-gray-600 dark:text-gray-400">Extract data from websites for AI training and analysis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scrape">Quick Scrape</TabsTrigger>
          <TabsTrigger value="batch">Batch Jobs</TabsTrigger>
          <TabsTrigger value="jobs">Job History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Quick Scrape
              </CardTitle>
              <CardDescription>
                Scrape a single URL instantly and view results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="single-url">URL to Scrape</Label>
                <Input
                  id="single-url"
                  placeholder="https://example.com/page"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleQuickScrape}
                disabled={quickScrapeMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {quickScrapeMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scrape Now
                  </>
                )}
              </Button>

              {quickScrapeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Scraping Result</span>
                        <Badge className={getStatusColor(quickScrapeResult.status)}>
                          {quickScrapeResult.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quickScrapeResult.title}</p>
                      </div>
                      
                      <div>
                        <Label>Word Count</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quickScrapeResult.metadata.wordCount}</p>
                      </div>

                      {quickScrapeResult.metadata.description && (
                        <div>
                          <Label>Description</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{quickScrapeResult.metadata.description}</p>
                        </div>
                      )}

                      <div>
                        <Label>Content Preview</Label>
                        <ScrollArea className="h-32 w-full rounded border p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {quickScrapeResult.content.substring(0, 500)}...
                          </p>
                        </ScrollArea>
                      </div>

                      {quickScrapeResult.error && (
                        <div>
                          <Label>Error</Label>
                          <p className="text-sm text-red-600">{quickScrapeResult.error}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Batch Scraping
              </CardTitle>
              <CardDescription>
                Create jobs to scrape multiple URLs simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urls">URLs (one per line)</Label>
                <Textarea
                  id="urls"
                  placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleCreateJob}
                disabled={createJobMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              >
                {createJobMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating Job...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Scraping Job
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Jobs</CardTitle>
              <CardDescription>
                Monitor and manage your scraping jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No scraping jobs yet</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {jobs.map((job: ScrapingJob) => (
                      <Card key={job.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <p className="font-medium">Job {job.id.substring(0, 8)}</p>
                              <p className="text-sm text-gray-500">
                                {job.urls.length} URLs • Created {new Date(job.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteJobMutation.mutate(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {job.status === 'running' && (
                          <div className="mt-4">
                            <Progress value={job.progress} className="w-full" />
                            <p className="text-sm text-gray-500 mt-1">{job.progress.toFixed(1)}% complete</p>
                          </div>
                        )}
                        
                        {job.status === 'completed' && (
                          <div className="mt-4">
                            <p className="text-sm text-green-600">
                              ✅ Completed • {job.results.filter(r => r.status === 'success').length} successful, {job.results.filter(r => r.status === 'failed').length} failed
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Scraping Options
              </CardTitle>
              <CardDescription>
                Configure how scraping should be performed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="headless-browser">Use Headless Browser</Label>
                <Switch
                  id="headless-browser"
                  checked={scrapingOptions.useHeadlessBrowser}
                  onCheckedChange={(checked) => 
                    setScrapingOptions(prev => ({ ...prev, useHeadlessBrowser: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dynamic-content">Wait for Dynamic Content</Label>
                <Switch
                  id="dynamic-content"
                  checked={scrapingOptions.waitForDynamicContent}
                  onCheckedChange={(checked) => 
                    setScrapingOptions(prev => ({ ...prev, waitForDynamicContent: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="extract-images">Extract Images</Label>
                <Switch
                  id="extract-images"
                  checked={scrapingOptions.extractImages}
                  onCheckedChange={(checked) => 
                    setScrapingOptions(prev => ({ ...prev, extractImages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="extract-links">Extract Links</Label>
                <Switch
                  id="extract-links"
                  checked={scrapingOptions.extractLinks}
                  onCheckedChange={(checked) => 
                    setScrapingOptions(prev => ({ ...prev, extractLinks: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (milliseconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={scrapingOptions.timeout}
                  onChange={(e) => 
                    setScrapingOptions(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Custom Selectors (optional)</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="title-selector">Title Selector</Label>
                  <Input
                    id="title-selector"
                    placeholder="e.g., h1.main-title"
                    value={scrapingOptions.customSelectors.title}
                    onChange={(e) => 
                      setScrapingOptions(prev => ({
                        ...prev,
                        customSelectors: { ...prev.customSelectors, title: e.target.value }
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-selector">Content Selector</Label>
                  <Input
                    id="content-selector"
                    placeholder="e.g., .article-content"
                    value={scrapingOptions.customSelectors.content}
                    onChange={(e) => 
                      setScrapingOptions(prev => ({
                        ...prev,
                        customSelectors: { ...prev.customSelectors, content: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Job Details</h3>
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Job ID</Label>
                  <p className="font-mono text-sm">{selectedJob.id}</p>
                </div>

                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </Badge>
                </div>

                <div>
                  <Label>URLs ({selectedJob.urls.length})</Label>
                  <ScrollArea className="h-32 w-full rounded border p-3">
                    {selectedJob.urls.map((url, index) => (
                      <div key={index} className="text-sm py-1">{url}</div>
                    ))}
                  </ScrollArea>
                </div>

                {selectedJob.results.length > 0 && (
                  <div>
                    <Label>Results ({selectedJob.results.length})</Label>
                    <ScrollArea className="h-64 w-full rounded border p-3">
                      {selectedJob.results.map((result, index) => (
                        <Card key={result.id} className="mb-4">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium truncate">{result.title || result.url}</p>
                              <Badge className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{result.url}</p>
                            {result.status === 'success' && (
                              <p className="text-sm">Words: {result.metadata.wordCount}</p>
                            )}
                            {result.error && (
                              <p className="text-sm text-red-600">{result.error}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import cmsAPI from './cmsAPI';

class SchedulingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start the scheduling service
  start(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.log('Scheduling service is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting scheduling service with ${intervalMinutes} minute intervals`);

    // Run immediately
    this.checkScheduledContent();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkScheduledContent();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop the scheduling service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Scheduling service stopped');
  }

  // Check and publish scheduled content
  private async checkScheduledContent() {
    try {
      console.log('Checking for scheduled content to publish...');
      await cmsAPI.publishScheduledContent();
      console.log('Scheduled content check completed');
    } catch (error) {
      console.error('Error checking scheduled content:', error);
    }
  }

  // Manual trigger for scheduled content publishing
  async publishScheduledContentNow() {
    try {
      await cmsAPI.publishScheduledContent();
      console.log('Manual scheduled content publishing completed');
    } catch (error) {
      console.error('Error in manual scheduled content publishing:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.intervalId !== null
    };
  }

  // Schedule a specific page to be published at a given time
  async schedulePage(pageId: string, publishAt: Date) {
    try {
      await cmsAPI.updatePage(pageId, {
        status: 'scheduled',
        scheduled_at: publishAt.toISOString()
      });
      console.log(`Page ${pageId} scheduled for publication at ${publishAt.toISOString()}`);
    } catch (error) {
      console.error('Error scheduling page:', error);
      throw error;
    }
  }

  // Schedule a specific post to be published at a given time
  async schedulePost(postId: number, publishAt: Date) {
    try {
      await cmsAPI.updatePost(postId, {
        status: 'scheduled',
        scheduled_at: publishAt.toISOString()
      });
      console.log(`Post ${postId} scheduled for publication at ${publishAt.toISOString()}`);
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  }

  // Get all scheduled content
  async getScheduledContent() {
    try {
      const [scheduledPages, scheduledPosts] = await Promise.all([
        cmsAPI.getPages({ status: 'scheduled' }),
        cmsAPI.getPosts({ status: 'scheduled' })
      ]);

      return {
        pages: scheduledPages,
        posts: scheduledPosts,
        total: scheduledPages.length + scheduledPosts.length
      };
    } catch (error) {
      console.error('Error getting scheduled content:', error);
      throw error;
    }
  }

  // Get upcoming scheduled content (next 24 hours)
  async getUpcomingContent() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const [scheduledPages, scheduledPosts] = await Promise.all([
        cmsAPI.getPages({ status: 'scheduled' }),
        cmsAPI.getPosts({ status: 'scheduled' })
      ]);

      const upcomingPages = scheduledPages.filter(page => {
        if (!page.scheduled_at) return false;
        const scheduledTime = new Date(page.scheduled_at);
        return scheduledTime >= now && scheduledTime <= tomorrow;
      });

      const upcomingPosts = scheduledPosts.filter(post => {
        if (!post.scheduled_at) return false;
        const scheduledTime = new Date(post.scheduled_at);
        return scheduledTime >= now && scheduledTime <= tomorrow;
      });

      return {
        pages: upcomingPages,
        posts: upcomingPosts,
        total: upcomingPages.length + upcomingPosts.length
      };
    } catch (error) {
      console.error('Error getting upcoming content:', error);
      throw error;
    }
  }

  // Cancel scheduled publication
  async cancelScheduledPage(pageId: string) {
    try {
      await cmsAPI.updatePage(pageId, {
        status: 'draft',
        scheduled_at: undefined
      });
      console.log(`Cancelled scheduled publication for page ${pageId}`);
    } catch (error) {
      console.error('Error cancelling scheduled page:', error);
      throw error;
    }
  }

  async cancelScheduledPost(postId: number) {
    try {
      await cmsAPI.updatePost(postId, {
        status: 'draft',
        scheduled_at: undefined
      });
      console.log(`Cancelled scheduled publication for post ${postId}`);
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      throw error;
    }
  }

  // Validate scheduled time
  validateScheduledTime(scheduledTime: Date): { isValid: boolean; error?: string } {
    const now = new Date();
    
    if (scheduledTime <= now) {
      return {
        isValid: false,
        error: 'Scheduled time must be in the future'
      };
    }

    // Don't allow scheduling more than 1 year in advance
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (scheduledTime > oneYearFromNow) {
      return {
        isValid: false,
        error: 'Cannot schedule more than 1 year in advance'
      };
    }

    return { isValid: true };
  }

  // Get scheduling statistics
  async getSchedulingStats() {
    try {
      const [allPages, allPosts] = await Promise.all([
        cmsAPI.getPages(),
        cmsAPI.getPosts()
      ]);

      const pageStats = {
        draft: allPages.filter(p => p.status === 'draft').length,
        scheduled: allPages.filter(p => p.status === 'scheduled').length,
        published: allPages.filter(p => p.status === 'published').length,
        archived: allPages.filter(p => p.status === 'archived').length
      };

      const postStats = {
        draft: allPosts.filter(p => p.status === 'draft' || !p.published).length,
        scheduled: allPosts.filter(p => p.status === 'scheduled').length,
        published: allPosts.filter(p => p.status === 'published' || p.published).length,
        archived: allPosts.filter(p => p.status === 'archived').length
      };

      return {
        pages: pageStats,
        posts: postStats,
        total: {
          draft: pageStats.draft + postStats.draft,
          scheduled: pageStats.scheduled + postStats.scheduled,
          published: pageStats.published + postStats.published,
          archived: pageStats.archived + postStats.archived
        }
      };
    } catch (error) {
      console.error('Error getting scheduling stats:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const schedulingService = new SchedulingService();

// Auto-start the service in production
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  schedulingService.start(5); // Check every 5 minutes in production
}

export default schedulingService;
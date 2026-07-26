import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@database/prisma.service';
import { WinstonLogger } from '@common/logger.service';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private logger: WinstonLogger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    try {
      const userCount = await this.prisma.user.count();
      const clientCount = await this.prisma.client.count();
      const caseCount = await this.prisma.case.count();

      return {
        timestamp: new Date().toISOString(),
        metrics: {
          users: userCount,
          clients: clientCount,
          cases: caseCount,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch metrics', error.stack, 'HealthController');
      throw error;
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Detailed system status' })
  @ApiResponse({ status: 200, description: 'System status retrieved successfully' })
  async getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
      },
      memory: {
        total: process.memoryUsage().heapTotal,
        used: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

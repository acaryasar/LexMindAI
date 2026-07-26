import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = 'logs';
    
    const transports: winston.transport[] = [
      // Console transport with colors
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, context, trace }) => {
            return `${timestamp} [${context || 'App'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
          }),
        ),
      }),
      
      // Error log file - daily rotation
      new DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
      }),
      
      // Combined log file - daily rotation
      new DailyRotateFile({
        dirname: logDir,
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
      }),
      
      // Security events log file - daily rotation
      new DailyRotateFile({
        dirname: logDir,
        filename: 'security-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'warn',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
      }),
    ];

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports,
      exceptionHandlers: [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom method for security events
  security(message: any, context?: string, metadata?: any) {
    this.logger.warn(message, { context, ...metadata, type: 'SECURITY_EVENT' });
  }

  // Custom method for audit logs
  audit(message: any, context?: string, metadata?: any) {
    this.logger.info(message, { context, ...metadata, type: 'AUDIT' });
  }
}

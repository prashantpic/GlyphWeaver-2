import mongoose from 'mongoose';
import axios from 'axios';
import config from '../../config';

/**
 * @file This service is responsible for providing the system's health check endpoint logic. It consolidates the health status of itself and its critical dependencies into a single, comprehensive report.
 * @namespace GlyphWeaver.Backend.System.Application.Services
 */

type ServiceStatus = 'UP' | 'DOWN';
type OverallStatus = 'UP' | 'DEGRADED' | 'DOWN';

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  details: string;
}

export interface SystemHealth {
  overallStatus: OverallStatus;
  timestamp: string;
  services: ServiceHealth[];
}

/**
 * @class SystemHealthService
 * @description Consolidates the health status of this service and its critical dependencies.
 * @pattern ServiceLayerPattern
 */
export class SystemHealthService {
  private readonly downstreamServices: { name: string; url: string }[];

  constructor() {
    this.downstreamServices = config.DOWNSTREAM_SERVICES;
  }
  
  /**
   * Checks the health of a single downstream service.
   * @param service - The service configuration to check.
   * @returns A promise resolving to the service's health status.
   */
  private async checkServiceHealth(service: { name: string; url: string }): Promise<ServiceHealth> {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      if (response.status >= 200 && response.status < 300) {
        return { name: service.name, status: 'UP', details: 'Service is responsive.' };
      }
      return { name: service.name, status: 'DOWN', details: `Received status code ${response.status}.` };
    } catch (error: any) {
      return { name: service.name, status: 'DOWN', details: error.message || 'Failed to connect.' };
    }
  }

  /**
   * Retrieves the consolidated health status of the entire backend ecosystem.
   * @returns {Promise<SystemHealth>} A promise that resolves to the full system health report.
   */
  public async getSystemHealth(): Promise<SystemHealth> {
    const healthReport: SystemHealth = {
      overallStatus: 'UP',
      timestamp: new Date().toISOString(),
      services: [],
    };

    // 1. Check local MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbHealth: ServiceHealth = { name: 'MongoDB', status: 'DOWN', details: 'Disconnected' };
    if (dbState === 1) { // 1 for connected
      dbHealth.status = 'UP';
      dbHealth.details = 'Connection is healthy.';
    } else if (dbState === 2) { // 2 for connecting
      dbHealth.details = 'Currently connecting...';
    }
    healthReport.services.push(dbHealth);

    // 2. Concurrently check downstream services
    const downstreamChecks = this.downstreamServices.map(service => this.checkServiceHealth(service));
    const downstreamResults = await Promise.all(downstreamChecks);
    healthReport.services.push(...downstreamResults);

    // 3. Determine overall status
    const isDbDown = dbHealth.status === 'DOWN';
    const areAnyServicesDown = healthReport.services.some(s => s.status === 'DOWN');

    if (isDbDown) {
      healthReport.overallStatus = 'DOWN';
    } else if (areAnyServicesDown) {
      healthReport.overallStatus = 'DEGRADED';
    }

    return healthReport;
  }
}
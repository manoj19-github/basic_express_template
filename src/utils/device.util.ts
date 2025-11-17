// utils/device.utils.ts
import { v4 as uuidv4 } from 'uuid';
import crypto from 'node:crypto';
import { Request } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';

export class DeviceUtils {
  static generateDeviceId(req: Request ): string {
    // Combine multiple factors for better uniqueness
    const factors = [
      req.get('User-Agent') || 'unknown',
      req.get('Accept-Language') || 'unknown',
      req.get('Accept-Encoding') || 'unknown',
      req.ip || 'unknown',
      Date.now().toString()
    ];

    const fingerprint = factors.join('|');
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  }

  static generatePersistentDeviceId(): string {
    // For mobile apps - store this in device storage
    return `device_${uuidv4()}`;
  }

  static getDeviceInfo(req: Request): {
    userAgent: string;
    ipAddress: string;
    acceptLanguage: string;
    platform: string;
  } {
    const userAgent = req.get('User-Agent') || 'Unknown';
    let platform = 'Unknown';

    if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';
    else if (userAgent.includes('Windows')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'Mac';
    else if (userAgent.includes('Linux')) platform = 'Linux';

    return {
      userAgent,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      acceptLanguage: req.get('Accept-Language') || 'Unknown',
      platform
    };
  }
}
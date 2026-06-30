import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

export interface CfSecurityMetadata {
  ip: string;
  country: string;
  ray: string;
  userAgent: string;
}

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Read Cloudflare security and bot protection headers
    const cfConnectingIp = request.headers['cf-connecting-ip'] || request.ip || '127.0.0.1';
    const cfCountry = request.headers['cf-ipcountry'] || 'unknown';
    const cfRay = request.headers['cf-ray'] || 'local-ray';
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Parse and store bot protection indicator headers (e.g. Cloudflare Turnstile status or WAF flags)
    const cfVisitor = request.headers['cf-visitor'] ? JSON.parse(request.headers['cf-visitor'] as string) : null;
    
    // Attach metadata securely to request context
    request.cfMetadata = {
      ip: cfConnectingIp,
      country: cfCountry,
      ray: cfRay,
      userAgent,
      scheme: cfVisitor?.scheme || 'http',
    };

    // Log security check summary for monitoring systems
    this.logger.log(
      `[Security Header Check] Route: ${request.url} | IP: ${cfConnectingIp} | Country: ${cfCountry} | Ray: ${cfRay}`
    );

    return next.handle();
  }
}

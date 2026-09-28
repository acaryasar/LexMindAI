import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Demo hesaplari (User.isDemo = true) herkese acik giris sayfasindaki
 * "demo ile giris" butonlariyla oturum acabilir. Bu hesaplar paylasilan
 * demo verisi uzerinde calistigi icin, baska bir ziyaretcinin ekledigi/
 * sildigi veriler yuzunden demo deneyiminin bozulmamasi ve API
 * maliyeti/aciliş riski olusturacak islemlerin (silme, guncelleme, AI
 * cagrilari vb.) engellenmesi amaciyla, demo kullanicilar icin sadece
 * okuma (GET/HEAD/OPTIONS) ve oturum yonetimi (logout/refresh) islemlerine
 * izin verilir; diger tum yazma istekleri 403 ile reddedilir.
 */
const DEMO_ALLOWED_MUTATING_PATHS = ['/auth/logout', '/auth/refresh'];

@Injectable()
export class DemoModeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = String(request.method || 'GET').toUpperCase();
    const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (user?.isDemo && isMutating) {
      const path: string = request.originalUrl || request.url || '';
      const isAllowed = DEMO_ALLOWED_MUTATING_PATHS.some((allowedPath) =>
        path.includes(allowedPath),
      );

      if (!isAllowed) {
        throw new ForbiddenException(
          'Bu bir demo hesabıdır. Demo modunda veri ekleme, düzenleme veya silme işlemleri devre dışıdır.',
        );
      }
    }

    return next.handle();
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { StorageService, ThemeService } from 'src/app/shared/service';
import { AuthService } from '../../authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  constructor(
    private storage: StorageService,
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  handleThemeUpdate(node: any): void {
    this.storage.saveInStorage('update-theme', 'true');
    const themeType = node.selected_theme === 2 ? 'custom' : 'default';
    this.storage.saveInStorage('theme-type', themeType);
    this.themeService.setTheme(node.theme);
  }

  handleCiThemes(ciThemes: any[]): void {
    const ciThemeName = ciThemes.length > 0 ? ciThemes[0].name : 'fairfood';
    this.storage.saveInStorage('ci_theme', ciThemeName);
  }

  handleDefaultTheme(): void {
    this.themeService.setTheme();
    this.storage.saveInStorage('theme-type', 'default');
    this.storage.saveInStorage('update-theme', 'false');
  }

  handleNodeWithoutTheme(): void {
    this.storage.saveInStorage('memberType', '1');
    this.storage.saveInStorage('ci_theme', 'fairfood');
    this.handleDefaultTheme();
  }

  handleDashboardTheme(ciThemes: any[]): void {
    if (ciThemes.length > 0) {
      this.storage.saveInStorage('theme', ciThemes[0].name);
    } else {
      this.storage.saveInStorage('theme', 'fairfood');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
